// Excel parsing for the Recruiter Tracker serverless backend.
// Port of backend/excel_parser.py using SheetJS (xlsx) to read the workbook.
// Expected columns: Date, Name, Phone Number, Email Id, Total Experience,
// Relevant Experience, Skill, Notice Period, Current Location, Preferred
// Location, Current CTC, Expected CTC, Education, Client, Status, Recruiters.

import * as XLSX from 'xlsx'

// Map the workbook headers to our normalized DB field names.
const COLUMN_MAP = {
  Date: 'date',
  Name: 'name',
  'Phone Number': 'phone',
  'Email Id': 'email',
  'Total Experience': 'total_experience',
  'Relevant Experience': 'relevant_experience',
  Skill: 'skill',
  'Notice Period': 'notice_period',
  'Current Location': 'current_location',
  'Preferred Location': 'preferred_location',
  'Current CTC': 'current_ctc',
  'Expected CTC': 'expected_ctc',
  Education: 'education',
  Client: 'client',
  Status: 'status',
  Recruiters: 'recruiter',
}

// Aliases for headers that vary between Excel exports. Keys are normalized
// (lowercased, stripped) header names; values are the canonical DB fields.
const COLUMN_ALIASES = {
  date: 'date',
  name: 'name',
  'phone number': 'phone',
  'email id': 'email',
  'total experience': 'total_experience',
  'relevant experience': 'relevant_experience',
  skill: 'skill',
  'notice period': 'notice_period',
  'current location': 'current_location',
  'preferred location': 'preferred_location',
  location: 'preferred_location',
  'current ctc': 'current_ctc',
  'expected ctc': 'expected_ctc',
  ctc: 'current_ctc',
  ectc: 'expected_ctc',
  education: 'education',
  client: 'client',
  status: 'status',
  recruiters: 'recruiter',
  recruiter: 'recruiter',
}

// Columns whose values we preserve as text exactly as entered in Excel.
const TEXT_COLUMNS = new Set([
  'phone',
  'email',
  'total_experience',
  'relevant_experience',
  'skill',
  'notice_period',
  'current_location',
  'preferred_location',
  'current_ctc',
  'expected_ctc',
  'education',
  'client',
  'status',
  'date',
])

function toDateLabel(dt) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${dt.getUTCDate()} ${months[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
}

function toText(value) {
  if (value === undefined || value === null) return ''
  // Dates: keep them as text (e.g. "7 Aug 2026").
  if (value instanceof Date) {
    return toDateLabel(value)
  }
  if (typeof value === 'number') {
    // Excel date serial (e.g. 46234) — convert to a date label. SheetJS reads
    // date cells as serial numbers unless cellDates is on.
    if (Number.isInteger(value) && value > 20000 && value < 80000) {
      const epoch = Date.UTC(1899, 11, 30)
      return toDateLabel(new Date(epoch + value * 86400000))
    }
    // Phone numbers / integer-valued floats: format without decimals.
    if (Number.isInteger(value)) return String(value)
    return String(value)
  }
  return String(value).trim()
}

export function parseWorkbook(contents) {
  const wb = XLSX.read(contents, { type: 'buffer', cellDates: false })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  if (!sheet) return []

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true })

  // Normalize headers: exact match first, then aliases (case/space-insensitive).
  function mapHeader(header) {
    return COLUMN_MAP[header] || COLUMN_ALIASES[String(header).trim().toLowerCase()] || header
  }

  const records = []
  for (const row of rows) {
    const rowMap = {}
    for (const [key, value] of Object.entries(row)) {
      rowMap[mapHeader(key)] = toText(value)
    }

    const name = rowMap.name || ''
    const recruiter = rowMap.recruiter || ''
    if (!name || !recruiter) continue

    const record = {
      name,
      recruiter,
      updated_at: new Date().toISOString(),
    }
    for (const [field, value] of Object.entries(rowMap)) {
      if (TEXT_COLUMNS.has(field) && field !== 'name' && field !== 'recruiter') {
        record[field] = value
      }
    }

    record.date = rowMap.date || ''
    record.phone = rowMap.phone || ''
    record.email = rowMap.email || ''
    record.identity = `${record.phone}|${record.email.toLowerCase()}`

    records.push(record)
  }

  return records
}
