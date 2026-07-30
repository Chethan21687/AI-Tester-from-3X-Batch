// Client for the shared candidate store (serverless /api/candidates backed by
// Vercel Edge Config). Everyone reads/writes the same dataset, so dashboard
// counts are identical for every user. localStorage is only an offline cache.
//
// Demo mode short-circuits every call to a sessionStorage-backed sandbox, so a
// demo visitor can add, edit and delete freely without ever hitting the shared
// database. The sandbox is wiped on every page load, so each visit starts from
// the pristine seed. See src/config/demo.js.

import { isDemo, DEMO_STORE_KEY, DEMO_AUDIT_KEY } from '../config/demo.js'
import { demoCandidates } from '../data/demoCandidates.js'

const readSession = (key, fallback) => {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}
const writeSession = (key, value) => {
  try { sessionStorage.setItem(key, JSON.stringify(value)) } catch { /* quota / private mode */ }
}

// Two pre-seeded rows so the Audit tab shows a populated trail in the demo.
const DEMO_AUDIT_SEED = [
  { deletedAt: new Date(Date.now() - 864e5 * 2).toISOString(), candId: 'C-013', name: 'Nikhil Reddy',
    client: 'Sony', status: 'Duplicate', recruiter: 'Asha Nair', reason: 'Duplicate profile — already submitted under C-011' },
  { deletedAt: new Date(Date.now() - 864e5).toISOString(), candId: 'C-046', name: 'Kavya Bhat',
    client: 'Kanini', status: 'Drop-Out', recruiter: 'Rajiv Menon', reason: 'Candidate withdrew — accepted another offer' }
]

export async function fetchCandidates() {
  if (isDemo()) return readSession(DEMO_STORE_KEY, demoCandidates)
  const r = await fetch('/api/candidates')
  if (!r.ok) throw new Error(`load failed (${r.status})`)
  const d = await r.json()
  return Array.isArray(d.candidates) ? d.candidates : []
}

export async function saveCandidates(candidates) {
  if (isDemo()) { writeSession(DEMO_STORE_KEY, candidates); return { ok: true, demo: true } }
  const r = await fetch('/api/candidates', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidates })
  })
  if (!r.ok) throw new Error(`save failed (${r.status})`)
  return r.json()
}

// Deletion audit trail (persisted in MongoDB via /api/audit).
export async function logDeletion(entry) {
  if (isDemo()) {
    const entries = readSession(DEMO_AUDIT_KEY, DEMO_AUDIT_SEED)
    writeSession(DEMO_AUDIT_KEY, [{ ...entry, deletedAt: new Date().toISOString() }, ...entries])
    return { ok: true, demo: true }
  }
  const r = await fetch('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  })
  if (!r.ok) throw new Error(`audit log failed (${r.status})`)
  return r.json()
}

export async function fetchAuditLog() {
  if (isDemo()) return readSession(DEMO_AUDIT_KEY, DEMO_AUDIT_SEED)
  const r = await fetch('/api/audit')
  if (!r.ok) throw new Error(`audit load failed (${r.status})`)
  // Serverless /api routes only run on Vercel (or `vercel dev`). Under plain
  // `vite dev` this request returns HTML/JS, not JSON — surface a clear message.
  const ct = r.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    throw new Error('Audit API is unavailable in local dev — deploy to Vercel or run `vercel dev`.')
  }
  const d = await r.json()
  return Array.isArray(d.entries) ? d.entries : []
}
