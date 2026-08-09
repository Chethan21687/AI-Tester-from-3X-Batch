// GET /api/dashboard — analytics for the recruitment-tracker style dashboard,
// computed from candidate data. Port of backend/main.py.

import { getCandidatesCollection, requireMongo } from './_mongo.js'
import { parseDateParts } from './_helpers.js'

// Final decision buckets mapped from candidate status.
const DECISION_MAP = [
  ['Hired', ['Hired']],
  ['Candidate in Process', ['L1 Scheduled', 'Screening Scheduled', 'Profile Shared,Feedback Pending', 'Profile Shared']],
  ['Candidate Refusal', ['Screening Reject']],
  ['No decision', ['L1 Yet to schedule', 'Screening', 'Awaiting AI Bot Scroes', 'Notice Period issue', '']],
]

const MONTH_MAP = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
}

function stageOf(status) {
  if (status === 'Hired') return 'Hired'
  if (status === 'Profile Shared' || status === 'Profile Shared,Feedback Pending') return 'Sent to Manager'
  if (status === 'L1 Scheduled' || status === 'Screening Scheduled' || status === 'L1 Yet to schedule') return 'Interviews'
  return 'Received Application'
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ detail: 'method not allowed' })
  }
  if (!requireMongo(res)) return

  const recruiter = req.query.recruiter || null
  const month = req.query.month ? Number(req.query.month) : null
  const year = req.query.year ? Number(req.query.year) : null
  const candidates = await getCandidatesCollection()
  const query = recruiter ? { recruiter } : {}
  let docs = await candidates.find(query).toArray()

  // Filter to a specific month/year of the application date.
  if (month || year) {
    docs = docs.filter((d) => {
      const parts = parseDateParts(d.date)
      if (!parts) return false
      if (month && parts.month !== month) return false
      if (year && parts.year !== year) return false
      return true
    })
  }

  const total = docs.length
  const statusCounts = {}
  for (const d of docs) {
    const key = d.status || 'No status'
    statusCounts[key] = (statusCounts[key] || 0) + 1
  }

  // Recruitment pipeline (stages with counts)
  const pipelineStages = ['Received Application', 'Sent to Manager', 'Interviews', 'Job Offer', 'Hired']
  const pipelineCounts = {}
  for (const d of docs) {
    const stage = stageOf(d.status || '')
    pipelineCounts[stage] = (pipelineCounts[stage] || 0) + 1
  }
  const pipeline = pipelineStages.map((stage) => ({ stage, count: pipelineCounts[stage] || 0 }))

  // Final decision (counts per bucket)
  const decisions = DECISION_MAP.map(([label, statuses]) => ({
    label,
    count: statuses.reduce((sum, s) => sum + (statusCounts[s] || 0), 0),
  }))

  // Sources of applications: use client as the source channel.
  const clientCounts = {}
  for (const d of docs) {
    const client = d.client || 'Other'
    clientCounts[client] = (clientCounts[client] || 0) + 1
  }
  const sources = Object.entries(clientCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }))

  // Applications by month: parse the '3rd Aug 2026' style date.
  const monthCounts = {}
  for (let i = 1; i <= 12; i++) monthCounts[i] = 0
  for (const d of docs) {
    const dateStr = (d.date || '').trim()
    const parts = dateStr.split(/\s+/)
    for (const token of parts) {
      const m = MONTH_MAP[token.slice(0, 3)]
      if (m) {
        monthCounts[m] += 1
        break
      }
    }
  }
  const monthly = Array.from({ length: 12 }, (_, i) => ({ month: String(i + 1), count: monthCounts[i + 1] }))

  // Vacancy stats: totals derived from candidates.
  const hired = statusCounts.Hired || 0
  const rejected = statusCounts['Screening Reject'] || 0
  const active = total - hired
  const fillRate = total ? Math.round((hired / total) * 100) : 0

  return res.status(200).json({
    total_candidates: total,
    pipeline,
    decisions,
    sources,
    monthly,
    vacancy: {
      active_vacancies: Math.max(new Set(docs.map((d) => d.client)).size, 1),
      hired,
      rejected,
      fill_rate: fillRate,
    },
  })
}
