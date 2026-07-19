"""
Shared embedding + rerank models (fastembed · ONNX on CPU).

dense  = BAAI/bge-small-en-v1.5  (384-d)   — semantic vectors
sparse = Qdrant/bm25                        — lexical/keyword vectors
rerank = BAAI/bge-reranker-base             — cross-encoder, keep top-K

Swap DENSE_MODEL -> 'BAAI/bge-m3' style models when running on GPU / more RAM
to match the reference architecture exactly.
"""
import os
from functools import lru_cache

from fastembed import TextEmbedding, SparseTextEmbedding
from fastembed.rerank.cross_encoder import TextCrossEncoder

DENSE_MODEL = os.getenv("DENSE_MODEL", "BAAI/bge-small-en-v1.5")
SPARSE_MODEL = os.getenv("SPARSE_MODEL", "Qdrant/bm25")
RERANK_MODEL = os.getenv("RERANK_MODEL", "Xenova/ms-marco-MiniLM-L-6-v2")
DENSE_SIZE = int(os.getenv("DENSE_SIZE", "384"))


@lru_cache(maxsize=1)
def _dense():
    return TextEmbedding(DENSE_MODEL)


@lru_cache(maxsize=1)
def _sparse():
    return SparseTextEmbedding(SPARSE_MODEL)


@lru_cache(maxsize=1)
def _reranker():
    return TextCrossEncoder(RERANK_MODEL)


def embed_dense(texts):
    return [v.tolist() for v in _dense().embed(list(texts))]


def embed_sparse(texts):
    """Return list of {'indices': [...], 'values': [...]} for Qdrant sparse vectors."""
    out = []
    for s in _sparse().embed(list(texts)):
        out.append({"indices": s.indices.tolist(), "values": s.values.tolist()})
    return out


def rerank(query, documents):
    """Return list of scores aligned with `documents`."""
    return list(_reranker().rerank(query, list(documents)))


def warmup():
    embed_dense(["warm up"])
    embed_sparse(["warm up"])
    rerank("warm up", ["warm up doc"])
