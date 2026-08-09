# Recruiter Tracker

A React + Python (FastAPI) + MongoDB web app for tracking recruiter daily performance.

Upload the daily Excel export (the same format as `data/Aug data.xlsx`) and the
app upserts every candidate row against MongoDB — existing candidates (matched
by **phone + email**) get their daily values updated, new rows are inserted, and
per-recruiter counts update instantly. You can also add a new recruiter when
someone joins the organization.

## Features

- **Daily Excel upload** — drag in today's export; rows are upserted (new + updated counts shown)
- **Duplicate detection** — files containing the same candidate twice (same phone + email) are rejected with the offending rows listed
- **Recruiter-change warnings** — when a candidate moves to a different recruiter, the upload confirms the reassignment before closing
- **All 16 columns tracked** — Date, Name, Phone, Email, Experience, Skill, Notice Period, Locations, CTCs, Education, Client, Status, Recruiter
- **Per-recruiter dashboard cards** — candidate count, client count, latest data date
- **Recruitment-tracker dashboard** — analytics view with recruitment pipeline bars, final-decision donut, sources-of-applications donut, applications-by-month line chart, and vacancy fill-rate gauge, all computed from the uploaded data
- **Nav tabs** — switch between Dashboard, Candidates, and Recruiters views
- **Clickable candidate names** — open a full candidate detail card (client, skills, CTC, contact) from the table
- **Clickable client names** — click a client in the table to see that client's candidates (name + status), then drill into any candidate
- **Status update in popup** — change the candidate's status via dropdown; it auto-saves and instantly updates the table and every recruiter's status breakdown
- **Export to Excel** — one-click download of the candidate list (filtered to the selected recruiter) in the same 16-column layout
- **Add new recruiter** — register someone new; they appear on the dashboard immediately
- **Delete recruiter** — remove a recruiter from the dashboard (with confirmation); their candidate history stays in the database
- **Duplicate prevention** — recruiter names are checked case-insensitively, so "roshini" can't be added twice as "Roshini"
- **Auto-registration** — any recruiter name appearing in an uploaded file is added automatically
- **Free & self-hosted** — portable MongoDB (no installer/service), local FastAPI + Vite

## Architecture

```
frontend/   React 19 + Vite SPA (dashboard, upload, add recruiter)
backend/    FastAPI + pymongo (Excel parsing + upsert API)
mongodb/    Portable MongoDB Community Server (dbpath under mongodb/data)
data/       Your daily Excel exports
```

## Quick Start

### 1. Start MongoDB (portable, no install)

```bat
start-mongo.bat
```

This runs `mongodb\bin\mongod.exe` with a local dbpath at `mongodb\data`.
If `mongod.exe` is missing, extract the zip first:

```bat
tar -xf mongodb\mongodb.zip -C mongodb\ --strip-components=1
```

> Requires Windows 10/11 64-bit. MongoDB listens on `127.0.0.1:27017`.

### 2. Start the backend

```bat
pip install -r backend\requirements.txt
start-backend.bat
```

Runs FastAPI + Uvicorn on `http://127.0.0.1:8000` (Swagger UI at `/docs`).

### 3. Start the frontend

```bat
start-frontend.bat
```

Opens the Vite dev server at `http://localhost:5173`.

### 4. Use it

1. Open `http://localhost:5173`
2. **Upload Daily Excel** → pick `data/Aug data.xlsx` (or today's export) → *Upload & Update*
3. Click a candidate's name → change **Status** in the dropdown (auto-saves)
4. **Export to Excel** → downloads the candidate list in the workbook format
5. **Add New Recruiter** → enter name (and optional email)

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/upload` | Upload Excel file (multipart `file`), upsert rows |
| GET | `/api/recruiters` | List recruiters |
| POST | `/api/recruiters` | Add recruiter `{name, email?}` |
| DELETE | `/api/recruiters/{id}` | Remove a recruiter |
| GET | `/api/stats` | Per-recruiter aggregate stats |
| GET | `/api/dashboard` | Analytics: pipeline, decisions, sources, monthly, vacancy |
| GET | `/api/candidates?recruiter=&date=` | Candidate list (filterable) |
| PATCH | `/api/candidates/{id}` | Update candidate status `{status}` |
| GET | `/api/candidates/export?recruiter=&date=` | Download candidates as Excel |

## How the upsert works

Each row is keyed by `phone|email` (normalized identity). On every upload:

- identity exists → `$set` the row (daily values updated, history preserved in place)
- identity is new → insert the row
- recruiter names not yet registered are added to the `recruiters` collection

## Configuration

Environment variables (backend):

| Variable | Default | Description |
| --- | --- | --- |
| `MONGO_URI` | `mongodb://127.0.0.1:27017` | MongoDB connection string |
| `MONGO_DB` | `recruiter_tracker` | Database name |

Frontend: `VITE_API_URL` (defaults to `http://127.0.0.1:8000/api`).
