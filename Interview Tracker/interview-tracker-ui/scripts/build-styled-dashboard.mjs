// STANDALONE styled workbook (ExcelJS) — Dashboard styled like a recruitment
// tracker: KPI tiles + Candidates-by-Status + Requirements-by-Client tables,
// live COUNTIF formulas, a Status dropdown on the data sheet, and a native pie
// chart (injected as OOXML). NOT used by the app.
// Output: ../data/Candidates_Submission_Log_Dashboard.xlsx
// Run: node scripts/build-styled-dashboard.mjs
import ExcelJS from 'exceljs'
import AdmZip from 'adm-zip'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { sampleCandidates as data } from '../src/data/sampleCandidates.js'
import { CANDIDATE_STATUS } from '../src/config/fields.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../../data/Candidates_Submission_Log_Dashboard.xlsx')

const KEY = [['candId', 'Cand ID'], ['reqId', 'Req ID'], ['client', 'Client'], ['name', 'Candidate Name']]
const ALL = [
  ...KEY, ['phone', 'Phone'], ['email', 'Email'], ['location', 'Location (Current)'],
  ['willingRelocate', 'Willing to Relocate'], ['education', 'Education'],
  ['totalExp', 'Total Experience (yrs)'], ['relevantExp', 'Relevant Experience'],
  ['noticePeriod', 'Notice Period'], ['source', 'Source'], ['recruiter', 'Source Detail / Recruiter'],
  ['dateSourced', 'Date Sourced'], ['dateSubmitted', 'Date Submitted'], ['currentCTC', 'Current CTC'],
  ['expectedCTC', 'Expected CTC'], ['offeredCTC', 'Offered CTC'], ['rateUnit', 'Rate Unit'],
  ['earliestJoining', 'Earliest Joining Date'], ['status', 'Status'], ['reqStatus', 'Requirement Status'],
  ['interviewsDone', '# Interviews Done'], ['lastRoundOutcome', 'Last Round Outcome'],
  ['owner', 'Owner (Recruiter)'], ['rejectReason', 'Reason if Rejected/Dropped'], ['notes', 'Notes']
]
const SC = "'All Columns'!$V:$V"   // Status column in All Columns
const CC = "'All Columns'!$C:$C"   // Client column
const GROUPS = [
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

// derived requirement figures (per client = 1 requirement)
const clients = [...new Set(data.map(c => c.client))]
const filledClients = clients.filter(cl => data.some(c => c.client === cl && c.status === 'Joined'))
const N = CANDIDATE_STATUS.length
const lastRow = data.length + 1

const wb = new ExcelJS.Workbook()
wb.creator = 'Interview Tracker'

// ---------- palette / helpers ----------
const NAVY = 'FF1F3864', ORANGE = 'FFC55A11', GREEN = 'FF548235', TAN = 'FFBF9000', HEAD = 'FF203864'
const WHITE = 'FFFFFFFF', LIGHT = 'FFF2F2F2', BORDER = 'FFBFBFBF'
const solid = argb => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } })
const thin = { style: 'thin', color: { argb: BORDER } }
const boxAll = { top: thin, left: thin, bottom: thin, right: thin }

const dash = wb.addWorksheet('Dashboard', { views: [{ showGridLines: false }] })
dash.columns = Array.from({ length: 16 }, () => ({ width: 15 }))

// title
dash.mergeCells('B2:K2')
const title = dash.getCell('B2')
title.value = 'Interview Tracker — Recruitment Dashboard'
title.font = { bold: true, size: 18, color: { argb: HEAD } }

// KPI tile: header row + value row (merged pair of columns)
function tile(col, hdrRow, label, valueRef, valueFormula, fill, pct) {
  const c2 = String.fromCharCode(col.charCodeAt(0) + 1)
  dash.mergeCells(`${col}${hdrRow}:${c2}${hdrRow}`)
  const h = dash.getCell(`${col}${hdrRow}`)
  h.value = label
  h.fill = solid(fill); h.font = { bold: true, color: { argb: WHITE }, size: 10 }
  h.alignment = { horizontal: 'center', vertical: 'middle' }
  h.border = boxAll
  const vRow = hdrRow + 1
  dash.mergeCells(`${col}${vRow}:${c2}${vRow + 1}`)
  const v = dash.getCell(`${col}${vRow}`)
  if (valueFormula) v.value = { formula: valueFormula }
  else v.value = valueRef
  v.font = { bold: true, size: 22, color: { argb: HEAD } }
  v.alignment = { horizontal: 'center', vertical: 'middle' }
  v.border = boxAll
  if (pct) v.numFmt = '0.0%'
}

