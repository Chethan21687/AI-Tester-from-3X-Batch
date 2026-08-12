// GET /api/stats — per-recruiter daily value stats computed over the candidates
// collection. Port of the FastAPI endpoint in backend/main.py.

import { getCandidatesCollection, getRecruitersCollection, requireMongo } from './_mongo.js'
import { parseDateParts } from './_helpers.js'

// Convert { day, month, year } into a sortable number.
function partsToValue(parts) {
  return parts.year * 10000 + parts.month * 100 + parts.day
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ detail: 'method not allowed' })
  }
  if (!requireMongo(res)) return

  const month = req.query.month ? Number(req.query.month) : null
  const year = req.query.year ? Number(req.query.year) : null

  const candidates = await getCandidatesCollection()
  const recruiters = await getRecruitersCollection()

  let candidateDocs = await candidates.find({}).toArray()
  if (month || year) {
    candidateDocs = candidateDocs.filter((d) => {
      const parts = parseDateParts(d.date)
      if (!parts) return false
      if (month && parts.month !== month) return false
      if (year && parts.year !== year) return false
      return true
    })
  }

  const recruiterDocs = await recruiters.find({}, { projection: { name: 1 } }).toArray()
  const recruiterNames = recruiterDocs.map((r) => r.name)
  const recruiterIds = new Map(recruiterDocs.map((r) => [r.name, String(r._id)]))

  // Group the (already filtered) candidates by recruiter in JS.
  const groups = new Map()
  for (const d of candidateDocs) {
    const name = d.recruiter || 'Unassigned'
    if (!groups.has(name)) {
      groups.set(name, { recruiter: name, count: 0, clients: new Set(), statuses: new Set(), status_counts: [], latest_date: '' })
    }
    const g = groups.get(name)
    g.count += 1
    if (d.client) g.clients.add(d.client)
    g.statuses.add(d.status || '')
    g.status_counts.push(d.status || '')
    // Latest date: compare parsed dates, not raw strings.
    if (d.date) {
      const parts = parseDateParts(d.date)
      const cur = g.latest_date ? parseDateParts(g.latest_date) : null
      if (parts && (!cur || partsToValue(parts) > partsToValue(cur))) {
        g.latest_date = d.date
      }
    }
  }

  const stats = []
  for (const name of [...recruiterNames].sort()) {
    const g = groups.get(name) || { count: 0, clients: new Set(), statuses: new Set(), status_counts: [], latest_date: '' }
    const statuses = [...g.statuses].filter((s) => s)
    const statusCounts = {}
    for (const status of g.status_counts) {
      const key = status || 'No status'
      statusCounts[key] = (statusCounts[key] || 0) + 1
    }
    stats.push({
      id: recruiterIds.get(name) || '',
      recruiter: name,
      candidates: g.count,
      clients: g.clients.size,
      latest_date: g.latest_date || '',
      statuses,
      status_counts: statusCounts,
    })
  }
  return res.status(200).json({ stats })
}
