import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// import the lib file directly — avoids pdf-parse's index.js debug harness
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/ollama";
import { ChatGroq } from "@langchain/groq";
import { ChromaClient } from "chromadb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const int = (v, d) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : d);

const CFG = {
  dataDir: path.resolve(__dirname, process.env.DATA_DIR || "../data"),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  embedModel: process.env.EMBED_MODEL || "nomic-embed-text",
  chromaUrl: process.env.CHROMA_URL || "http://localhost:8000",
  collection: process.env.CHROMA_COLLECTION || "prd_documents",
  groqKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  chunkSize: int(process.env.CHUNK_SIZE, 1000),
  chunkOverlap: int(process.env.CHUNK_OVERLAP, 150),
  topK: int(process.env.TOP_K, 4),
};

// ---- shared pipeline status, surfaced to the UI ----
export const status = {
  pdfDetected: false,
  pdfName: null,
  extractedChars: 0,
  chunkCount: 0,
  embedModel: CFG.embedModel,
  groqModel: CFG.groqModel,
  chunkSize: CFG.chunkSize,
  chunkOverlap: CFG.chunkOverlap,
  topK: CFG.topK,
  chromaStatus: "unknown", // unknown | connected | error
  ingesting: false,
  indexed: false,
  ingestedAt: null,
  error: null,
};

const embeddings = new OllamaEmbeddings({
  model: CFG.embedModel,
  baseUrl: CFG.ollamaBaseUrl,
});

const chromaUrl = new URL(CFG.chromaUrl);
const chroma = new ChromaClient({
  host: chromaUrl.hostname,
  port: Number(chromaUrl.port) || (chromaUrl.protocol === "https:" ? 443 : 80),
  ssl: chromaUrl.protocol === "https:",
});

// list all PDFs available in the data folder (filenames only)
export function listPdfs() {
  if (!fs.existsSync(CFG.dataDir)) return [];
  return fs
    .readdirSync(CFG.dataDir)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort();
}

// resolve which PDF to ingest: a requested filename, else the active one, else first
function resolvePdf(fileName) {
  const pdfs = listPdfs();
  if (!pdfs.length) return null;
  const wanted = fileName || status.pdfName;
  if (wanted && pdfs.includes(path.basename(wanted))) {
    return path.join(CFG.dataDir, path.basename(wanted));
  }
  return path.join(CFG.dataDir, pdfs[0]);
}

async function checkChroma() {
  try {
    await chroma.heartbeat();
    status.chromaStatus = "connected";
  } catch (e) {
    status.chromaStatus = "error";
    throw new Error(`ChromaDB not reachable at ${CFG.chromaUrl}: ${e.message}`);
  }
}

// Full ingestion: detect PDF -> extract -> chunk -> embed (nomic) -> store in Chroma
export async function ingest(fileName) {
  if (status.ingesting) return status;
  status.ingesting = true;
  status.indexed = false;
  status.error = null;
  try {
    const pdfPath = resolvePdf(fileName);
    if (!pdfPath) {
      status.pdfDetected = false;
      throw new Error(`No PDF found in ${CFG.dataDir}`);
    }
    status.pdfDetected = true;
    status.pdfName = path.basename(pdfPath);

    // 1. extract text
    const parsed = await pdfParse(fs.readFileSync(pdfPath));
    const text = (parsed.text || "").trim();
    status.extractedChars = text.length;
    if (!text) throw new Error("PDF produced no extractable text");

    // 2. chunk
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: CFG.chunkSize,
      chunkOverlap: CFG.chunkOverlap,
    });
    const docs = await splitter.createDocuments([text]);
    status.chunkCount = docs.length;

    // 3. embed with nomic-embed-text
    const texts = docs.map((d) => d.pageContent);
    const vectors = await embeddings.embedDocuments(texts);

    // 4. (re)create Chroma collection and store — idempotent on re-ingest
    await checkChroma();
    try {
      await chroma.deleteCollection({ name: CFG.collection });
    } catch {
      /* collection may not exist yet */
    }
    const collection = await chroma.createCollection({
      name: CFG.collection,
      metadata: { source: status.pdfName },
      embeddingFunction: null, // we pass precomputed nomic vectors
    });
    await collection.add({
      ids: docs.map((_, i) => `chunk_${i}`),
      embeddings: vectors,
      documents: texts,
      metadatas: docs.map((_, i) => ({ source: status.pdfName, chunk: i })),
    });

    status.indexed = true;
    status.ingestedAt = new Date().toISOString();
    return status;
  } catch (e) {
    status.error = e.message;
    throw e;
  } finally {
    status.ingesting = false;
  }
}

// Query: embed question -> top-K similarity search -> Groq answer from context
export async function query(question) {
  if (!status.indexed) throw new Error("Index not ready — ingest a PDF first");

  const collection = await chroma.getCollection({
    name: CFG.collection,
    embeddingFunction: null,
  });
  const qVector = await embeddings.embedQuery(question);
  const res = await collection.query({
    queryEmbeddings: [qVector],
    nResults: CFG.topK,
  });

  // Chroma returns distance (lower = closer). Normalize to a 0..1 similarity.
  const docsArr = res.documents?.[0] || [];
  const distArr = res.distances?.[0] || [];
  const chunks = docsArr.map((content, i) => {
    const distance = distArr[i] ?? 0;
    return {
      rank: i + 1,
      content,
      distance: Number(distance.toFixed(4)),
      similarity: Number((1 / (1 + distance)).toFixed(4)),
    };
  });

  const context = chunks
    .map((c) => `[Chunk ${c.rank}]\n${c.content}`)
    .join("\n\n---\n\n");

  const llm = new ChatGroq({
    apiKey: CFG.groqKey,
    model: CFG.groqModel,
    temperature: 0.2,
  });

  const system =
    "You are a precise assistant. Answer the user's question using ONLY the " +
    "provided context chunks. If the answer is not in the context, say you " +
    "cannot find it in the document. Be concise.";
  const prompt = `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;

  const result = await llm.invoke([
    { role: "system", content: system },
    { role: "user", content: prompt },
  ]);

  return {
    question,
    retrievedCount: chunks.length,
    chunks,
    answer:
      typeof result.content === "string"
        ? result.content
        : String(result.content),
    model: CFG.groqModel,
  };
}

export { CFG };