// Row 1 of tiles (headers row 4, values 5-6)
tile('B', 4, 'TOTAL REQUIREMENTS', clients.length, null, NAVY)
tile('D', 4, 'OPEN REQUIREMENTS', clients.length - filledClients.length, null, ORANGE)
tile('F', 4, 'FILLED', filledClients.length, null, GREEN)
tile('H', 4, 'TOTAL CANDIDATES', null, "COUNTA('All Columns'!$D$2:$D$100000)", NAVY)
tile('J', 4, 'JOINED', null, `COUNTIF(${SC},"Joined")`, GREEN)
// Row 2 of tiles (headers row 8, values 9-10)
tile('B', 8, 'SUBMITTED TO CLIENT', null, `COUNTIF(${SC},"Submit to Client")`, NAVY)
tile('D', 8, 'IN INTERVIEW', null, `COUNTIF(${SC},"L1 Scheduled")+COUNTIF(${SC},"L2 Scheduled")+COUNTIF(${SC},"L1 TBS")+COUNTIF(${SC},"L2 TBS")`, NAVY)
tile('F', 8, 'OFFERS RELEASED', null, `COUNTIF(${SC},"Offer Accepted")+COUNTIF(${SC},"Offer Rejected")`, TAN)
tile('H', 8, 'FILL RATIO', null, 'IF(B5=0,0,F5/B5)', GREEN, true)
tile('J', 8, 'SUB → SELECT %', null, `IF(B9=0,0,(COUNTIF(${SC},"Final Select")+COUNTIF(${SC},"Joined")+COUNTIF(${SC},"Offer Accepted"))/B9)`, TAN, true)

// ---------- table styling helpers ----------
function sectionTitle(cell, text) {
  const c = dash.getCell(cell)
  c.value = text
  c.font = { bold: true, size: 13, color: { argb: HEAD } }
}
function headerCell(ref, text) {
  const c = dash.getCell(ref)
  c.value = text
  c.fill = solid(HEAD); c.font = { bold: true, color: { argb: WHITE } }
  c.alignment = { horizontal: 'center' }; c.border = boxAll
}

// Candidates by Status  (A14 title, header row 15, data rows 16..37) -> pie source
sectionTitle('A14', 'Candidates by Status')
headerCell('A15', 'Status'); headerCell('B15', 'Count')
CANDIDATE_STATUS.forEach((s, i) => {
  const r = 16 + i
  const a = dash.getCell(`A${r}`); a.value = s; a.border = boxAll
  const b = dash.getCell(`B${r}`)
  b.value = { formula: `COUNTIF(${SC},$A${r})` }
  b.alignment = { horizontal: 'center' }; b.border = boxAll
  if (i % 2) { a.fill = solid(LIGHT); b.fill = solid(LIGHT) }
})

// Requirements by Client (D14 title, header row 15, rows 16..)
sectionTitle('D14', 'Requirements by Client')
headerCell('D15', 'Client'); headerCell('E15', 'Open'); headerCell('F15', 'Filled'); headerCell('G15', 'Total')
clients.forEach((cl, i) => {
  const r = 16 + i
  dash.getCell(`D${r}`).value = cl
  dash.getCell(`E${r}`).value = { formula: `IF(COUNTIFS(${CC},$D${r},${SC},"Joined")>0,0,1)` }
  dash.getCell(`F${r}`).value = { formula: `IF(COUNTIFS(${CC},$D${r},${SC},"Joined")>0,1,0)` }
  dash.getCell(`G${r}`).value = 1
  ;['D', 'E', 'F', 'G'].forEach(col => {
    const c = dash.getCell(`${col}${r}`); c.border = boxAll
    if (col !== 'D') c.alignment = { horizontal: 'center' }
    if (i % 2) c.fill = solid(LIGHT)
  })
})

// Requirements by Status (D31 title) — counts requirements by derived Req Status
const REQ = `Lookups!$D$2:$D$${clients.length + 1}`
sectionTitle('D31', 'Requirements by Status')
headerCell('D32', 'Status'); headerCell('E32', 'Count')
const reqByStatus = [
  ['Open', `COUNTIF(${REQ},"Open")`],
  ['On Hold', `COUNTIF(${REQ},"On Hold")`],
  ['Filled', `COUNTIF(${REQ},"Filled")`],
  ['Total', `COUNTA(Lookups!$C$2:$C$${clients.length + 1})`]
]
reqByStatus.forEach(([label, formula], i) => {
  const r = 33 + i
  dash.getCell(`D${r}`).value = label
  dash.getCell(`E${r}`).value = { formula }
  dash.getCell(`E${r}`).alignment = { horizontal: 'center' }
  ;['D', 'E'].forEach(col => {
    const c = dash.getCell(`${col}${r}`); c.border = boxAll
    if (i % 2) c.fill = solid(LIGHT)
  })
  if (label === 'Total') dash.getCell(`D${r}`).font = { bold: true }
})

