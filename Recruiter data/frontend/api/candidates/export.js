// GET /api/candidates/export — export the candidate list as a downloadable
// Excel file (all columns). Port of the FastAPI endpoint in backend/main.py.

import * as XLSX from 'xlsx'
import { getCandidatesCollection, requireMongo } from '../_mongo.js'
import { parseDateParts } from '../_helpers.js'

// Same column layout as the uploaded workbook.
const COLUMNS = [
  ['date', 'Date'],
  ['name', 'Name'],
  ['phone', 'Phone Number'],
  ['email', 'Email Id'],
  ['total_experience', 'Total Experience'],
  ['relevant_experience', 'Relevant Experience'],
  ['skill', 'Skill'],
  ['notice_period', 'Notice Period'],
  ['current_location', 'Current Location'],
  ['preferred_location', 'Preferred Location'],
  ['current_ctc', 'Current CTC'],
  ['expected_ctc', 'Expected CTC'],
  ['education', 'Education'],
  ['client', 'Client'],
  ['status', 'Status'],
  ['recruiter', 'Recruiters'],
]

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

  let docs = await candidates.find(query).sort({ date: -1 }).limit(2000).toArray()
  if (month || year) {
    docs = docs.filter((d) => {
      const parts = parseDateParts(d.date)
      if (!parts) return false
      if (month && parts.month !== month) return false
      if (year && parts.year !== year) return false
      return true
    })
  }

  const rows = docs.map((doc) => {
    const out = {}
    for (const [key, label] of COLUMNS) out[label] = doc[key] || ''
    return out
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Candidates')
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  let filename = 'candidates_export.xlsx'
  if (recruiter) filename = `candidates_${recruiter.replace(/ /g, '_')}.xlsx`
  if (date) filename = `candidates_${date.replace(/ /g, '_')}.xlsx`

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  return res.status(200).send(buffer)
}
