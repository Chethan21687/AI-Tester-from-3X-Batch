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

function toText(value) {
  if (value === undefined || value === null) return ''
  // Dates: keep them as text (e.g. "3rd Aug 2026"). SheetJS gives a number for
  // real date cells; convert via the workbook's date format so the value
  // matches what pandas produced with dtype=str.
  if (value instanceof Date) {
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(value.getUTCDate())}/${pad(value.getUTCMonth() + 1)}/${value.getUTCFullYear()}`
  }
  if (typeof value === 'number') {
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

  const records = []
  for (const row of rows) {
    const rowMap = {}
    for (const [key, value] of Object.entries(row)) {
      rowMap[COLUMN_MAP[key] || key] = toText(value)
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
