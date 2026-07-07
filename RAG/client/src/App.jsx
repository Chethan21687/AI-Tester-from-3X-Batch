import { useEffect, useState, useCallback, useRef } from "react";

const STAGES = [
  "PDF detected",
  "Text extracted",
  "Chunked",
  "Embedded (Nomic)",
  "Stored in ChromaDB",
];

const SAMPLE_QUESTIONS = [
  "What is this document about?",
  "What are the key requirements?",
  "What are the security requirements?",
  "List the non-functional requirements.",
];

function stageState(status, i) {
  if (!status) return "";
  const s = status;
  const reached = [
    s.pdfDetected,
    s.extractedChars > 0,
    s.chunkCount > 0,
    s.chunkCount > 0 && s.chromaStatus === "connected",
    s.indexed,
  ];
  if (reached[i]) return "done";
  if (s.ingesting && (i === 0 || reached[i - 1])) return "active";
  return "";
}

export default function App() {
  const [status, setStatus] = useState(null);
  const [docs, setDocs] = useState({ documents: [], active: null });
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [querying, setQuerying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const loadStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/status");
      setStatus(await r.json());
    } catch {
      /* keep last */
    }
  }, []);

  const loadDocs = useCallback(async () => {
    try {
      const r = await fetch("/api/documents");
      setDocs(await r.json());
    } catch {
      /* keep last */
    }
  }, []);

  useEffect(() => {
    loadStatus();
    loadDocs();
    const id = setInterval(() => {
      loadStatus();
      loadDocs();
    }, status?.ingesting ? 1200 : status?.indexed ? 5000 : 1800);
    return () => clearInterval(id);
  }, [loadStatus, loadDocs, status?.ingesting, status?.indexed]);

  const selectDoc = async (name) => {
    if (!name || name === docs.active) return;
    setError(null);
    setResult(null);
    await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: name }),
    });
    loadStatus();
    loadDocs();
  };

  const reingest = async () => {
    setError(null);
    await fetch("/api/ingest", { method: "POST" });
    loadStatus();
  };

  const uploadFiles = async (fileList) => {
    const file = [...(fileList || [])].find((f) =>
      f.name.toLowerCase().endsWith(".pdf")
    );
    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }
    setError(null);
    setResult(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Upload failed");
      await loadStatus();
      await loadDocs();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deleteDoc = async (name) => {
    if (!confirm(`Remove "${name}" from the data folder?`)) return;
    setError(null);
    await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: name }),
    });
    setResult(null);
    loadStatus();
    loadDocs();
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const submit = async (e) => {
    e?.preventDefault();
    const q = question.trim();
    if (!q || querying) return;
    setQuerying(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Query failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setQuerying(false);
    }
  };

  const s = status;
  const ready = s?.indexed && !s?.ingesting;

  return (
    <div className="app">
      <div className="header">
        <h1>🔎 Simple RAG Explorer</h1>
        <p>
          PDF → Text → Chunks → Nomic embeddings → ChromaDB → Similarity search →
          Groq answer. Pick a document or upload a new one below.
        </p>
      </div>

      {/* pipeline strip */}
      <div className="pipeline">
        {STAGES.map((label, i) => (
          <div key={label} className={`step ${stageState(s, i)}`}>
            <span className="dot" />
            {label}
          </div>
        ))}
        {s?.ingesting && <div className="step active"><span className="dot" />working…</div>}
      </div>

      {/* document manager */}
      <div className="card full">
        <h2>Document source</h2>
        <div className="doc-manager">
          <div className="doc-select">
            <label className="mini-label">Active document</label>
            <div className="select-row">
              <select
                value={docs.active || ""}
                onChange={(e) => selectDoc(e.target.value)}
                disabled={s?.ingesting || !docs.documents.length}
              >
                {!docs.documents.length && <option value="">No PDFs yet</option>}
                {docs.documents.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {docs.active && (
                <button
                  className="ghost danger"
                  title="Remove from data folder"
                  onClick={() => deleteDoc(docs.active)}
                  disabled={s?.ingesting}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="doc-count">
              {docs.documents.length} PDF{docs.documents.length === 1 ? "" : "s"} in
              data folder · <button className="link" onClick={reingest}>re-ingest</button>
            </div>
          </div>

          <div
            className={`dropzone ${dragOver ? "over" : ""} ${uploading ? "busy" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => uploadFiles(e.target.files)}
            />
            {uploading ? (
              <span>
                <span className="spin" /> Uploading & ingesting…
              </span>
            ) : (
              <span>
                <b>⤒ Drop a PDF here</b> or click to upload
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid">
        {/* ingestion status */}
        <div className="card">
          <h2>Ingestion status</h2>
          <div className="kv">
            <span className="k">PDF</span>
            <span className="v mono">{s?.pdfName || "—"}</span>
          </div>
          <div className="kv">
            <span className="k">ChromaDB</span>
            <span className="v">
              <ChromaBadge status={s?.chromaStatus} />
            </span>
          </div>
          <div className="kv">
            <span className="k">Index</span>
            <span className="v">
              {s?.ingesting ? (
                <span className="badge wait">
                  <span className="spin" /> ingesting…
                </span>
              ) : s?.indexed ? (
                <span className="badge ok">ready</span>
              ) : (
                <span className="badge wait">not ready</span>
              )}
            </span>
          </div>
          <div className="kv">
            <span className="k">Embedding model</span>
            <span className="v mono">{s?.embedModel || "—"}</span>
          </div>
          <div className="kv">
            <span className="k">LLM (Groq)</span>
            <span className="v mono">{s?.groqModel || "—"}</span>
          </div>
          {s?.error && <div className="error-box">⚠ {s.error}</div>}
        </div>

        {/* metrics */}
        <div className="card">
          <h2>Document metrics</h2>
          <div className="metrics">
            <div className="metric">
              <div className="n">{s?.chunkCount ?? 0}</div>
              <div className="l">Chunks</div>
            </div>
            <div className="metric">
              <div className="n">{(s?.extractedChars ?? 0).toLocaleString()}</div>
              <div className="l">Chars extracted</div>
            </div>
            <div className="metric">
              <div className="n">{s?.topK ?? 4}</div>
              <div className="l">Top-K retrieved</div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div className="kv">
              <span className="k">Chunk size / overlap</span>
              <span className="v mono">
                {s?.chunkSize ?? "—"} / {s?.chunkOverlap ?? "—"}
              </span>
            </div>
            <div className="kv">
              <span className="k">Last ingested</span>
              <span className="v mono">
                {s?.ingestedAt ? new Date(s.ingestedAt).toLocaleTimeString() : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* query */}
        <div className="card full">
          <h2>Ask a question about the PDF</h2>
          <form className="query-row" onSubmit={submit}>
            <input
              type="text"
              placeholder={
                ready ? "e.g. What are the key requirements?" : "Waiting for index…"
              }
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!ready || querying}
            />
            <button className="primary" type="submit" disabled={!ready || querying}>
              {querying ? <span className="spin" /> : "Ask"}
            </button>
          </form>
          <div className="chips">
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                className="chip"
                disabled={!ready || querying}
                onClick={() => setQuestion(q)}
              >
                {q}
              </button>
            ))}
          </div>
          <div className="hint">
            Retrieves the top {s?.topK ?? 4} matching chunks from ChromaDB, then sends
            them as context to Groq.
          </div>
          {error && <div className="error-box">⚠ {error}</div>}
        </div>

        {/* retrieved chunks */}
        <div className="card full">
          <h2>
            Retrieved chunks
            {result ? ` — ${result.retrievedCount} of top ${s?.topK ?? 4}` : ""}
          </h2>
          {!result && (
            <div className="answer empty">Ask a question to see matches.</div>
          )}
          {result?.chunks.map((c) => (
            <div className="chunk" key={c.rank}>
              <div className="chunk-head">
                <span className="rank">#{c.rank}</span>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{ width: `${Math.round(c.similarity * 100)}%` }}
                  />
                </div>
                <div className="scores">
                  <span className="score">
                    similarity <b>{c.similarity}</b>
                  </span>
                  <span className="score">distance {c.distance}</span>
                </div>
              </div>
              <div className="chunk-body">{c.content}</div>
            </div>
          ))}
        </div>

        {/* answer */}
        <div className="card full">
          <h2>AI-generated answer {result?.model ? `(${result.model})` : ""}</h2>
          {querying ? (
            <div className="answer empty">
              <span className="spin" /> Generating from retrieved context…
            </div>
          ) : result ? (
            <div className="answer">{result.answer}</div>
          ) : (
            <div className="answer empty">The grounded answer will appear here.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChromaBadge({ status }) {
  if (status === "connected") return <span className="badge ok">connected</span>;
  if (status === "error") return <span className="badge err">error</span>;
  return <span className="badge wait">unknown</span>;
}
