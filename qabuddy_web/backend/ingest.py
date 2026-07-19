"""Ingestion worker — parse · chunk · embed · upsert.

Walks ./data/<source>/... , parses md/txt/csv/json/pdf, chunks, embeds
(dense + sparse), and upserts into Qdrant with a `source` payload matching
the UI's knowledge-base ids so scope filtering works.

Run:  python ingest.py            (incremental)
      python ingest.py --reset    (wipe + re-ingest)
"""
import os
import sys
import glob
import uuid
import csv

from qdrant_client.http import models as qm

from embeddings import embed_dense, embed_sparse
from store import ensure_collection, COLLECTION

DATA_DIR = os.getenv("DATA_DIR", os.path.join(os.path.dirname(__file__), "data"))

# top-level folder under data/ -> UI source id
SOURCE_MAP = {
    "selenium": "selenium", "playwright": "playwright", "vwo": "vwo",
    "testcases": "testcases", "jira": "jira", "docs": "docs",
    "figma": "figma", "meetings": "meetings", "lucid": "lucid",
    "requirements": "requirements", "jenkins": "jenkins", "swagger": "swagger",
}

CHUNK_CHARS = 1100
CHUNK_OVERLAP = 180


def read_text(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    try:
        if ext == ".pdf":
            from pypdf import PdfReader
            return "\n".join((p.extract_text() or "") for p in PdfReader(path).pages)
        if ext in (".csv",):
            rows = []
            with open(path, newline="", encoding="utf-8", errors="ignore") as f:
                for r in csv.reader(f):
                    rows.append(" | ".join(r))
            return "\n".join(rows)
        with open(path, encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception as e:
        print(f"  ! skip {path}: {e}")
        return ""


def chunk(text: str):
    text = text.strip()
    if not text:
        return []
    out, i = [], 0
    while i < len(text):
        out.append(text[i:i + CHUNK_CHARS])
        i += CHUNK_CHARS - CHUNK_OVERLAP
    return out


def source_of(rel_path: str) -> str:
    top = rel_path.replace("\\", "/").split("/")[0].lower()
    return SOURCE_MAP.get(top, "docs")


def gather():
    docs = []
    for path in glob.glob(os.path.join(DATA_DIR, "**", "*"), recursive=True):
        if not os.path.isfile(path):
            continue
        if os.path.splitext(path)[1].lower() not in (".md", ".txt", ".csv", ".json", ".pdf"):
            continue
        rel = os.path.relpath(path, DATA_DIR)
        text = read_text(path)
        for idx, ch in enumerate(chunk(text)):
            docs.append({
                "text": ch,
                "source": source_of(rel),
                "path": rel.replace("\\", "/"),
                "chunk": idx,
            })
    return docs


def main():
    reset = "--reset" in sys.argv
    client = ensure_collection(reset=reset)
    docs = gather()
    if not docs:
        print("No documents found under", DATA_DIR)
        return
    print(f"Embedding {len(docs)} chunks…")
    texts = [d["text"] for d in docs]
    dense = embed_dense(texts)
    sparse = embed_sparse(texts)

    points = []
    for d, dv, sv in zip(docs, dense, sparse):
        points.append(qm.PointStruct(
            id=str(uuid.uuid4()),
            vector={"dense": dv, "sparse": qm.SparseVector(indices=sv["indices"], values=sv["values"])},
            payload=d,
        ))
    client.upsert(collection_name=COLLECTION, points=points)
    by_src = {}
    for d in docs:
        by_src[d["source"]] = by_src.get(d["source"], 0) + 1
    print(f"Upserted {len(points)} chunks into '{COLLECTION}'.")
    for s, n in sorted(by_src.items()):
        print(f"  {s:14s} {n}")


if __name__ == "__main__":
    main()
