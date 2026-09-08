// STANDALONE workbook with a Dashboard sheet: live COUNTIF counts per
// Candidate Status + a native Excel PIE CHART bound to those counts.
// Counts recalc when data changes; the pie follows the counts. NOT used by the app.
// Output: ../data/Candidates_Submission_Log_Dashboard.xlsx
// Run: node scripts/build-dashboard-excel.mjs
import * as XLSX from 'xlsx'
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
// In "All Columns", Status is the 22nd column -> column V. Used by COUNTIF.
const STATUS_COL = 'V'

const SHEETS = [
  ['All Columns', ALL],
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

// ---- Dashboard sheet (FIRST) with live COUNTIF formulas ----
const N = CANDIDATE_STATUS.length
const aoa = [['Candidate Status', 'Count']]
CANDIDATE_STATUS.forEach(s => aoa.push([s, 0]))
aoa.push(['Total', 0])
const dash = XLSX.utils.aoa_to_sheet(aoa)
CANDIDATE_STATUS.forEach((s, i) => {
  const r = i + 2 // rows 2..N+1
  const count = data.filter(c => c.status === s).length
  dash['B' + r] = { t: 'n', f: `COUNTIF('All Columns'!$${STATUS_COL}:$${STATUS_COL},$A${r})`, v: count }
})
const totalRow = N + 2
dash['B' + totalRow] = { t: 'n', f: `SUM($B$2:$B$${N + 1})`, v: data.length }
dash['!cols'] = [{ wch: 22 }, { wch: 8 }]
XLSX.utils.book_append_sheet(wb, dash, 'Dashboard')

// ---- Data sheets ----
for (const [name, cols] of SHEETS) {
  const rows = data.map(c => Object.fromEntries(cols.map(([f, h]) => [h, c[f] ?? ''])))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), name.slice(0, 31))
}

// Named range for the status list -> used by the Status dropdown (works cross-sheet).
wb.Workbook = { Names: [{ Name: 'STATUS_LIST', Ref: `Dashboard!$A$2:$A$${N + 1}` }] }

XLSX.writeFile(wb, OUT)

// ================= Inject a native pie chart on the Dashboard sheet =================
const CAT = `Dashboard!$A$2:$A$${N + 1}`
const VAL = `Dashboard!$B$2:$B$${N + 1}`

const chartXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><c:chart><c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:r><a:t>Candidates by Status</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:autoTitleDeleted val="0"/><c:plotArea><c:layout/><c:pieChart><c:varyColors val="1"/><c:ser><c:idx val="0"/><c:order val="0"/><c:tx><c:strRef><c:f>Dashboard!$B$1</c:f></c:strRef></c:tx><c:cat><c:strRef><c:f>${CAT}</c:f></c:strRef></c:cat><c:val><c:numRef><c:f>${VAL}</c:f></c:numRef></c:val></c:ser><c:firstSliceAng val="0"/></c:pieChart></c:plotArea><c:legend><c:legendPos val="r"/><c:overlay val="0"/></c:legend><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart></c:chartSpace>`

const drawingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><xdr:twoCellAnchor><xdr:from><xdr:col>3</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>1</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>13</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>26</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="2" name="StatusPie"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" r:id="rId1"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor></xdr:wsDr>`

const drawingRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/></Relationships>`

const zip = new AdmZip(OUT)

// locate a worksheet file by sheet name via workbook rels
const wbXml = zip.readAsText('xl/workbook.xml')
const relsXml = zip.readAsText('xl/_rels/workbook.xml.rels')
function sheetPathFor(sheetName) {
  const m = [...wbXml.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)].find(x => x[1] === sheetName)
  if (!m) throw new Error(`sheet not found: ${sheetName}`)
  const rel = new RegExp(`<Relationship[^>]*Id="${m[2]}"[^>]*Target="([^"]+)"`).exec(relsXml)
  const t = rel[1].replace(/^\//, '')
  return t.startsWith('xl/') ? t : 'xl/' + t
}

const sheetPath = sheetPathFor('Dashboard')
const sheetFile = sheetPath.split('/').pop()

// ---- Status dropdown (data validation) on the "All Columns" sheet, column V ----
const allPath = sheetPathFor('All Columns')
const lastRow = data.length + 1 // header + rows
let allXml = zip.readAsText(allPath)
if (!/<dataValidations/.test(allXml)) {
  const dv = `<dataValidations count="1"><dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="${STATUS_COL}2:${STATUS_COL}${lastRow}"><formula1>STATUS_LIST</formula1></dataValidation></dataValidations>`
  // CT_Worksheet order: dataValidations must come BEFORE hyperlinks/printOptions/
  // pageMargins/pageSetup/headerFooter/*Breaks/ignoredErrors/drawing. Insert before
  // the first such element that exists, else right before </worksheet>.
  const anchor = ['<ignoredErrors', '<hyperlinks', '<printOptions', '<pageMargins', '<pageSetup', '<headerFooter', '<rowBreaks', '<colBreaks', '<drawing']
    .find(tag => allXml.includes(tag))
  allXml = anchor
    ? allXml.replace(anchor, dv + anchor)
    : allXml.replace('</worksheet>', dv + '</worksheet>')
  zip.updateFile(allPath, Buffer.from(allXml))
}

// add drawing ref to the Dashboard worksheet
let sheetXml = zip.readAsText(sheetPath)
if (!/<drawing /.test(sheetXml)) {
  sheetXml = sheetXml.replace('</worksheet>', '<drawing r:id="rId1"/></worksheet>')
  zip.updateFile(sheetPath, Buffer.from(sheetXml))
}
// worksheet rels -> drawing
const wsRelsPath = `xl/worksheets/_rels/${sheetFile}.rels`
const wsRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`
zip.addFile(wsRelsPath, Buffer.from(wsRels))

// drawing + chart parts
zip.addFile('xl/drawings/drawing1.xml', Buffer.from(drawingXml))
zip.addFile('xl/drawings/_rels/drawing1.xml.rels', Buffer.from(drawingRels))
zip.addFile('xl/charts/chart1.xml', Buffer.from(chartXml))

// register content types
let ct = zip.readAsText('[Content_Types].xml')
const overrides = '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>' +
  '<Override PartName="/xl/charts/chart1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>'
ct = ct.replace('</Types>', overrides + '</Types>')
zip.updateFile('[Content_Types].xml', Buffer.from(ct))

zip.writeZip(OUT)
console.log(`Dashboard + pie chart injected on sheet ${sheetPath}. Wrote ${OUT}`)
