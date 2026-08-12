// GET /api/candidates — candidate list (filter by recruiter / date).
// Port of the FastAPI endpoint in backend/main.py.

import { getCandidatesCollection, requireMongo } from './_mongo.js'
import { candidateToDict, parseDateParts } from './_helpers.js'

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

  const recruiter = req.query.recruiter || null
  const date = req.query.date || null
  const month = req.query.month ? Number(req.query.month) : null
  const year = req.query.year ? Number(req.query.year) : null
  const candidates = await getCandidatesCollection()
  const query = {}
  if (recruiter) query.recruiter = recruiter
  if (date) query.date = date

  let docs = await candidates.find(query).limit(2000).toArray()
  if (month || year) {
    docs = docs.filter((d) => {
      const parts = parseDateParts(d.date)
      if (!parts) return false
      if (month && parts.month !== month) return false
      if (year && parts.year !== year) return false
      return true
    })
  }
  // Sort by application date ascending (chronological, not lexical).
  docs = docs.sort((a, b) => {
    const pa = parseDateParts(a.date)
    const pb = parseDateParts(b.date)
    if (pa && pb) return partsToValue(pa) - partsToValue(pb)
    return String(a.date || '').localeCompare(String(b.date || ''))
  })

  return res.status(200).json({ candidates: docs.map(candidateToDict) })
}