// Candidate Funnel (I14 title, header row 15, rows 16..21) — cumulative reach per stage
sectionTitle('I14', 'Candidate Funnel')
headerCell('I15', 'Stage'); headerCell('J15', 'Count'); headerCell('K15', 'Drop-off')
const sumCountif = arr => `SUM(COUNTIF(${SC},{${arr.map(s => `"${s}"`).join(',')}}))`
const G_SUBMIT = ['Submit to Client', 'Screen Select', 'L1 Scheduled', 'L1 Select', 'L1 Reject', 'L1 TBS', 'L1 Yet to Schedule', 'L2 Scheduled', 'L2 Select', 'L2 Reject', 'L2 TBS', 'L2 Yet to Schedule', 'Final Select', 'Final Reject', 'On Hold', 'Offer Accepted', 'Offer Rejected', 'Joined']
const G_INTERVIEW = ['L1 Scheduled', 'L1 Select', 'L1 Reject', 'L1 TBS', 'L1 Yet to Schedule', 'L2 Scheduled', 'L2 Select', 'L2 Reject', 'L2 TBS', 'L2 Yet to Schedule', 'Final Select', 'Final Reject', 'Offer Accepted', 'Offer Rejected', 'Joined']
const G_SELECTED = ['Final Select', 'Offer Accepted', 'Offer Rejected', 'Joined']
const G_OFFERED = ['Offer Accepted', 'Offer Rejected', 'Joined']
const G_JOINED = ['Joined']
const funnel = [
  ['Sourced', "COUNTA('All Columns'!$D$2:$D$100000)"],
  ['Submitted to Client', sumCountif(G_SUBMIT)],
  ['Interviewed', sumCountif(G_INTERVIEW)],
  ['Selected', sumCountif(G_SELECTED)],
  ['Offered', sumCountif(G_OFFERED)],
  ['Joined', sumCountif(G_JOINED)]
]
funnel.forEach(([stage, countFormula], i) => {
  const r = 16 + i
  dash.getCell(`I${r}`).value = stage
  dash.getCell(`J${r}`).value = { formula: countFormula }
  const dropCell = dash.getCell(`K${r}`)
  if (i === 0) dropCell.value = '—'
  else { dropCell.value = { formula: `IF(J${r - 1}=0,0,(J${r - 1}-J${r})/J${r - 1})` }; dropCell.numFmt = '0.0%' }
  ;['I', 'J', 'K'].forEach(col => {
    const c = dash.getCell(`${col}${r}`); c.border = boxAll
    if (col !== 'I') c.alignment = { horizontal: 'center' }
    if (i % 2) c.fill = solid(LIGHT)
  })
})

// ---------- Lookups sheet (dropdown source) ----------
const look = wb.addWorksheet('Lookups')
look.getCell('A1').value = 'Status'
look.getCell('A1').font = { bold: true }
CANDIDATE_STATUS.forEach((s, i) => { look.getCell(`A${i + 2}`).value = s })
wb.definedNames.add(`Lookups!$A$2:$A$${N + 1}`, 'STATUS_LIST')

// Helper: one row per requirement (client) with a derived Req Status.
// Filled if any Joined; On Hold if every candidate is On Hold; else Open.
look.getCell('C1').value = 'Client'; look.getCell('D1').value = 'Req Status'
look.getCell('C1').font = { bold: true }; look.getCell('D1').font = { bold: true }
clients.forEach((cl, i) => {
  const r = i + 2
  look.getCell(`C${r}`).value = cl
  look.getCell(`D${r}`).value = {
    formula: `IF(COUNTIFS(${CC},$C${r},${SC},"Joined")>0,"Filled",IF(COUNTIF(${CC},$C${r})=COUNTIFS(${CC},$C${r},${SC},"On Hold"),"On Hold","Open"))`
  }
})

// ---------- All Columns sheet + status dropdown ----------
const allWs = wb.addWorksheet('All Columns')
allWs.addRow(ALL.map(([, h]) => h))
allWs.getRow(1).font = { bold: true, color: { argb: WHITE } }
allWs.getRow(1).fill = solid(HEAD)
data.forEach(c => allWs.addRow(ALL.map(([f]) => c[f] ?? '')))
allWs.views = [{ state: 'frozen', ySplit: 1 }]
allWs.columns.forEach(col => { col.width = 16 })
for (let r = 2; r <= lastRow; r++) {
  allWs.getCell(`V${r}`).dataValidation = {
    type: 'list', allowBlank: true, formulae: ['STATUS_LIST'],
    showErrorMessage: true, errorTitle: 'Invalid status', error: 'Pick a value from the list.'
  }
}

// ---------- group sheets (plain) ----------
for (const [name, cols] of GROUPS) {
  const ws = wb.addWorksheet(name.slice(0, 31))
  ws.addRow(cols.map(([, h]) => h))
  ws.getRow(1).font = { bold: true, color: { argb: WHITE } }
  ws.getRow(1).fill = solid(HEAD)
  data.forEach(c => ws.addRow(cols.map(([f]) => c[f] ?? '')))
  ws.views = [{ state: 'frozen', ySplit: 1 }]
  ws.columns.forEach(col => { col.width = 18 })
}

await wb.xlsx.writeFile(OUT)
console.log('Styled dashboard (no chart) written -> ' + OUT)
