"""Qdrant store — embedded local mode (no server/Docker needed).

One collection, named vectors: `dense` (cosine) + `sparse` (bm25).
Persistent on disk at ./qdrant_storage so ingestion survives restarts.
"""
import os
from qdrant_client import QdrantClient
from qdrant_client.http import models as qm

from embeddings import DENSE_SIZE

QDRANT_PATH = os.getenv("QDRANT_PATH", os.path.join(os.path.dirname(__file__), "qdrant_storage"))
COLLECTION = os.getenv("QDRANT_COLLECTION", "qabuddy")

_client = None


def get_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(path=QDRANT_PATH)
    return _client


def ensure_collection(reset: bool = False):
    c = get_client()
    exists = c.collection_exists(COLLECTION)
    if exists and reset:
        c.delete_collection(COLLECTION)
        exists = False
    if not exists:
        c.create_collection(
            collection_name=COLLECTION,
            vectors_config={"dense": qm.VectorParams(size=DENSE_SIZE, distance=qm.Distance.COSINE)},
            sparse_vectors_config={"sparse": qm.SparseVectorParams()},
        )
    return c
