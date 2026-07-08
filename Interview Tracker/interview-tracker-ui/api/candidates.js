// Shared candidate store so every user sees the SAME data (and therefore the
// same dashboard counts), instead of per-device localStorage. Backed by a
// Vercel Edge Config; this serverless function is the read/write gateway.
//
// Env (set on the Vercel project):
//   EDGE_CONFIG_ID   – ecfg_… store id
//   VERCEL_TEAM_ID   – team_… owner
//   VERCEL_API_TOKEN – token used to read/write Edge Config items

const API = 'https://api.vercel.com'
const KEY = 'candidates'

const cfg = () => ({
  id: process.env.EDGE_CONFIG_ID,
  team: process.env.VERCEL_TEAM_ID,
  token: process.env.VERCEL_API_TOKEN
})

async function readAll() {
  const { id, team, token } = cfg()
  const r = await fetch(`${API}/v1/edge-config/${id}/item/${KEY}?teamId=${team}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (r.status === 404) return []           // key not created yet
  if (!r.ok) throw new Error(`read failed ${r.status}`)
  const data = await r.json()
  return Array.isArray(data?.value) ? data.value : []
}

async function writeAll(list) {
  const { id, team, token } = cfg()
  const r = await fetch(`${API}/v1/edge-config/${id}/items?teamId=${team}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ operation: 'upsert', key: KEY, value: list }] })
  })
  if (!r.ok) throw new Error(`write failed ${r.status}: ${await r.text()}`)
}

export default async function handler(req, res) {
  if (!cfg().id || !cfg().token) {
    return res.status(500).json({ error: 'Edge Config env vars not configured' })
  }
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ candidates: await readAll() })
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const list = Array.isArray(body.candidates) ? body.candidates : []
      await writeAll(list)
      return res.status(200).json({ ok: true, count: list.length })
    }
    res.setHeader('Allow', 'GET, PUT')
    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
