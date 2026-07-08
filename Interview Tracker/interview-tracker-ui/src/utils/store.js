// Client for the shared candidate store (serverless /api/candidates backed by
// Vercel Edge Config). Everyone reads/writes the same dataset, so dashboard
// counts are identical for every user. localStorage is only an offline cache.

export async function fetchCandidates() {
  const r = await fetch('/api/candidates')
  if (!r.ok) throw new Error(`load failed (${r.status})`)
  const d = await r.json()
  return Array.isArray(d.candidates) ? d.candidates : []
}

export async function saveCandidates(candidates) {
  const r = await fetch('/api/candidates', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidates })
  })
  if (!r.ok) throw new Error(`save failed (${r.status})`)
  return r.json()
}
