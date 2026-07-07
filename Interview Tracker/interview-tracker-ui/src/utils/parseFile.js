// Import candidates from Excel (.xlsx/.xls), CSV, or PDF (Submission Log).
import * as XLSX from 'xlsx'
import { emptyCandidate } from '../config/fields.js'

// Header text (lowercased) -> candidate field key. Tolerant of variants.
const HEADER_MAP = {
  'cand id': 'candId', 'candidate id': 'candId', 'candid': 'candId',
  'req id': 'reqId', 'requirement id': 'reqId', 'reqid': 'reqId',
  'client': 'client',
  'requirement status': 'reqStatus', 'req status': 'reqStatus',
  'candidate name': 'name', 'name': 'name', 'candidate': 'name',
  'email': 'email', 'email id': 'email', 'e-mail': 'email',
  'phone': 'phone', 'phone number': 'phone', 'contact': 'phone', 'mobile': 'phone',
  'location (current)': 'location', 'location': 'location', 'current location': 'location',
  'willing to relocate': 'willingRelocate', 'relocate': 'willingRelocate',
  'education': 'education', 'qualification': 'education',
  'total experience (yrs)': 'totalExp', 'total experience': 'totalExp', 'total exp': 'totalExp',
  'relevant experience (yrs)': 'relevantExp', 'relevant experience': 'relevantExp', 'skills': 'relevantExp', 'skill set': 'relevantExp',
  'notice period': 'noticePeriod', 'notice': 'noticePeriod',
  'source': 'source',
  'source detail / recruiter': 'recruiter', 'source detail': 'recruiter', 'recruiter': 'recruiter',
  'date sourced': 'dateSourced', 'sourced date': 'dateSourced',
  'date submitted': 'dateSubmitted', 'submitted date': 'dateSubmitted',
  'status': 'status', 'candidate status': 'status',
  'current ctc': 'currentCTC', 'ctc': 'currentCTC',
  'expected ctc': 'expectedCTC',
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

function rowsToCandidates(rows) {
  return rows.map((row, i) => {
    const cand = emptyCandidate()
    cand.id = 'imp-' + Date.now() + '-' + i
    for (const [rawKey, val] of Object.entries(row)) {
      const key = HEADER_MAP[String(rawKey).trim().toLowerCase()]
      if (key && val != null && String(val).trim() !== '') cand[key] = String(val).trim()
    }
    return cand
  }).filter(cand => cand.name || cand.email) // drop empty rows
}

// Excel: merge every sheet into one candidate list keyed by Cand ID + Name,
// because the Submission Log spreads columns across multiple sheets.
async function parseSheet(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const merged = new Map()
  let order = 0

  wb.SheetNames.forEach(sheetName => {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' })
    rows.forEach(row => {
      const norm = {}
      for (const [rawKey, val] of Object.entries(row)) {
        const key = HEADER_MAP[String(rawKey).trim().toLowerCase()]
        if (key && val != null && String(val).trim() !== '') norm[key] = String(val).trim()
      }
      const rowKey = (norm.candId || '') + '|' + (norm.name || '').toLowerCase()
      if (!norm.name && !norm.candId) return
      if (!merged.has(rowKey)) {
        const base = emptyCandidate()
        base.id = 'imp-' + Date.now() + '-' + order++
        merged.set(rowKey, base)
      }
      Object.assign(merged.get(rowKey), norm)
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
    const headerIdx = lines.findIndex(l => split(l).some(h => HEADER_MAP[h.toLowerCase()]))
    if (headerIdx === -1) continue
    const headers = split(lines[headerIdx])

    lines.slice(headerIdx + 1).forEach(l => {
      const cells = split(l)
      if (!cells.length) return
      const norm = {}
      headers.forEach((h, idx) => {
        const key = HEADER_MAP[h.toLowerCase()]
        if (key && cells[idx]) norm[key] = cells[idx]
      })
      if (!norm.name && !norm.candId) return
      const rowKey = (norm.candId || '') + '|' + (norm.name || '').toLowerCase()
      if (!merged.has(rowKey)) {
        const base = emptyCandidate()
        base.id = 'imp-' + Date.now() + '-' + order++
        merged.set(rowKey, base)
      }
      Object.assign(merged.get(rowKey), norm)
    })
  }
  return [...merged.values()].filter(c => c.name || c.email)
}

export async function parseCandidateFile(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return parsePdf(file)
  return parseSheet(file)
}
