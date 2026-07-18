# QA Buddy — QA Knowledge System

**Live app: https://qabuddyweb.vercel.app**

A QA knowledge chat that returns a single, **citation-backed** answer grounded in your
team's QA sources — the Selenium & Playwright frameworks, ~5,000 test cases, JIRA (QAB),
product requirements, meeting notes, and Jenkins logs.

Built from the *QABuddy Enterprise Requirement Document* (12 knowledge sources), wearing
the QABuddy visual system (warm gold/terra theme, left knowledge-base sidebar,
cited-answer pills).

## Deliverables

| Deliverable | Location |
|---|---|
| Live Vercel URL | https://qabuddyweb.vercel.app |
| Architecture diagram | [docs/qabuddy_architecture.svg](docs/qabuddy_architecture.svg) · [system view](docs/qabuddy_system_architecture.svg) |
| Documentation page | [docs/index.html](docs/index.html) — backend & architecture explained |

## Stack

- **Frontend:** Next.js 14 (App Router) · React 18 · TypeScript
- **Backend:** serverless route `app/api/chat/route.ts` → **Groq** (`llama-3.3-70b-versatile`, OpenAI-compatible)
- **Hosting:** Vercel (static UI + serverless function)

> The chat backend originally used the Anthropic API; it was moved to **Groq** (free tier,
> OpenAI-compatible) so the app has no paid-credit dependency. See [docs/index.html](docs/index.html).

## Run locally

```bash
npm install
cp .env.example .env.local     # add your GROQ_API_KEY
npm run dev                    # http://localhost:3000
```

## Deploy (Vercel)

```bash
vercel deploy --prod
# set env vars in the Vercel project:
#   GROQ_API_KEY   = gsk_...
#   GROQ_MODEL     = llama-3.3-70b-versatile
```

Ensure **Settings → Deployment Protection → Vercel Authentication** is **Off** for public access.

## Environment variables

| Var | Required | Example |
|---|---|---|
| `GROQ_API_KEY` | yes | `gsk_...` (free from console.groq.com) |
| `GROQ_MODEL` | no | `llama-3.3-70b-versatile` (default) |
