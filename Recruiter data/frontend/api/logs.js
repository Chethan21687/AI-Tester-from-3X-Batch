// GET /api/logs — transaction history: every status change on a candidate.
// Optional filters: recruiter, candidate (name or id), limit.

import { getLogsCollection, logToDict } from './_logs.js'
import { requireMongo } from './_mongo.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ detail: 'method not allowed' })
  }
  if (!requireMongo(res)) return

  const { recruiter, candidate, limit } = req.query
  const query = {}
  if (recruiter) query.recruiter = recruiter
  if (candidate) {
    // Match by name (case-insensitive substring) or exact candidate id.
    const idMatch = candidate.match(/^[0-9a-fA-F]{24}$/)
    if (idMatch) {
      query.$or = [{ candidate_id: candidate }, { candidate_name: new RegExp(candidate, 'i') }]
    } else {
      query.candidate_name = new RegExp(candidate, 'i')
    }
  }

  const max = Math.min(parseInt(limit, 10) || 500, 1000)
  const logs = await getLogsCollection()
  const docs = await logs.find(query).sort({ at: -1 }).limit(max).toArray()
  return res.status(200).json({ logs: docs.map(logToDict), total: docs.length })
}
