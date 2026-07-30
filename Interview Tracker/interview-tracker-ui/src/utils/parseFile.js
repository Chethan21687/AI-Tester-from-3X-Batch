// Import candidates from Excel (.xlsx/.xls), CSV, or PDF (Submission Log).
import * as XLSX from 'xlsx'
import { emptyCandidate, syncNames, toISODate } from '../config/fields.js'

// Header text (normalized) -> candidate field key. Tolerant of variants,
// including the abbreviations and misspellings used in the recruiters'
// working sheets (CCTC/ECTC, "Relevent Years", "Recriuter", …).
const HEADER_MAP = {
  'cand id': 'candId', 'candidate id': 'candId', 'candid': 'candId',
  'req id': 'reqId', 'requirement id': 'reqId', 'reqid': 'reqId',
  'client': 'client',
  'requirement status': 'reqStatus', 'req status': 'reqStatus',
  'candidate name': 'name', 'name': 'name', 'candidate': 'name', 'full name': 'name',
  'first name': 'firstName', 'firstname': 'firstName',
  'last name': 'lastName', 'lastname': 'lastName', 'surname': 'lastName',
  'email': 'email', 'email id': 'email', 'e-mail': 'email', 'email address': 'email', 'mail id': 'email',
  'phone': 'phone', 'phone number': 'phone', 'phone no': 'phone', 'contact': 'phone',
  'contact number': 'phone', 'contact no': 'phone', 'mobile': 'phone', 'mobile number': 'phone',
  'location (current)': 'location', 'location': 'location', 'current location': 'location',
  'preferred location': 'preferredLocation', 'preffered location': 'preferredLocation',
  'preferred location(s)': 'preferredLocation', 'location (preferred)': 'preferredLocation',
  'willing to relocate': 'willingRelocate', 'relocate': 'willingRelocate',
  'education': 'education', 'qualification': 'education',
  'total experience (yrs)': 'totalExp', 'total experience': 'totalExp', 'total exp': 'totalExp',
  'total years': 'totalExp', 'total yrs': 'totalExp', 'total yoe': 'totalExp',
  'total experience (years)': 'totalExp', 'years of experience': 'totalExp',
  'relevant experience (yrs)': 'relevantExp', 'relevant experience': 'relevantExp',
  'relevant exp': 'relevantExp', 'relevant years': 'relevantExp', 'relevant yrs': 'relevantExp',
  'relevant yoe': 'relevantExp',
  // Common misspelling in the source sheets.
  'relevent years': 'relevantExp', 'relevent experience': 'relevantExp', 'relevent exp': 'relevantExp',
  'skills': 'relevantExp', 'skill set': 'relevantExp',
  'notice period': 'noticePeriod', 'notice': 'noticePeriod',
  'source': 'source',
  'source detail / recruiter': 'recruiter', 'source detail': 'recruiter', 'recruiter': 'recruiter',
  'recruiter name': 'recruiter', 'recriuter': 'recruiter', 'recruter': 'recruiter',
  'date sourced': 'dateSourced', 'sourced date': 'dateSourced', 'date': 'dateSourced',
  'date submitted': 'dateSubmitted', 'submitted date': 'dateSubmitted',
  'status': 'status', 'candidate status': 'status',
  'current ctc': 'currentCTC', 'ctc': 'currentCTC', 'cctc': 'currentCTC',
  'current ctc (lpa)': 'currentCTC', 'ctc (current)': 'currentCTC',
  'expected ctc': 'expectedCTC', 'ectc': 'expectedCTC', 'expected ctc (lpa)': 'expectedCTC',
  'offered ctc': 'offeredCTC',
  'rate unit': 'rateUnit',
  'earliest joining date': 'earliestJoining', 'earliest joining': 'earliestJoining', 'joining date': 'earliestJoining',
  '# interviews done': 'interviewsDone', 'interviews done': 'interviewsDone', 'no of interviews': 'interviewsDone',
  'last round outcome': 'lastRoundOutcome', 'outcome': 'lastRoundOutcome',
  'interview scheduled date': 'interviewDate', 'interview date': 'interviewDate', 'scheduled date': 'interviewDate',
  'interview mode': 'interviewMode', 'mode': 'interviewMode',
  'duration (min)': 'interviewDuration', 'duration': 'interviewDuration',
  'owner (recruiter)': 'owner', 'owner': 'owner',
  'reason if rejected/dropped': 'rejectReason', 'reason': 'rejectReason', 'reason if rejected': 'rejectReason',
  'notes': 'notes', 'note': 'notes', 'remarks': 'notes'
}

