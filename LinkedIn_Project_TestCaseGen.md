# LinkedIn — Projects / Featured Entry

Add via LinkedIn → **Profile → Add section → Projects** (or Featured). Copy the fields below.

---

## Project title
AI-Powered Test Case Generation Pipeline

## Associated with
Diona Software Solutions (via TestYantra Software Solutions) — Health & Human Services

## Dates
Nov 2025 – Present

## Description

Built an end-to-end pipeline that turns requirement documents into ready-to-use QA assets with no manual test-case writing.

Requirement PDFs are ingested and parsed in n8n, then routed to the right LLM — Claude Haiku 4.5 for fast, high-volume generation and Claude Opus 4.8 for complex reasoning, with a locally-hosted model (Ollama, qwen2.5) as a zero-cost fallback. Each model returns structured test cases — ID, priority, test type, preconditions, steps, expected results, and Playwright locator hints — as strict JSON.

The JSON is normalized and exported to Excel, then fed into a RAG stage that generates Playwright (Python) automation scripts. Enforcing deterministic JSON output (format=json) across all models eliminated unreliable, prose-mixed responses — balancing cloud model quality with local cost efficiency.

Highlights:
- Multi-model routing: Claude Opus 4.8 / Haiku 4.5 for quality, Ollama qwen2.5 for zero-cost local generation.
- Full workflow orchestration in n8n: PDF → text extraction → LLM inference → JSON normalization → Excel → RAG → Playwright scripts.
- Prompt & system-message engineering with JSON-schema enforcement for consistent, structured test cases.
- Evaluated multiple local models (gemma3, qwen2.5 3B/7B) for reliability and latency.

Tools: n8n · Claude (Opus 4.8, Haiku 4.5) · Ollama · Langflow · Playwright + Python · RAG · Prompt Engineering

---

## Shorter "About / Featured post" version (for a LinkedIn post or the About section)

Turned requirement PDFs into ready-to-run Playwright test cases — automatically.

I built an n8n pipeline that ingests requirement documents, routes them to Claude (Opus 4.8 / Haiku 4.5) or a local Ollama model, and returns structured JSON test cases — priority, steps, expected results, and Playwright locator hints — exported to Excel and fed into a RAG stage that generates Playwright (Python) scripts.

Deterministic JSON output across every model means zero prose, consistent structure, and no manual authoring.

#QA #TestAutomation #Playwright #AI #LLM #n8n #Ollama #Claude
