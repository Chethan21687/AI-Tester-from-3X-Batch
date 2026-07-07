# Simple RAG Explorer

Visual, end-to-end demo of a Retrieval-Augmented Generation pipeline:

```
PDF (data/) → text extract → chunk → Nomic embeddings → ChromaDB
                                                            │
                        question → embed → top-4 similarity search
                                                            │
                                    retrieved context → Groq LLM → answer
```

## Stack

| Piece            | Tech                                            |
|------------------|-------------------------------------------------|
| UI               | React + Vite                                    |
| Backend          | Node.js + Express                               |
| Embeddings       | `nomic-embed-text` via **Ollama** (local)       |
| Vector DB        | **ChromaDB** (local server, `/api/v2`)          |
| LLM              | **Groq** — `openai/gpt-oss-120b`                |
| PDF parse        | `pdf-parse`                                     |
| Orchestration    | LangChain (`@langchain/ollama`, `@langchain/groq`, textsplitters) |

## Prerequisites (already set up on this machine)

- Node.js 24, Python 3.14
- Ollama running with the embed model: `ollama pull nomic-embed-text`
- ChromaDB installed: `pip install chromadb`
- Groq API key in `server/.env`

## Run (3 terminals)

```bash
# 1. Vector DB
cd server && chroma run --path ./chroma-data --port 8000

# 2. Backend (auto-ingests the PDF in ../data on startup, then watches it)
cd server && npm install && node --env-file=.env index.js

# 3. UI
cd client && npm install && npm run dev
```

Open the URL Vite prints (e.g. http://localhost:5173).

## How ingestion works

You have **three ways** to load a document — no need to manually place a file each time:

1. **Upload in the UI** — drag-and-drop a PDF onto the dropzone (or click to browse).
   It is saved to `data/`, ingested, and made the active document.
2. **Pick from the dropdown** — the UI lists every PDF already in `data/`; selecting one
   re-ingests it. Delete a document with the ✕ button.
3. **Drop a file in `data/`** — the backend **watches the folder** (chokidar) and
   auto-ingests on add/change.

On startup the backend auto-ingests the active/first PDF, so it works out of the box.

## Configuration — `server/.env`

```
GROQ_API_KEY=...            # your Groq key
GROQ_MODEL=openai/gpt-oss-120b
OLLAMA_BASE_URL=http://localhost:11434
EMBED_MODEL=nomic-embed-text
CHROMA_URL=http://localhost:8000
CHROMA_COLLECTION=prd_documents
DATA_DIR=../data
PORT=5174
CHUNK_SIZE=1000             # tune chunk length
CHUNK_OVERLAP=150           # tune overlap between chunks
TOP_K=4                     # how many chunks to retrieve
```

## API

| Method | Route            | Purpose                                                     |
|--------|------------------|-------------------------------------------------------------|
| GET    | `/api/status`    | Pipeline state: PDF, chunk count, Chroma status, …          |
| GET    | `/api/documents` | List PDFs in `data/` + the active one                       |
| POST   | `/api/upload`    | multipart `file` → save PDF to `data/` and ingest it        |
| POST   | `/api/ingest`    | Force re-ingest; optional `{ "file": "name.pdf" }` to select|
| POST   | `/api/delete`    | `{ "file": "name.pdf" }` → remove PDF from `data/`          |
| POST   | `/api/query`     | `{ "question": "…" }` → `{ chunks[], answer, … }`           |

## Notes

- **`openai/gpt-oss-120b`** is Groq's hosted GPT-OSS 120B — the closest available
  equivalent to the requested "OpenGPT-1.2-120B".
- Chroma returns a **distance** (lower = closer); the UI also shows a normalized
  `similarity = 1 / (1 + distance)`.
- The Vite proxy targets `127.0.0.1:5174` (not `localhost`) because on Windows
  `localhost` resolves to IPv6 `::1`, where the IPv4-bound Express server isn't listening.
