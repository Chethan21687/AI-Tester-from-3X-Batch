"""Recruiter Tracker API — FastAPI backend backed by MongoDB.

Endpoints:
  POST /api/upload        — Upload the daily Excel export, upsert candidate rows
  GET  /api/recruiters    — List all recruiters (with optional per-recruiter stats)
  POST /api/recruiters    — Add a new recruiter
  DELETE /api/recruiters/{id} — Remove a recruiter (keeps their historical data)
  GET  /api/stats         — Aggregate stats per recruiter
  GET  /api/candidates    — Candidate list (filter by recruiter / date)
"""

from __future__ import annotations

import re
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from pydantic import BaseModel

from .database import get_candidates_collection, get_recruiters_collection, get_status_logs_collection
from .excel_parser import parse_workbook

app = FastAPI(title="Recruiter Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------

class RecruiterIn(BaseModel):
    name: str
    email: str = ""


class CandidateOut(BaseModel):
    name: str
    phone: str = ""
    email: str = ""
    status: str = ""
    client: str = ""
    recruiter: str = ""
    date: str = ""
    total_experience: str = ""
    relevant_experience: str = ""
    skill: str = ""
    notice_period: str = ""
    current_location: str = ""
    preferred_location: str = ""
    current_ctc: str = ""
    expected_ctc: str = ""
    education: str = ""
    updated_at: str = ""


# ---------- Serialization helpers ----------

def recruiter_to_dict(doc: dict) -> dict:
    return {"id": str(doc["_id"]), "name": doc.get("name", ""), "email": doc.get("email", "")}


def candidate_to_dict(doc: dict) -> dict:
    out = CandidateOut(
        name=doc.get("name", ""),
        phone=doc.get("phone", ""),
        email=doc.get("email", ""),
        status=doc.get("status", ""),
        client=doc.get("client", ""),
        recruiter=doc.get("recruiter", ""),
        date=doc.get("date", ""),
        total_experience=doc.get("total_experience", ""),
        relevant_experience=doc.get("relevant_experience", ""),
        skill=doc.get("skill", ""),
        notice_period=doc.get("notice_period", ""),
        current_location=doc.get("current_location", ""),
        preferred_location=doc.get("preferred_location", ""),
        current_ctc=doc.get("current_ctc", ""),
        expected_ctc=doc.get("expected_ctc", ""),
        education=doc.get("education", ""),
        updated_at=doc.get("updated_at", ""),
    ).model_dump()
    out["id"] = str(doc["_id"])
    return out


# ---------- Upload ----------

@app.post("/api/upload")
async def upload_excel(file: UploadFile = File(...)):
    """Accept the daily Excel export and upsert all candidate rows."""
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        records = parse_workbook(contents)
    except Exception as exc:  # noqa: BLE001 - surface any parsing failure clearly
        raise HTTPException(status_code=400, detail=f"Could not parse Excel file: {exc}") from exc

    if not records:
        raise HTTPException(status_code=400, detail="No valid candidate rows found (need Name + Recruiters columns)")

    # --- Duplicate validation (intra-file) ---
    # Same candidate (phone + email) appearing more than once in the file is a
    # data-entry error: reject the whole file so nothing gets written half-way.
    seen_identities: dict = {}
    duplicate_rows: list[str] = []
    for rec in records:
        identity = rec["identity"]
        first = seen_identities.get(identity)
        if first is not None:
            duplicate_rows.append(
                f"'{rec['name']}' duplicates '{first}' "
                f"(phone {rec['phone'] or '—'}, email {rec['email'] or '—'})"
            )
        else:
            seen_identities[identity] = rec["name"]

    if duplicate_rows:
        raise HTTPException(
            status_code=400,
            detail=(
                "Duplicate rows found in the uploaded file: "
                + "; ".join(duplicate_rows)
                + ". Remove the duplicates and re-upload."
            ),
        )

    candidates = get_candidates_collection()

    # --- Cross-recruiter warnings ---
    # Identities already in the DB under a different recruiter are reported,
    # not blocked: a candidate may legitimately move between recruiters.
    transfer_warnings: list[dict] = []
    known_identities = {
        identity: doc["recruiter"]
        for identity, doc in (
            (rec["identity"], candidates.find_one({"identity": rec["identity"]}, {"recruiter": 1}))
            for rec in records
        )
        if doc
    }
    for rec in records:
        previous = known_identities.get(rec["identity"])
        if previous and previous != rec["recruiter"]:
            transfer_warnings.append({
                "name": rec["name"],
                "from": previous,
                "to": rec["recruiter"],
            })

    inserted, updated = 0, 0
    for rec in records:
        result = candidates.update_one(
            {"identity": rec["identity"]},
            {"$set": rec},
            upsert=True,
        )
        if result.upserted_id is not None:
            inserted += 1
        else:
            updated += 1

    # Auto-register any recruiter names seen in the upload.
    recruiters = get_recruiters_collection()
    for rec in records:
        name = rec["recruiter"].strip()
        if name and recruiters.find_one({"name": name}) is None:
            recruiters.insert_one({"name": name, "email": "", "auto_created": True})

    return {
        "inserted": inserted,
        "updated": updated,
        "total_rows": len(records),
        "message": f"Uploaded {len(records)} rows ({inserted} new, {updated} updated)",
        "transfer_warnings": transfer_warnings,
    }


# ---------- Recruiters ----------

@app.get("/api/recruiters")
def list_recruiters():
    recruiters = get_recruiters_collection()
    docs = list(recruiters.find().sort("name", 1))
    return [recruiter_to_dict(d) for d in docs]


@app.post("/api/recruiters")
def add_recruiter(body: RecruiterIn):
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Recruiter name is required")
    recruiters = get_recruiters_collection()
    # Case-insensitive duplicate check: "roshini" and "Roshini" are the same person.
    existing = recruiters.find_one({"name": {"$regex": f"^{re.escape(name)}$", "$options": "i"}})
    if existing:
        raise HTTPException(status_code=400, detail=f"Recruiter '{existing['name']}' already exists")
    result = recruiters.insert_one({"name": name, "email": body.email.strip(), "auto_created": False})
    return recruiter_to_dict(recruiters.find_one({"_id": result.inserted_id}))


@app.delete("/api/recruiters/{recruiter_id}")
def delete_recruiter(recruiter_id: str):
    recruiters = get_recruiters_collection()
    try:
        obj_id = ObjectId(recruiter_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid recruiter id")
    result = recruiters.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    return {"deleted": True}


# ---------- Stats ----------

@app.get("/api/stats")
def get_stats():
    """Per-recruiter daily value stats computed over the candidates collection."""
    candidates = get_candidates_collection()
    recruiters = get_recruiters_collection()

    recruiter_names = [r["name"] for r in recruiters.find({}, {"name": 1})]
    recruiter_ids = {r["name"]: str(r["_id"]) for r in recruiters.find({}, {"name": 1, "_id": 1})}

    pipeline = [
        {"$group": {
            "_id": "$recruiter",
            "candidates": {"$sum": 1},
            "clients": {"$addToSet": "$client"},
            "statuses": {"$addToSet": "$status"},
            "status_counts": {"$push": "$status"},
            "latest_date": {"$max": "$date"},
        }},
        {"$sort": {"_id": 1}},
    ]
    agg = {doc["_id"]: doc for doc in candidates.aggregate(pipeline)}

    stats = []
    for name in sorted(recruiter_names):
        doc = agg.get(name, {})
        statuses = [s for s in doc.get("statuses", []) if s]
        # Count candidates per status (empty status counted as "No status")
        status_counts: dict = {}
        for status in doc.get("status_counts", []):
            key = status or "No status"
            status_counts[key] = status_counts.get(key, 0) + 1
        stats.append({
            "id": recruiter_ids.get(name, ""),
            "recruiter": name,
            "candidates": doc.get("candidates", 0),
            "clients": len(doc.get("clients", [])),
            "latest_date": doc.get("latest_date", ""),
            "statuses": statuses,
            "status_counts": status_counts,
        })
    return {"stats": stats}


# ---------- Dashboard analytics ----------

# Final decision buckets mapped from candidate status.
DECISION_MAP = [
    ("Hired", ("Hired", "Joined")),
    (
        "Candidate in Process",
        (
            "Screening FBP",
            "L1 Select",
            "L1 TBS",
            "L1 FBP",
            "L2 Select",
            "L2 Scheduled",
            "L2 TBS",
            "L2 FBP",
            "Final Select",
            "Final Scheduled",
            "Final TBS",
            "Final FBP",
            "Offered",
            "L1 Scheduled",
            "Screening Scheduled",
            "Profile Shared,Feedback Pending",
            "Profile Shared",
        ),
    ),
    (
        "Candidate Refusal",
        (
            "Screening Reject",
            "L1 Reject",
            "L2 Reject",
            "Final Reject",
            "Candidate Drop",
            "Offer drop",
        ),
    ),
    (
        "No decision",
        (
            "L1 Yet to schedule",
            "Screening",
            "Awaiting AI Bot Scroes",
            "Notice Period issue",
            "Client Hold",
            "Req Hold",
            "",
        ),
    ),
]


@app.get("/api/dashboard")
def get_dashboard(recruiter: Optional[str] = None):
    """Analytics for the recruitment-tracker style dashboard, computed from candidate data."""
    from collections import Counter

    candidates = get_candidates_collection()
    query: dict = {}
    if recruiter:
        query["recruiter"] = recruiter
    docs = list(candidates.find(query))

    total = len(docs)
    status_counts = Counter((d.get("status") or "No status") for d in docs)

    # Recruitment pipeline (stages with counts)
    def stage_of(status: str) -> str:
        if status in ("Hired", "Joined"):
            return "Hired"
        if status in (
            "Offered",
            "Offer drop",
            "Client Hold",
            "Req Hold",
            "Candidate Drop",
        ):
            return "Job Offer"
        if status in (
            "L1 Reject",
            "L1 Select",
            "L1 TBS",
            "L1 FBP",
            "L1 Scheduled",
            "L2 Reject",
            "L2 Select",
            "L2 Scheduled",
            "L2 TBS",
            "L2 FBP",
            "Screening Scheduled",
            "L1 Yet to schedule",
        ):
            return "Interviews"
        if status in ("Profile Shared", "Profile Shared,Feedback Pending"):
            return "Sent to Manager"
        return "Received Application"

    pipeline_stages = ["Received Application", "Sent to Manager", "Interviews", "Job Offer", "Hired"]
    pipeline_counts = Counter(stage_of(d.get("status") or "") for d in docs)
    pipeline = [
        {"stage": stage, "count": pipeline_counts.get(stage, 0)}
        for stage in pipeline_stages
    ]

    # Final decision (counts per bucket)
    decisions = []
    for label, statuses in DECISION_MAP:
        decisions.append({"label": label, "count": sum(status_counts[s] for s in statuses if s in status_counts)})

    # Sources of applications: use client as the source channel.
    client_counts = Counter(d.get("client") or "Other" for d in docs)
    sources = [{"label": k, "value": v} for k, v in client_counts.most_common()]

    # Applications by month: parse the '3rd Aug 2026' style date.
    month_counts: dict[str, int] = {f"Month {i}": 0 for i in range(1, 13)}
    for d in docs:
        date_str = (d.get("date") or "").strip()
        # last token is the year; find month name
        parts = date_str.split()
        if len(parts) >= 2:
            month_map = {
                "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
                "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
            }
            for token in parts:
                m = month_map.get(token[:3])
                if m:
                    key = list(month_counts.keys())[m - 1]
                    month_counts[key] += 1
                    break

    monthly = [{"month": label.split()[-1], "count": v} for label, v in month_counts.items()]

    # Vacancy stats: totals derived from candidates.
    hired = sum(status_counts[s] for s in ("Hired", "Joined") if s in status_counts)
    rejected = sum(
        status_counts[s]
        for s in ("Screening Reject", "L1 Reject", "L2 Reject", "Final Reject", "Candidate Drop", "Offer drop")
        if s in status_counts
    )
    active = total - hired
    fill_rate = round((hired / total * 100)) if total else 0

    return {
        "total_candidates": total,
        "pipeline": pipeline,
        "decisions": decisions,
        "sources": sources,
        "monthly": monthly,
        "vacancy": {
            "active_vacancies": max(len(set(d.get("client") for d in docs)), 1),
            "hired": hired,
            "rejected": rejected,
            "fill_rate": fill_rate,
        },
    }


# ---------- Candidates ----------

@app.get("/api/candidates")
def list_candidates(recruiter: Optional[str] = None, date: Optional[str] = None):
    candidates = get_candidates_collection()
    query: dict = {}
    if recruiter:
        query["recruiter"] = recruiter
    if date:
        query["date"] = date

    docs = list(candidates.find(query).sort("date", -1).limit(2000))
    return {"candidates": [candidate_to_dict(d) for d in docs]}


class CandidateStatusIn(BaseModel):
    status: str


@app.patch("/api/candidates/{candidate_id}")
def update_candidate_status(candidate_id: str, body: CandidateStatusIn):
    """Update a candidate's status (used by the detail popup status dropdown)."""
    candidates = get_candidates_collection()
    try:
        obj_id = ObjectId(candidate_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid candidate id")

    status = body.status.strip()
    if not status:
        raise HTTPException(status_code=400, detail="Status cannot be empty")

    doc = candidates.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Candidate not found")

    previous = doc.get("status", "")
    if previous != status:
        candidates.update_one(
            {"_id": obj_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow().isoformat()}},
        )
        # Record the change in the transaction log.
        get_status_logs_collection().insert_one(
            {
                "candidate_id": str(obj_id),
                "candidate_name": doc.get("name", ""),
                "recruiter": doc.get("recruiter", ""),
                "from": previous,
                "to": status,
                "at": datetime.utcnow().isoformat(),
            }
        )

    return candidate_to_dict(candidates.find_one({"_id": obj_id}))


@app.get("/api/logs")
def get_logs(recruiter: Optional[str] = None, candidate: Optional[str] = None, limit: int = 500):
    """Transaction history: every status change on a candidate, newest first."""
    query: dict = {}
    if recruiter:
        query["recruiter"] = recruiter
    if candidate:
        id_match = re.fullmatch(r"[0-9a-fA-F]{24}", candidate)
        if id_match:
            query["$or"] = [
                {"candidate_id": candidate},
                {"candidate_name": re.compile(re.escape(candidate), re.IGNORECASE)},
            ]
        else:
            query["candidate_name"] = re.compile(re.escape(candidate), re.IGNORECASE)

    max_limit = min(max(limit, 1), 1000)
    docs = (
        get_status_logs_collection()
        .find(query)
        .sort("at", -1)
        .limit(max_limit)
    )
    logs = []
    for doc in docs:
        logs.append(
            {
                "id": str(doc["_id"]),
                "candidate_id": doc.get("candidate_id", ""),
                "candidate_name": doc.get("candidate_name", ""),
                "recruiter": doc.get("recruiter", ""),
                "from": doc.get("from", ""),
                "to": doc.get("to", ""),
                "at": doc.get("at", ""),
            }
        )
    return {"logs": logs, "total": len(logs)}


@app.get("/api/candidates/export")
def export_candidates(recruiter: Optional[str] = None, date: Optional[str] = None):
    """Export the candidate list as a downloadable Excel file (all columns)."""
    from io import BytesIO
    from fastapi.responses import StreamingResponse

    import pandas as pd

    candidates = get_candidates_collection()
    query: dict = {}
    if recruiter:
        query["recruiter"] = recruiter
    if date:
        query["date"] = date

    docs = list(candidates.find(query).sort("date", -1).limit(2000))

    # Same column layout as the uploaded workbook.
    columns = [
        ("date", "Date"),
        ("name", "Name"),
        ("phone", "Phone Number"),
        ("email", "Email Id"),
        ("total_experience", "Total Experience"),
        ("relevant_experience", "Relevant Experience"),
        ("skill", "Skill"),
        ("notice_period", "Notice Period"),
        ("current_location", "Current Location"),
        ("preferred_location", "Preferred Location"),
        ("current_ctc", "Current CTC"),
        ("expected_ctc", "Expected CTC"),
        ("education", "Education"),
        ("client", "Client"),
        ("status", "Status"),
        ("recruiter", "Recruiters"),
    ]

    rows = []
    for doc in docs:
        rows.append({label: doc.get(key, "") for key, label in columns})

    df = pd.DataFrame(rows)
    buffer = BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Candidates")

    buffer.seek(0)
    filename = "candidates_export.xlsx"
    if recruiter:
        filename = f"candidates_{recruiter.replace(' ', '_')}.xlsx"
    if date:
        filename = f"candidates_{date.replace(' ', '_')}.xlsx"

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
