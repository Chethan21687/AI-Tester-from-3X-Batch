# RAG Test Case Generator UI

Live app: **https://rag-testcase-generator.vercel.app**

React/Vite front-end that drives a Langflow RAG flow to generate test cases
from a requirement PDF, then shows them in a sortable/filterable table with
CSV / Excel / JSON export.

## What it does
- Upload a requirement PDF (or use the flow's existing Chroma vector store)
- Send a prompt to the Langflow RAG flow (`/api/v1/run/<flowId>`)
- Batched generation to reach large targets (e.g. 500) despite LLM output limits
- Parse the output (JSON / markdown table / TC blocks) into a table
- Export CSV / Excel / JSON

## Run locally
```bash
npm install
npm run dev            # http://localhost:5176 (proxies /api -> localhost:7860)
```
Enter your Langflow API key in **Connection settings** (get one at
`http://localhost:7860/settings/api-keys`), then **Generate test cases**.

## Production (Vercel)
The deployed app proxies `/api` to a Langflow server via a Vercel rewrite in
[`vercel.json`](vercel.json). Because the app runs in the browser, Langflow must
be reachable from the internet:

1. Expose your local Langflow with a tunnel:
   ```bash
   cloudflared tunnel --url http://localhost:7860
   ```
2. Put the tunnel URL in `vercel.json` (`/api/:path*` rewrite destination).
3. Redeploy + re-alias:
   ```bash
   vercel deploy --prod --yes
   vercel alias set <deployment-url> rag-testcase-generator.vercel.app
   ```

The free tunnel URL changes on restart — repeat steps 2–3 when it does, or use a
named cloudflared tunnel / hosted Langflow for a stable URL.

## Stack
React 18 · Vite 5 · marked · deployed on Vercel · Langflow RAG backend.