// Headers arrive with stray spaces, line breaks and inconsistent punctuation:
// "Source Detail / Recruiter" vs "Source Detail/ Recruiter", "Location (Current)"
// vs "Location(Current)". Matching on letters and digits alone makes every such
// variant resolve to the same field.
const headerKey = h => String(h).toLowerCase().replace(/[^a-z0-9]/g, '')

// HEADER_MAP is written with readable keys; index it by the canonical form too.
const CANON_MAP = {}
for (const [k, field] of Object.entries(HEADER_MAP)) CANON_MAP[headerKey(k)] = field

// The field a sheet column belongs to, or '' when it has none.
export const fieldForHeader = h => CANON_MAP[headerKey(h)] || ''

// xlsx names unlabelled columns __EMPTY, __EMPTY_1, … — never real data.
const isJunkHeader = h => !h || /^__empty/i.test(h)

// Recover values stored under a header that had no mapping when the row was
// imported ("Source Detail/ Recruiter" before punctuation-insensitive matching).
// The value moves into its field only when that field is empty, and the extras
// entry is dropped only once the field holds the same value — so a genuine
// disagreement between the two is preserved rather than silently discarded.
export function promoteExtras(rec) {
  if (!rec || !rec.extras) return rec
  const extras = { ...rec.extras }
  const out = { ...rec }
  let changed = false
  for (const [header, value] of Object.entries(rec.extras)) {
    const field = fieldForHeader(header)
    const val = String(value ?? '').trim()
    if (!field || !val) continue
    if (!String(out[field] ?? '').trim()) { out[field] = val; changed = true }
    if (String(out[field]).trim() === val) { delete extras[header]; changed = true }
  }
  if (!changed) return rec
  out.extras = extras
  if (!Object.keys(extras).length) delete out.extras
  return out
}

const DATE_FIELDS = new Set(['dateSourced', 'dateSubmitted', 'earliestJoining', 'interviewDate'])
const pad2 = n => String(n).padStart(2, '0')

// A real Excel date cell is a serial number (45,000-ish), not text — writing
// String(val) would store "46210.00011574074". Convert serials and Date objects
// to a calendar date without going through a timezone, then normalize any
// human-typed date ("7/7/2026", "15th May 2026") to ISO so every stored date
// has the same shape.
function cellText(val, field) {
  if (val instanceof Date) {
    // Excel midnights land a millisecond either side of the day boundary;
    // round to the nearest whole day before reading it back.
    const d = new Date(Math.round(val.getTime() / 86400000) * 86400000)
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
  }
  if (typeof val === 'number' && DATE_FIELDS.has(field)) {
    const d = XLSX.SSF.parse_date_code(val)
    if (d && d.y) return `${d.y}-${pad2(d.m)}-${pad2(d.d)}`
  }
  const text = String(val).trim()
  if (DATE_FIELDS.has(field)) return toISODate(text) || text
  return text
}

// One sheet/PDF row -> the candidate fields it carries. Name is synced both
// ways so a sheet with "Candidate Name" and one with "First/Last Name" (our own
// export) both populate every name column.
//
// Columns with no matching field are NOT discarded: they are kept verbatim in
// `extras`, keyed by their original header, and re-emitted as their own columns
// on export. That way every column of an imported sheet survives the round trip.
function mapRow(row) {
  const norm = {}
  const extras = {}
  for (const [rawKey, val] of Object.entries(row)) {
    if (val == null || String(val).trim() === '') continue
    const header = String(rawKey).replace(/\s+/g, ' ').trim()
    const field = fieldForHeader(rawKey)
    const text = cellText(val, field)
    if (!text) continue
    if (field) norm[field] = text
    else if (!isJunkHeader(header)) extras[header] = text
  }
  if (Object.keys(extras).length) norm.extras = extras
  return syncNames(norm)
}

