"""MongoDB connection helpers for the Recruiter Tracker backend."""

import os

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://127.0.0.1:27017")
DB_NAME = os.environ.get("MONGO_DB", "recruiter_tracker")

_client: MongoClient | None = None


def get_db() -> Database:
    """Return a lazily-created MongoDB client/database connection."""
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    return _client[DB_NAME]


def get_candidates_collection() -> Collection:
    """Return the candidates collection."""
    db = get_db()
    coll = db["candidates"]
    coll.create_index([("phone", 1), ("email", 1)], unique=True)
    coll.create_index([("name", 1)])
    coll.create_index([("recruiter", 1)])
    return coll


def get_recruiters_collection() -> Collection:
    """Return the recruiters collection."""
    return get_db()["recruiters"]
