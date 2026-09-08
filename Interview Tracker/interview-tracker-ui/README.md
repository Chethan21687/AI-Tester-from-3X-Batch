# Interview Tracker (React UI)

Interactive dashboard for the **Candidates — Submission Log**, built from
`../data/Job_Application_Tracker_PRD.md`. Tracks requirements, candidates and
interviews end-to-end, then exports / shares the report with managers and stakeholders.

## Features

- **Dashboard** — stat tiles + breakdowns: Candidate Status, Requirement Status, by Client, by Recruiter, and an **Interview Schedule** table (date, mode, duration, status).
- **Candidates grid** — every Submission Log column: Cand ID, Req ID, Client, Name, Phone, Email, Total/Relevant Experience, Notice Period, Location, Education, Source/Recruiter, Dates, CTC (current/expected/offered), Status, Interview mode & duration, Outcome, Reason, Notes.
- **Add / Edit** candidates manually (grouped form).
- **Import** the Submission Log from **Excel (.xlsx/.xls), CSV, or PDF** — multi-sheet Excel is merged by `Cand ID + Name`.
- **Export Excel** — one-click `.xlsx` of the full log to share with managers.
- **✉ Mail** — opens your mail client pre-filled with a pipeline summary (attach the exported Excel).
- **Teams** — opens the Microsoft Teams *share* dialog pre-filled with the summary; pick the channel/chat.
- Per-candidate interview **email notify** (✉) and **calendar invite** (📅 `.ics`).
- Search + status filter. Data persists in browser `localStorage`.

## Data folder
Place the real Submission Log spreadsheet in `../data/` (e.g. `../data/Candidates_Submission_Log.xlsx`),
then open the **Import** tab and select it. Seed sample rows (transcribed from the PDF) load on first run.

## Run

```bash
cd "Interview Tracker/interview-tracker-ui"
npm install
npm run dev        # opens http://localhost:5173
```

Production build:

```bash
npm run build && npm run preview
```