// Merge a mapped row onto an existing candidate; `extras` merges key-by-key
// instead of being replaced, so extra columns from several sheets accumulate.
function mergeInto(target, norm) {
  const { extras, ...rest } = norm
  Object.assign(target, rest)
  if (extras) target.extras = { ...(target.extras || {}), ...extras }
  return target
}

function rowsToCandidates(rows) {
  return rows.map((row, i) => {
    const cand = { ...emptyCandidate(), ...mapRow(row) }
    cand.id = 'imp-' + Date.now() + '-' + i
    return cand
  }).filter(cand => cand.name || cand.email) // drop empty rows
}

// Excel: merge every sheet into one candidate list keyed by Cand ID + Name,
// because the Submission Log spreads columns across multiple sheets.
async function parseSheet(file) {
  const buf = await file.arrayBuffer()
  // cellDates keeps real date cells as Date objects; cellText handles both
  // those and raw serials, so either representation lands as a calendar date.
  const wb = XLSX.read(buf, { type: 'array', cellDates: true })
  const merged = new Map()
  let order = 0

  wb.SheetNames.forEach(sheetName => {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' })
    rows.forEach(row => {
      const norm = mapRow(row)
      // Sheets that only carry an email column still identify a candidate.
      const rowKey = (norm.candId || '') + '|' + (norm.name || norm.email || '').toLowerCase()
      if (!norm.name && !norm.candId && !norm.email) return
      if (!merged.has(rowKey)) {
        const base = emptyCandidate()
        base.id = 'imp-' + Date.now() + '-' + order++
        merged.set(rowKey, base)
      }
      mergeInto(merged.get(rowKey), norm)
    })
  })

  const list = [...merged.values()].filter(c => c.name || c.email)
  // If only one sheet and nothing merged (plain single-sheet export), fall back.
  if (!list.length && wb.SheetNames.length) {
    return rowsToCandidates(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' }))
  }
  return list
}

// PDF: extract text, group into visual rows, read a header row then records.
async function parsePdf(file) {
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.href

  const buf = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buf }).promise
  const merged = new Map()
  let order = 0

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    const byY = {}
    content.items.forEach(it => {
      const y = Math.round(it.transform[5])
      ;(byY[y] = byY[y] || []).push(it)
    })
    const lines = Object.keys(byY)
      .sort((a, b) => b - a)
      .map(y => byY[y].map(it => it.str).join('  ').replace(/\s{3,}/g, '  ').trim())
      .filter(Boolean)

    const split = l => l.split(/\s{2,}|\t|\|/).map(s => s.trim()).filter(Boolean)
    const headerIdx = lines.findIndex(l => split(l).some(h => fieldForHeader(h)))
    if (headerIdx === -1) continue
    const headers = split(lines[headerIdx])

    lines.slice(headerIdx + 1).forEach(l => {
      const cells = split(l)
      if (!cells.length) return
      const row = {}
      headers.forEach((h, idx) => { if (cells[idx]) row[h] = cells[idx] })
      const norm = mapRow(row)
      if (!norm.name && !norm.candId && !norm.email) return
      const rowKey = (norm.candId || '') + '|' + (norm.name || norm.email || '').toLowerCase()
      if (!merged.has(rowKey)) {
        const base = emptyCandidate()
        base.id = 'imp-' + Date.now() + '-' + order++
        merged.set(rowKey, base)
      }
      mergeInto(merged.get(rowKey), norm)
    })
  }
  return [...merged.values()].filter(c => c.name || c.email)
}

export async function parseCandidateFile(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return parsePdf(file)
  return parseSheet(file)
}
