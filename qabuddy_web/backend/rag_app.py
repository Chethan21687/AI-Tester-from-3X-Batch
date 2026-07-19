"""QABuddy answer service — FastAPI.

Query path:  question -> hybrid retrieve (dense + sparse, RRF) -> rerank -> Groq -> cited answer.
Matches the reference architecture (chat-ui -> api -> qdrant -> models -> LLM).
"""
import os
import time
import httpx
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from qdrant_client.http import models as qm

from embeddings import embed_dense, embed_sparse, rerank, warmup
from store import get_client, COLLECTION

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

RETRIEVE_K = int(os.getenv("RETRIEVE_K", "12"))   # per-branch candidates
TOP_K = int(os.getenv("TOP_K", "5"))              # chunks kept after rerank

app = FastAPI(title="QABuddy Answer Service", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    scope: Optional[List[str]] = None
    system: Optional[str] = None


@app.on_event("startup")
def _startup():
    try:
        warmup()
    except Exception as e:
        print("warmup failed:", e)


@app.get("/health")
def health():
    try:
        n = get_client().count(COLLECTION, exact=True).count
    except Exception:
        n = None
    return {"status": "ok", "collection": COLLECTION, "chunks": n, "model": GROQ_MODEL}


def _scope_filter(scope):
    if not scope:
        return None
    return qm.Filter(must=[qm.FieldCondition(key="source", match=qm.MatchAny(any=list(scope)))])


def hybrid_retrieve(query: str, scope, k: int = RETRIEVE_K):
    client = get_client()
    flt = _scope_filter(scope)
    dv = embed_dense([query])[0]
    sv = embed_sparse([query])[0]

    dense_hits = client.query_points(
        COLLECTION, query=dv, using="dense", limit=k,
        with_payload=True, query_filter=flt,
    ).points
    sparse_hits = client.query_points(
        COLLECTION, query=qm.SparseVector(indices=sv["indices"], values=sv["values"]),
        using="sparse", limit=k, with_payload=True, query_filter=flt,
    ).points

    # Reciprocal Rank Fusion
    C = 60
    scores, keep = {}, {}
    for hits in (dense_hits, sparse_hits):
        for rank, h in enumerate(hits):
            scores[h.id] = scores.get(h.id, 0.0) + 1.0 / (C + rank)
            keep[h.id] = h
    fused = sorted(keep.values(), key=lambda h: scores[h.id], reverse=True)[:k]
    return fused


def answer(question: str, scope, system: Optional[str]):
    t0 = time.time()
    candidates = hybrid_retrieve(question, scope)
    if not candidates:
        return {"answer": "No indexed content matches the selected sources.", "sources": [], "latency_ms": 0}

    # rerank -> top-K (score once, then sort)
    docs = [c.payload.get("text", "") for c in candidates]
    scores = list(rerank(question, docs))
    order = sorted(range(len(docs)), key=lambda i: scores[i], reverse=True)[:TOP_K]
    top = [candidates[i] for i in order]

    # grounded prompt
    ctx, sources = [], []
    for n, c in enumerate(top, 1):
        p = c.payload
        ref = p.get("path", p.get("source", ""))
        ctx.append(f"[{n}] (source={p.get('source')}, ref={ref})\n{p.get('text','')}")
        sources.append({"label": f"[{n}] {ref}", "type": p.get("source", "doc"), "ref": ref})

    sys_prompt = (system or "You are QA Buddy, a QA knowledge assistant.") + (
        "\n\nAnswer ONLY from the numbered context below. Cite claims with [n]. "
        "If the context does not contain the answer, say so.\n\nCONTEXT:\n" + "\n\n".join(ctx)
    )

    body = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": question},
        ],
        "max_tokens": 1200,
        "temperature": 0.3,
    }
    with httpx.Client(timeout=60) as h:
        r = h.post(GROQ_URL, headers={"Authorization": f"Bearer {GROQ_API_KEY}"}, json=body)
        r.raise_for_status()
        text = r.json()["choices"][0]["message"]["content"].strip()

    return {"answer": text, "sources": sources, "latency_ms": round((time.time() - t0) * 1000)}


@app.post("/chat")
def chat(req: ChatRequest):
    question = next((m.content for m in reversed(req.messages) if m.role == "user"), "")
    return answer(question, req.scope, req.system)


# alias used by the reference diagram
@app.post("/ask")
def ask(req: ChatRequest):
    return chat(req)
