// STANDALONE multi-sheet workbook — NOT used by the app.
// Splits the 92-candidate submission log into one sheet per column group
// (mirrors the source PDF layout). Output: ../data/Candidates_Submission_Log_MultiSheet.xlsx
// Run: node scripts/build-excel-multisheet.mjs
import * as XLSX from 'xlsx'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { sampleCandidates as data } from '../src/data/sampleCandidates.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Every group sheet repeats these key columns, then adds its own.
const KEY = [['candId', 'Cand ID'], ['reqId', 'Req ID'], ['client', 'Client'], ['name', 'Candidate Name']]

// [sheetName, [[field, header], ...]]
const SHEETS = [
  ['All Columns', [
    ...KEY, ['phone', 'Phone'], ['email', 'Email'], ['location', 'Location (Current)'],
    ['willingRelocate', 'Willing to Relocate'], ['education', 'Education'],
    ['totalExp', 'Total Experience (yrs)'], ['relevantExp', 'Relevant Experience'],
    ['noticePeriod', 'Notice Period'], ['source', 'Source'], ['recruiter', 'Source Detail / Recruiter'],
    ['dateSourced', 'Date Sourced'], ['dateSubmitted', 'Date Submitted'], ['currentCTC', 'Current CTC'],
    ['expectedCTC', 'Expected CTC'], ['offeredCTC', 'Offered CTC'], ['rateUnit', 'Rate Unit'],
    ['earliestJoining', 'Earliest Joining Date'], ['status', 'Status'], ['reqStatus', 'Requirement Status'],
    ['interviewsDone', '# Interviews Done'], ['lastRoundOutcome', 'Last Round Outcome'],
    ['owner', 'Owner (Recruiter)'], ['rejectReason', 'Reason if Rejected/Dropped'], ['notes', 'Notes']
  ]],
  ['Phone', [...KEY, ['phone', 'Phone']]],
  ['Email', [...KEY, ['email', 'Email']]],
  ['Experience', [...KEY, ['totalExp', 'Total Experience (yrs)'], ['relevantExp', 'Relevant Experience (yrs)']]],
  ['Notice Period', [...KEY, ['noticePeriod', 'Notice Period']]],
  ['Location', [...KEY, ['location', 'Location (Current)'], ['willingRelocate', 'Willing to Relocate']]],
  ['Education', [...KEY, ['education', 'Education']]],
  ['Source', [...KEY, ['source', 'Source']]],
  ['Recruiter', [...KEY, ['recruiter', 'Source Detail / Recruiter']]],
  ['Date Sourced', [...KEY, ['dateSourced', 'Date Sourced']]],
  ['Status', [...KEY, ['status', 'Status'], ['reqStatus', 'Requirement Status']]],
  ['Submission & CTC', [...KEY, ['dateSubmitted', 'Date Submitted'], ['currentCTC', 'Current CTC']]],
  ['Expected & Offered CTC', [...KEY, ['expectedCTC', 'Expected CTC'], ['offeredCTC', 'Offered CTC']]],
  ['Rate & Joining', [...KEY, ['rateUnit', 'Rate Unit'], ['earliestJoining', 'Earliest Joining Date']]],
  ['Interviews', [...KEY, ['interviewsDone', '# Interviews Done'], ['lastRoundOutcome', 'Last Round Outcome']]],
  ['Owner', [...KEY, ['owner', 'Owner (Recruiter)']]],
  ['Reason', [...KEY, ['rejectReason', 'Reason if Rejected/Dropped']]],
  ['Notes', [...KEY, ['notes', 'Notes']]]
]

const wb = XLSX.utils.book_new()
for (const [sheetName, cols] of SHEETS) {
  const rows = data.map(c => Object.fromEntries(cols.map(([f, h]) => [h, c[f] ?? ''])))
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)) // Excel 31-char sheet-name limit
}

const out = resolve(__dirname, '../../data/Candidates_Submission_Log_MultiSheet.xlsx')
XLSX.writeFile(wb, out)
console.log(`Wrote ${SHEETS.length} sheets x ${data.length} rows -> ${out}`)
