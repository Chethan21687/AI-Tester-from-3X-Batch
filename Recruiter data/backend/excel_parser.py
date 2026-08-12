"""Excel parsing logic for the Recruiter Tracker backend.

Parses the daily recruiter Excel export into candidate records.
The workbook is expected to contain the standard 16 columns:
Date, Name, Phone Number, Email Id, Total Experience, Relevant Experience,
Skill, Notice Period, Current Location, Preferred Location, Current CTC,
Expected CTC, Education, Client, Status, Recruiters.
"""

from __future__ import annotations

from datetime import datetime
from io import BytesIO

import pandas as pd

# Map the workbook headers to our normalized DB field names.
COLUMN_MAP = {
    "Date": "date",
    "Name": "name",
    "Phone Number": "phone",
    "Email Id": "email",
    "Total Experience": "total_experience",
    "Relevant Experience": "relevant_experience",
    "Skill": "skill",
    "Notice Period": "notice_period",
    "Current Location": "current_location",
    "Preferred Location": "preferred_location",
    "Current CTC": "current_ctc",
    "Expected CTC": "expected_ctc",
    "Education": "education",
    "Client": "client",
    "Status": "status",
    "Recruiters": "recruiter",
}

# Aliases for headers that vary between Excel exports. Keys are normalized
# (lowercased, stripped) header names; values are the canonical DB fields.
COLUMN_ALIASES = {
    "date": "date",
    "name": "name",
    "phone number": "phone",
    "email id": "email",
    "total experience": "total_experience",
    "relevant experience": "relevant_experience",
    "skill": "skill",
    "notice period": "notice_period",
    "current location": "current_location",
    "preferred location": "preferred_location",
    "location": "preferred_location",
    "current ctc": "current_ctc",
    "expected ctc": "expected_ctc",
    "ctc": "current_ctc",
    "ectc": "expected_ctc",
    "education": "education",
    "client": "client",
    "status": "status",
    "recruiters": "recruiter",
    "recruiter": "recruiter",
}

# Columns whose values we should preserve as text exactly as entered in Excel.
TEXT_COLUMNS = {
    "phone",
    "email",
    "total_experience",
    "relevant_experience",
    "skill",
    "notice_period",
    "current_location",
    "preferred_location",
    "current_ctc",
    "expected_ctc",
    "education",
    "client",
    "status",
    "date",
}


def _to_text(value) -> str:
    """Convert a raw Excel cell value to a clean string."""
    if value is None:
        return ""
    # pandas may read phone numbers as ints/floats; format them without decimals
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def parse_workbook(contents: bytes) -> list[dict]:
    """Parse uploaded Excel bytes into normalized candidate documents.

    Returns a list of dicts ready to upsert into MongoDB. Rows missing a
    candidate name or recruiter are skipped.
    """
    df = pd.read_excel(BytesIO(contents), engine="openpyxl", dtype=str)

    # Normalize headers: exact match first, then aliases (case/space-insensitive).
    def map_header(header: str):
        canonical = COLUMN_MAP.get(header)
        if canonical:
            return canonical
        return COLUMN_ALIASES.get(str(header).strip().lower())

    df = df.rename(columns=lambda h: map_header(h) or h)

    records: list[dict] = []
    for _, row in df.iterrows():
        row_map = {COLUMN_MAP.get(k, k): _to_text(v) for k, v in row.items()}

        name = row_map.get("name", "")
        recruiter = row_map.get("recruiter", "")
        if not name or not recruiter:
            continue

        record = {
            "name": name,
            "recruiter": recruiter,
            "updated_at": datetime.utcnow().isoformat(),
        }
        for field, value in row_map.items():
            if field in TEXT_COLUMNS and field not in ("name", "recruiter"):
                record[field] = value

        # Preserve the Excel Date as-is (e.g. "3rd Aug 2026").
        record["date"] = row_map.get("date", "")

        # Normalized phone/email used for the unique identity key.
        record["phone"] = row_map.get("phone", "")
        record["email"] = row_map.get("email", "")
        record["identity"] = f"{record['phone']}|{record['email'].lower()}"

        records.append(record)

    return records
