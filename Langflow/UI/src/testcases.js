// Parse the flow's free-form output into structured test cases.
// Handles three shapes, most specific first: JSON array, markdown table,
// then labelled text blocks (TC001: ... Steps: ... Expected: ...).

const COLUMNS = [
  { key: 'id', label: 'TC ID' },
  { key: 'title', label: 'Title' },
  { key: 'priority', label: 'Priority' },
  { key: 'preconditions', label: 'Preconditions' },
  { key: 'steps', label: 'Steps' },
  { key: 'expected', label: 'Expected Result' }
]

export const TC_COLUMNS = COLUMNS

const pick = (obj, keys) => {
  for (const k of Object.keys(obj)) {
    const nk = k.toLowerCase().replace(/[^a-z]/g, '')
    if (keys.includes(nk)) return obj[k]
  }
  return ''
}

const asText = (v) => {
  if (v == null) return ''
  if (Array.isArray(v)) return v.map((x, i) => `${i + 1}. ${asText(x)}`).join('\n')
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function normalizeObj(o, i) {
  return {
    id: asText(pick(o, ['id', 'tcid', 'testcaseid', 'testid', 'tc'])) || `TC${i + 1}`,
    title: asText(pick(o, ['title', 'name', 'testcase', 'scenario', 'description', 'summary'])),
    priority: asText(pick(o, ['priority', 'severity'])),
    preconditions: asText(pick(o, ['preconditions', 'precondition', 'prerequisites', 'setup'])),
    steps: asText(pick(o, ['steps', 'teststeps', 'step', 'procedure', 'action'])),
    expected: asText(pick(o, ['expected', 'expectedresult', 'expectedoutput', 'result']))
  }
}

function tryJson(text) {
  // Look for a JSON array anywhere in the text (possibly fenced).
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidates = [fence && fence[1], text].filter(Boolean)
  for (const c of candidates) {
    const start = c.indexOf('[')
    const end = c.lastIndexOf(']')
    if (start === -1 || end <= start) continue
    try {
      const arr = JSON.parse(c.slice(start, end + 1))
      if (Array.isArray(arr) && arr.length && typeof arr[0] === 'object') {
        return arr.map(normalizeObj)
      }
    } catch {
      /* not JSON, fall through */
    }
  }
  return null
}

function tryMarkdownTable(text) {
  const lines = text.split('\n').map((l) => l.trim())
  const rows = lines.filter((l) => l.startsWith('|') && l.endsWith('|'))
  if (rows.length < 2) return null
  const cells = (l) =>
    l.slice(1, -1).split('|').map((c) => c.trim())
  const header = cells(rows[0]).map((h) => h.toLowerCase())
  // Row 1 is the separator (---). Data starts at row 2.
  const isSep = /^[-:\s|]+$/.test(rows[1])
  const dataRows = rows.slice(isSep ? 2 : 1)
  if (!dataRows.length) return null

  const colIndex = (keys) =>
    header.findIndex((h) => keys.some((k) => h.replace(/[^a-z]/g, '').includes(k)))
  const map = {
    id: colIndex(['id', 'tc']),
    title: colIndex(['title', 'scenario', 'name', 'description']),
    priority: colIndex(['priority', 'severity']),
    preconditions: colIndex(['precondition', 'prerequisite']),
    steps: colIndex(['step', 'procedure', 'action']),
    expected: colIndex(['expected', 'result'])
  }
  return dataRows.map((r, i) => {
    const c = cells(r)
    const get = (idx) => (idx >= 0 && idx < c.length ? c[idx] : '')
    return {
      id: get(map.id) || `TC${i + 1}`,
      title: get(map.title),
      priority: get(map.priority),
      preconditions: get(map.preconditions),
      steps: get(map.steps),
      expected: get(map.expected)
    }
  })
}

function tryBlocks(text) {
  // Split on TC id markers like "TC001", "Test Case 1:", "TC-12".
  const re = /(?:^|\n)\s*(?:test\s*case\s*|tc[-\s]?)(\d+)[:.)\-\s]/gi
  const marks = []
  let m
  while ((m = re.exec(text)) !== null) marks.push({ idx: m.index, num: m[1] })
  if (marks.length < 2) return null

  const field = (block, keys) => {
    const rx = new RegExp(
      `(?:${keys.join('|')})\\s*[:\\-]\\s*([\\s\\S]*?)(?=\\n\\s*(?:title|priority|severity|precondition|prerequisite|steps?|procedure|action|expected|result)\\s*[:\\-]|$)`,
      'i'
    )
    const r = block.match(rx)
    return r ? r[1].trim() : ''
  }
  return marks.map((mk, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].idx : text.length
    const block = text.slice(mk.idx, end)
    const firstLine = block.split('\n')[0].replace(/^[\s\S]*?[:.)\-\s]/, '').trim()
    return {
      id: `TC${mk.num}`,
      title: field(block, ['title', 'scenario', 'name']) || firstLine,
      priority: field(block, ['priority', 'severity']),
      preconditions: field(block, ['precondition', 'prerequisite', 'pre-conditions']),
      steps: field(block, ['steps', 'test steps', 'procedure', 'action']),
      expected: field(block, ['expected', 'expected result', 'result'])
    }
  })
}

// Returns { cases: [...], format: 'json'|'table'|'blocks'|'none' }
export function parseTestCases(text) {
  if (!text || !text.trim()) return { cases: [], format: 'none' }
  const json = tryJson(text)
  if (json && json.length) return { cases: json, format: 'json' }
  const table = tryMarkdownTable(text)
  if (table && table.length) return { cases: table, format: 'table' }
  const blocks = tryBlocks(text)
  if (blocks && blocks.length) return { cases: blocks, format: 'blocks' }
  return { cases: [], format: 'none' }
}

// ---- Exports -------------------------------------------------------------

function download(filename, mime, content) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`

export function exportCsv(cases, name = 'test-cases.csv') {
  const head = COLUMNS.map((c) => csvCell(c.label)).join(',')
  const rows = cases.map((tc) => COLUMNS.map((c) => csvCell(tc[c.key])).join(','))
  download(name, 'text/csv;charset=utf-8', '﻿' + [head, ...rows].join('\r\n'))
}

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')

// .xls via HTML table — Excel opens it natively, no dependency needed.
export function exportExcel(cases, name = 'test-cases.xls') {
  const head = `<tr>${COLUMNS.map((c) => `<th>${esc(c.label)}</th>`).join('')}</tr>`
  const body = cases
    .map((tc) => `<tr>${COLUMNS.map((c) => `<td>${esc(tc[c.key])}</td>`).join('')}</tr>`)
    .join('')
  const html = `<html><head><meta charset="utf-8"/></head><body><table border="1">${head}${body}</table></body></html>`
  download(name, 'application/vnd.ms-excel', html)
}

export function exportJson(cases, name = 'test-cases.json') {
  download(name, 'application/json', JSON.stringify(cases, null, 2))
}
