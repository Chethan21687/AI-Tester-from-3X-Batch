# QA Buddy — Hybrid RAG backend (FastAPI + Qdrant + ONNX)

Real answer service behind the web app. Query path:

```
question → hybrid retrieve (dense bge-small + sparse bm25, RRF, Qdrant)
        → rerank (cross-encoder, ONNX/CPU) → Groq → cited answer
```

- `embeddings.py` — dense/sparse/rerank models via fastembed (ONNX on CPU)
- `store.py` — Qdrant embedded local mode (no Docker); one collection, named dense+sparse vectors
- `ingest.py` — parse `data/<source>/…` (md/txt/csv/json/pdf) · chunk · embed · upsert
- `rag_app.py` — FastAPI `/chat`, `/ask`, `/health`

## Run

```bash
python -m venv .venv && . .venv/Scripts/activate     # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt

python ingest.py --reset                             # index data/ into Qdrant
GROQ_API_KEY=gsk_... python -m uvicorn rag_app:app --host 127.0.0.1 --port 8000
```

## Add real sources
Drop files under `data/<source>/` (source ∈ selenium, playwright, vwo, testcases, jira,
docs, figma, meetings, lucid, requirements, jenkins, swagger), then rerun `python ingest.py`.

## Expose to the web app
Tunnel `:8000` publicly, then set `RAG_BACKEND_URL` in the Vercel project to that URL and redeploy.
A named tunnel / static domain keeps the URL stable across restarts.

## Model swap (match reference exactly)
On GPU / more RAM: `DENSE_MODEL=BAAI/bge-m3`, `RERANK_MODEL=BAAI/bge-reranker-base` (or v2-m3),
`DENSE_SIZE=1024`. Defaults are CPU-friendly (bge-small / bm25 / MiniLM).
