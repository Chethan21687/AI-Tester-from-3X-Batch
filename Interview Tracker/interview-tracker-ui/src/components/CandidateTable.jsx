import { useState, useMemo } from 'react'
import { downloadICS, mailtoSchedule } from '../utils/schedule.js'
import { statusClass, CANDIDATE_STATUS, REQ_STATUS } from '../config/fields.js'

const COLUMNS = [
  { key: 'candId', label: 'Cand ID' },
  { key: 'reqId', label: 'Req' },
  { key: 'client', label: 'Client' },
  { key: 'name', label: 'Candidate' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'totalExp', label: 'Total Exp' },
  { key: 'noticePeriod', label: 'Notice' },
  { key: 'location', label: 'Location' },
  { key: 'currentCTC', label: 'Cur CTC' },
  { key: 'expectedCTC', label: 'Exp CTC' },
  { key: 'offeredCTC', label: 'Offered' },
  { key: 'recruiter', label: 'Recruiter' },
  { key: 'dateSourced', label: 'Date Sourced' },
  { key: 'reqStatus', label: 'Req Status', pill: true },
  { key: 'status', label: 'Status', pill: true },
  { key: 'interviewMode', label: 'Mode' },
  { key: 'interviewDuration', label: 'Dur' },
  { key: 'lastRoundOutcome', label: 'Outcome', pill: true }
]

// Columns holding human-typed dates ("21st May 2026", "4th June 2026", …).
const DATE_COLS = new Set(['dateSourced', 'dateSubmitted', 'interviewDate', 'earliestJoining'])

// Title-case a client name for display so any stored casing ("CODEYOUNG",
// "codeyoung") shows the same canonical spelling as the dashboard.
const titleCaseClient = v =>
  String(v ?? '').trim().replace(/\s+/g, ' ').toLowerCase().replace(/\b\p{L}/gu, ch => ch.toUpperCase())

// Parse a free-text date to a timestamp for chronological sorting (NaN if none).
function parseDateish(v) {
  if (!v) return NaN
  const s = String(v).replace(/(\d+)(st|nd|rd|th)/gi, '$1').trim()
  const d = new Date(s.match(/\d{4}/) ? s : `${s} ${new Date().getFullYear()}`)
  return isNaN(d) ? NaN : d.getTime()
}

// Uniform date display (e.g. "21st May 2026") so ISO-stored and free-text dates
// look the same in the table.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
function formatDateCell(v) {
  const t = parseDateish(v)
  if (isNaN(t)) return v || '—'
  const d = new Date(t)
  return `${ordinal(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// Compare two cell values: numeric when both look numeric, else text.
function compare(a, b) {
  const na = parseFloat(String(a).replace(/[^0-9.-]/g, ''))
  const nb = parseFloat(String(b).replace(/[^0-9.-]/g, ''))
  const aNum = String(a).trim() !== '' && !isNaN(na)
  const bNum = String(b).trim() !== '' && !isNaN(nb)
  if (aNum && bNum) return na - nb
  return String(a || '').localeCompare(String(b || ''), undefined, { numeric: true })
}

export default function CandidateTable({ candidates, onEdit, onDelete, onStatusChange, onReqStatusChange }) {
  // Default: newest sourced candidates first.
  const [sort, setSort] = useState({ key: 'dateSourced', dir: -1 })

  const sorted = useMemo(() => {
    if (!sort.key) return candidates
    const isDate = DATE_COLS.has(sort.key)
    return [...candidates].sort((x, y) => {
      if (isDate) {
        const tx = parseDateish(x[sort.key]), ty = parseDateish(y[sort.key])
        // Blank/invalid dates always sort to the bottom regardless of direction.
        if (isNaN(tx) && isNaN(ty)) return 0
        if (isNaN(tx)) return 1
        if (isNaN(ty)) return -1
        return (tx - ty) * sort.dir
      }
      return compare(x[sort.key], y[sort.key]) * sort.dir
    })
  }, [candidates, sort])

  const toggleSort = key =>
    setSort(s => (s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }))
  const arrow = key => (sort.key === key ? (sort.dir === 1 ? ' ▲' : ' ▼') : '')

  if (!candidates.length) {
    return <div className="card empty">No candidates match. Add one or import the Submission Log file.</div>
  }
  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            {COLUMNS.map(col => (
              <th key={col.key} className="sortable" onClick={() => toggleSort(col.key)}>
                {col.label}{arrow(col.key)}
              </th>
            ))}
            <th>Set Status</th>
            <th>Interview</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(c => (
            <tr key={c.id}>
              {COLUMNS.map(col => (
                <td key={col.key} className={col.key === 'email' ? '' : 'nowrap'}>
                  {col.key === 'reqStatus'
                    ? (
                      /* Inline requirement status — auto-updates on change. */
                      <select
                        className={`status-select ${statusClass(c.reqStatus)}`}
                        value={c.reqStatus || 'Open'}
                        onChange={e => onReqStatusChange(c.id, e.target.value)}
                      >
                        {REQ_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )
                    : col.pill
                      ? (c[col.key] ? <span className={statusClass(c[col.key])}>{c[col.key]}</span> : '—')
                      : DATE_COLS.has(col.key)
                        ? formatDateCell(c[col.key])
                        : col.key === 'client'
                          ? (titleCaseClient(c.client) || '—')
                          : (c[col.key] || '—')}
                </td>
              ))}
              <td className="nowrap">
                {/* Inline status — auto-updates on change (persists + refreshes dashboard). */}
                <select
                  className={`status-select ${statusClass(c.status)}`}
                  value={c.status || ''}
                  onChange={e => onStatusChange(c.id, e.target.value)}
                >
                  {CANDIDATE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="nowrap">
                <button className="btn tiny" title="Email interview details" disabled={!c.email}
                  onClick={() => { window.location.href = mailtoSchedule(c) }}>✉</button>
                <button className="btn tiny" title="Calendar invite (.ics)" disabled={!c.interviewDate}
                  onClick={() => downloadICS(c)}>📅</button>
              </td>
              <td className="nowrap">
                <button className="icon-act edit" title="Edit candidate" aria-label="Edit candidate" onClick={() => onEdit(c)}>✏️</button>
                <button className="icon-act del" title="Delete candidate" aria-label="Delete candidate" onClick={() => onDelete(c)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
