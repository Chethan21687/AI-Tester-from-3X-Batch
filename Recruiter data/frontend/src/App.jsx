import { useCallback, useEffect, useRef, useState } from 'react'
import * as api from './api'
import './App.css'

/* ---------- Date helpers ---------- */
const MONTH_INDEX = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
}

// Parse "3rd Aug 2026" (or "12th Aug 2026") into a comparable Date; returns
// null when the string can't be parsed. Used for sorting and latest-date.
function parseDateLabel(dateStr) {
  const parts = String(dateStr || '').trim().split(/\s+/)
  let day = null
  let month = null
  let year = null
  for (const token of parts) {
    const m = MONTH_INDEX[token.slice(0, 3)]
    if (m !== undefined) month = m
    const y = token.match(/(19|20)\d{2}/)
    if (y) year = Number(y[0])
    const d = token.match(/^(\d{1,2})(st|nd|rd|th)?$/i)
    if (d) day = Number(d[1])
  }
  if (day === null || month === null || year === null) return null
  return new Date(year, month, day)
}

/* ---------- Status badge colors ---------- */
const STATUS_COLORS = {
  Screening: { bg: '#e0f2fe', fg: '#075985' },
  'Screening Reject': { bg: '#fee2e2', fg: '#b91c1c' },
  'Screening FBP': { bg: '#fef3c7', fg: '#b45309' },
  'Screening Scheduled': { bg: '#dbeafe', fg: '#1d4ed8' },
  'L1 Reject': { bg: '#fecaca', fg: '#991b1b' },
  'L1 Select': { bg: '#bbf7d0', fg: '#166534' },
  'L1 Scheduled': { bg: '#e0e7ff', fg: '#4338ca' },
  'L1 TBS': { bg: '#fef3c7', fg: '#b45309' },
  'L1 FBP': { bg: '#fef3c7', fg: '#b45309' },
  'L1 Yet to schedule': { bg: '#ede9fe', fg: '#6d28d9' },
  'L2 Reject': { bg: '#fca5a5', fg: '#7f1d1d' },
  'L2 Select': { bg: '#86efac', fg: '#14532d' },
  'L2 Scheduled': { bg: '#c7d2fe', fg: '#3730a3' },
  'L2 TBS': { bg: '#fde68a', fg: '#92400e' },
  'L2 FBP': { bg: '#fde68a', fg: '#92400e' },
  'Final Reject': { bg: '#f87171', fg: '#ffffff' },
  'Final Select': { bg: '#4ade80', fg: '#14532d' },
  'Final Scheduled': { bg: '#a5b4fc', fg: '#312e81' },
  'Final TBS': { bg: '#facc15', fg: '#713f12' },
  'Final FBP': { bg: '#facc15', fg: '#713f12' },
  'Client Hold': { bg: '#fbcfe8', fg: '#9d174d' },
  'Req Hold': { bg: '#fbcfe8', fg: '#9d174d' },
  'Candidate Drop': { bg: '#e5e7eb', fg: '#374151' },
  Offered: { bg: '#d1fae5', fg: '#047857' },
  'Offer drop': { bg: '#fecdd3', fg: '#9f1239' },
  Joined: { bg: '#10b981', fg: '#ffffff' },
  'Profile Shared': { bg: '#d1fae5', fg: '#047857' },
  'Profile Shared,Feedback Pending': { bg: '#cffafe', fg: '#0f766e' },
  'Notice Period issue': { bg: '#fef3c7', fg: '#b45309' },
  'Awaiting AI Bot Scroes': { bg: '#f1f5f9', fg: '#475569' },
  Duplicate: { bg: '#f1f5f9', fg: '#475569' },
}
const DEFAULT_STATUS = { bg: '#f1f5f9', fg: '#475569' }

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || DEFAULT_STATUS
  return (
    <span className="status-badge" style={{ background: colors.bg, color: colors.fg }}>
      {status}
    </span>
  )
}

/* ---------- Avatar with initials ---------- */
const AVATAR_COLORS = [
  ['#f0fdf4', '#166534'],
  ['#fef2f2', '#991b1b'],
  ['#eff6ff', '#1e40af'],
  ['#faf5ff', '#6b21a8'],
  ['#fff7ed', '#c2410c'],
  ['#f0fdfa', '#0f766e'],
]

function Avatar({ name, index }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  const [bg, fg] = AVATAR_COLORS[index % AVATAR_COLORS.length]
  return (
    <span className="avatar" style={{ background: bg, color: fg }}>
      {initials}
    </span>
  )
}

/* ---------- Modal shell ---------- */
function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="hint">{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ---------- Upload modal ---------- */
function UploadModal({ onClose, onUploaded }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [warnings, setWarnings] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    setError(null)
    setMessage(null)
    setWarnings([])
    try {
      const result = await api.uploadExcel(file)
      setMessage(result.message)
      setWarnings(result.transfer_warnings || [])
      setFile(null)
      onUploaded()
      if (!(result.transfer_warnings || []).length) {
        setTimeout(onClose, 1200)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal
      title="Upload daily Excel"
      subtitle="Rows are matched to existing candidates by phone and email, then updated in place."
      onClose={onClose}
    >
      <form onSubmit={handleUpload}>
        <label
          className={`dropzone ${dragOver ? 'dragover' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0])
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          {file ? (
            <p className="file-chosen">📄 {file.name}</p>
          ) : (
            <>
              <p className="drop-title">Drag your Excel file here</p>
              <p className="drop-sub">or click to browse for a .xlsx file</p>
            </>
          )}
        </label>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        {warnings.length > 0 && (
          <div className="warning-box" role="alert">
            <strong>Recruiter changes detected</strong>
            <p>These candidates were previously under a different recruiter and have been reassigned:</p>
            <ul>
              {warnings.map((w, i) => (
                <li key={i}>
                  <span className="warning-name">{w.name}</span> — {w.from} → {w.to}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!file || uploading}>
            {uploading ? 'Uploading…' : 'Upload and update'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ---------- Add recruiter modal ---------- */
function AddRecruiterModal({ onClose, onAdded }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setMessage(null)
    try {
      await api.addRecruiter(name, email)
      setMessage(`Recruiter "${name.trim()}" added`)
      onAdded()
      setTimeout(onClose, 1200)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Modal
      title="Add new recruiter"
      subtitle="Register a recruiter who just joined the organization."
      onClose={onClose}
    >
      <form onSubmit={handleAdd} className="form-stack">
        <div className="field">
          <label htmlFor="recruiter-name">Recruiter name</label>
          <input
            id="recruiter-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            autoFocus
            required
          />
        </div>
        <div className="field">
          <label htmlFor="recruiter-email">Email (optional)</label>
          <input
            id="recruiter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="priya.sharma@company.com"
          />
        </div>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!name.trim()}>
            Add recruiter
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ---------- Delete recruiter confirm modal ---------- */
function DeleteRecruiterModal({ recruiter, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  async function handleDelete() {
    if (!recruiter.id) {
      setError('Cannot delete: this recruiter has no registered account.')
      return
    }
    setDeleting(true)
    setError(null)
    try {
      await api.deleteRecruiter(recruiter.id)
      onDeleted(recruiter)
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <Modal
      title={`Delete ${recruiter.recruiter}?`}
      subtitle="The recruiter will be removed from the dashboard. Their candidate history stays in the database."
      onClose={onClose}
    >
      {error && <p className="error">{error}</p>}
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={deleting}>
          Cancel
        </button>
        <button type="button" className="btn-danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete recruiter'}
        </button>
      </div>
    </Modal>
  )
}

/* ---------- KPI strip ---------- */
function KpiStrip({ stats, sources, onOpenClients }) {
  const totalCandidates = stats.reduce((sum, s) => sum + s.candidates, 0)
  // Distinct clients come from the sources-of-applications breakdown so the
  // count matches the dashboard donut.
  const totalClients = sources ? sources.length : 0
  // Latest data date: compare parsed dates, not raw strings (so "12th Aug"
  // beats "8th Aug" instead of the other way around).
  const latestDate = stats.reduce((max, s) => {
    if (!s.latest_date) return max
    const d = parseDateLabel(s.latest_date)
    return d && (!max || !max.maxDate || d > max.maxDate) ? { value: s.latest_date, maxDate: d } : max
  }, null)?.value || ''

  const kpis = [
    { label: 'Total candidates', value: totalCandidates, onClick: null },
    { label: 'Recruiters', value: stats.length, onClick: null },
    { label: 'Clients', value: totalClients, onClick: onOpenClients },
    { label: 'Latest data date', value: latestDate || '—', onClick: null },
  ]

  return (
    <div className="kpi-strip">
      {kpis.map((k) => (
        <div
          className={`kpi ${k.onClick ? 'kpi-clickable' : ''}`}
          key={k.label}
          onClick={k.onClick}
          role={k.onClick ? 'button' : undefined}
          tabIndex={k.onClick ? 0 : undefined}
        >
          <span className="kpi-value">{k.value}</span>
          <span className="kpi-label">{k.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- Status breakdown (inline in recruiter card) ---------- */
function StatusBreakdown({ status_counts, total }) {
  const entries = Object.entries(status_counts || {}).sort((a, b) => b[1] - a[1])

  if (entries.length === 0) {
    return <p className="status-empty">No status data yet.</p>
  }

  return (
    <div className="status-breakdown">
      {entries.map(([status, count]) => {
        const pct = total ? Math.round((count / total) * 100) : 0
        const colors = STATUS_COLORS[status] || DEFAULT_STATUS
        return (
          <div className="status-row" key={status}>
            <div className="status-row-top">
              <span className="status-chip" style={{ background: colors.bg, color: colors.fg }}>
                {status}
              </span>
              <span className="status-row-count">
                {count} · {pct}%
              </span>
            </div>
            <div className="status-track">
              <div
                className="status-fill"
                style={{ width: `${pct}%`, background: colors.fg }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Recruiter card ---------- */
function RecruiterCard({ recruiter, index, onSelect, selected, onDelete }) {
  return (
    <div className={`recruiter-card ${selected ? 'selected' : ''}`}>
      <button className="recruiter-card-head" onClick={() => onSelect(recruiter.recruiter)} aria-pressed={selected}>
        <Avatar name={recruiter.recruiter} index={index} />
        <div className="recruiter-meta">
          <span className="recruiter-name">{recruiter.recruiter}</span>
          <span className="recruiter-sub">
            {recruiter.clients} client{recruiter.clients === 1 ? '' : 's'}
          </span>
        </div>
        <div className="recruiter-count">
          <span className="recruiter-count-value">{recruiter.candidates}</span>
          <span className="recruiter-count-label">candidates</span>
        </div>
      </button>
      <div className="recruiter-foot">
        {recruiter.latest_date && <span className="recruiter-date">📅 {recruiter.latest_date}</span>}
        <span className="recruiter-foot-right">
          <button
            className="recruiter-delete"
            title="Delete this recruiter"
            aria-label={`Delete ${recruiter.recruiter}`}
            onClick={() => onDelete(recruiter)}
          >
            ✕
          </button>
          <span className="recruiter-link">{selected ? 'Selected' : 'Select →'}</span>
        </span>
      </div>
      <StatusBreakdown status_counts={recruiter.status_counts} total={recruiter.candidates} />
    </div>
  )
}

/* ---------- Candidate detail modal ---------- */
const STATUS_OPTIONS = [
  'Screening',
  'Screening Reject',
  'Screening FBP',
  'Screening Scheduled',
  'L1 Reject',
  'L1 Select',
  'L1 Scheduled',
  'L1 TBS',
  'L1 FBP',
  'L1 Yet to schedule',
  'L2 Reject',
  'L2 Select',
  'L2 Scheduled',
  'L2 TBS',
  'L2 FBP',
  'Final Reject',
  'Final Select',
  'Final Scheduled',
  'Final TBS',
  'Final FBP',
  'Client Hold',
  'Req Hold',
  'Candidate Drop',
  'Offered',
  'Offer drop',
  'Joined',
  'Profile Shared',
  'Profile Shared,Feedback Pending',
  'Notice Period issue',
  'Awaiting AI Bot Scroes',
  'Duplicate',
  'No status',
]

function CandidateDetailModal({ candidate, onClose, onStatusChange }) {
  const [status, setStatus] = useState(candidate.status || 'No status')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  async function handleStatusChange(e) {
    const newStatus = e.target.value
    setStatus(newStatus)
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      const updated = await api.updateCandidateStatus(candidate.id, newStatus)
      setSaved(true)
      onStatusChange(updated)
    } catch (err) {
      setSaveError(err.message)
      setStatus(candidate.status || 'No status')
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    ['Date', candidate.date],
    ['Client', candidate.client],
    ['Skill', candidate.skill],
    ['Total experience', candidate.total_experience],
    ['Relevant experience', candidate.relevant_experience],
    ['Notice period', candidate.notice_period],
    ['Current location', candidate.current_location],
    ['Preferred location', candidate.preferred_location],
    ['Current CTC', candidate.current_ctc],
    ['Expected CTC', candidate.expected_ctc],
    ['Education', candidate.education],
    ['Email', candidate.email],
    ['Phone', candidate.phone],
  ]

  const colors = STATUS_COLORS[status] || DEFAULT_STATUS

  return (
    <Modal title={candidate.name} subtitle={candidate.recruiter ? `Recruiter: ${candidate.recruiter}` : ''} onClose={onClose}>
      <div className="status-edit">
        <span className="status-edit-label">Status</span>
        <select
          className="status-select"
          value={status}
          onChange={handleStatusChange}
          disabled={saving}
          style={{ background: colors.bg, color: colors.fg }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="status-edit-feedback">
          {saving ? 'Saving…' : saved ? '✓ Saved' : saveError ? `Error: ${saveError}` : 'Change status to auto-update'}
        </span>
      </div>
      <div className="detail-grid">
        {fields.map(
          ([label, value]) =>
            value && (
              <div className="detail-row" key={label}>
                <span className="detail-label">{label}</span>
                <span className="detail-value">{value}</span>
              </div>
            )
        )}
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  )
}

/* ---------- Edit candidate modal ---------- */
const EDIT_FIELDS = [
  ['name', 'Name'],
  ['date', 'Date'],
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
  ['recruiter', 'Recruiter'],
]

function EditCandidateModal({ candidate, onClose, onSaved }) {
  const [form, setForm] = useState(() =>
    Object.fromEntries(EDIT_FIELDS.map(([key]) => [key, candidate[key] || '']))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const updated = await api.updateCandidate(candidate.id, form)
      onSaved(updated)
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title={`Edit ${candidate.name}`} subtitle="Update the candidate's details." onClose={onClose}>
      <form onSubmit={handleSave} className="form-stack">
        <div className="edit-grid">
          {EDIT_FIELDS.map(([key, label]) => (
            <div className="field" key={key}>
              <label htmlFor={`edit-${key}`}>{label}</label>
              <input
                id={`edit-${key}`}
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
              />
            </div>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ---------- Delete candidate confirm modal ---------- */
function DeleteCandidateModal({ candidate, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await api.deleteCandidate(candidate.id)
      onDeleted(candidate)
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <Modal
      title={`Delete ${candidate.name}?`}
      subtitle="This removes the candidate from the tracker. This cannot be undone."
      onClose={onClose}
    >
      {error && <p className="error">{error}</p>}
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={deleting}>
          Cancel
        </button>
        <button type="button" className="btn-danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete candidate'}
        </button>
      </div>
    </Modal>
  )
}

/* ---------- Transaction logs modal ---------- */
function TransactionLogsModal({ onClose }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await api.getLogs({ limit: 500 })
        if (!cancelled) setLogs(data.logs || [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function formatAt(iso) {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleString()
    } catch {
      return iso
    }
  }

  return (
    <Modal
      title="Transaction History"
      subtitle="Every status change made on a candidate, newest first."
      onClose={onClose}
    >
      <div className="logs-wrap">
        {loading ? (
          <p className="empty-state">Loading logs…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : logs.length === 0 ? (
          <p className="empty-state">No status changes recorded yet.</p>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Candidate</th>
                <th>Recruiter</th>
                <th>From</th>
                <th>To</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="log-time">{formatAt(log.at)}</td>
                  <td>{log.candidate_name || log.candidate_id}</td>
                  <td>{log.recruiter || '—'}</td>
                  <td>
                    <StatusBadge status={log.from} />
                  </td>
                  <td>
                    <StatusBadge status={log.to} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  )
}

/* ---------- Paginated candidate list ---------- */
const PAGE_SIZE = 10

// Compact page-number list: 1 … 4 5 6 … 20 when there are many pages
function pageNumbers(pageCount, current) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }
  const nums = [1, current - 1, current, current + 1, pageCount]
    .filter((n) => n >= 1 && n <= pageCount)
    .sort((a, b) => a - b)
    .filter((n, i, arr) => arr.indexOf(n) === i)
  const out = []
  let prev = 0
  for (const n of nums) {
    if (n - prev > 1) out.push('…')
    out.push(n)
    prev = n
  }
  return out
}

function CandidateList({ candidates, onOpenCandidate }) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(candidates.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const start = (current - 1) * PAGE_SIZE
  const pageItems = candidates.slice(start, start + PAGE_SIZE)

  if (candidates.length === 0) {
    return <p className="empty-state">No candidates found.</p>
  }

  return (
    <>
      <div className="client-list">
        {pageItems.map((c) => (
          <div className="client-list-row" key={c.id}>
            <a
              className="candidate-link"
              href="#"
              onClick={(e) => {
                e.preventDefault()
                onOpenCandidate(c)
              }}
            >
              {c.name}
            </a>
            <StatusBadge status={c.status || ''} />
          </div>
        ))}
      </div>
      {pageCount > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="page-btn"
            onClick={() => setPage(current - 1)}
            disabled={current <= 1}
          >
            ‹ Prev
          </button>
          {pageNumbers(pageCount, current).map((n, i) =>
            n === '…' ? (
              <span className="page-ellipsis" key={`e${i}`}>
                …
              </span>
            ) : (
              <button
                type="button"
                key={n}
                className={`page-btn ${n === current ? 'active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            )
          )}
          <button
            type="button"
            className="page-btn"
            onClick={() => setPage(current + 1)}
            disabled={current >= pageCount}
          >
            Next ›
          </button>
        </div>
      )}
    </>
  )
}

/* ---------- Client candidates modal ---------- */
function ClientCandidatesModal({ client, candidates, onClose, onOpenCandidate }) {
  const clientCandidates = candidates.filter(
    (c) => (c.client || '').trim().toLowerCase() === client.trim().toLowerCase()
  )

  return (
    <Modal
      title={`${client} candidates`}
      subtitle={`${clientCandidates.length} candidate${clientCandidates.length === 1 ? '' : 's'}`}
      onClose={onClose}
    >
      <CandidateList candidates={clientCandidates} onOpenCandidate={onOpenCandidate} />
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  )
}

/* ---------- All clients modal (clickable Clients KPI) ---------- */
function AllClientsModal({ sources, candidates, onClose, onOpenClient }) {
  const clientNames = sources
    .map((s) => s.label)
    .filter((label) => candidates.some((c) => (c.client || '').trim().toLowerCase() === label.trim().toLowerCase()))

  return (
    <Modal
      title="Clients"
      subtitle={`${clientNames.length} clients from sources of applications`}
      onClose={onClose}
    >
      {clientNames.length === 0 ? (
        <p className="empty-state">No client data found.</p>
      ) : (
        <div className="client-list">
          {clientNames.map((name) => (
            <div className="client-list-row" key={name}>
              <a
                className="candidate-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onOpenClient(name)
                }}
              >
                {name}
              </a>
              <span className="client-group-count">
                {candidates.filter((c) => (c.client || '').trim().toLowerCase() === name.trim().toLowerCase()).length}{' '}
                candidate{candidates.filter((c) => (c.client || '').trim().toLowerCase() === name.trim().toLowerCase()).length === 1 ? '' : 's'}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  )
}

/* ---------- Candidate table ---------- */
function CandidatesTable({ candidates, onOpenCandidate, onOpenClient, onEdit, onDelete }) {
  const columns = [
    ['name', 'Candidate'],
    ['date', 'Date'],
    ['client', 'Client'],
    ['status', 'Status'],
    ['skill', 'Skill'],
    ['total_experience', 'Total exp'],
    ['current_location', 'Current loc.'],
    ['preferred_location', 'Preferred loc.'],
    ['current_ctc', 'Current CTC'],
    ['expected_ctc', 'Expected CTC'],
    ['notice_period', 'Notice'],
    ['education', 'Education'],
    ['email', 'Email'],
    ['phone', 'Phone'],
  ]

  if (candidates.length === 0) {
    return <p className="empty-state">No candidates found for this filter.</p>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map(([key, label]) => (
              <th key={key}>{label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id}>
              {columns.map(([key]) => {
                if (key === 'name') {
                  return (
                    <td key={key}>
                      <a
                        className="candidate-link"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          onOpenCandidate(c)
                        }}
                      >
                        {c[key] || '—'}
                      </a>
                    </td>
                  )
                }
                if (key === 'status') {
                  return (
                    <td key={key}>
                      <StatusBadge status={c[key] || ''} />
                    </td>
                  )
                }
                if (key === 'client') {
                  return (
                    <td key={key}>
                      {c[key] ? (
                        <a
                          className="candidate-link"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            onOpenClient(c[key])
                          }}
                        >
                          {c[key]}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  )
                }
                return <td key={key}>{c[key] || '—'}</td>
              })}
              <td className="row-actions">
                <button
                  type="button"
                  className="row-action-btn"
                  onClick={() => onEdit(c)}
                  title="Edit candidate"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="row-action-btn danger"
                  onClick={() => onDelete(c)}
                  title="Delete candidate"
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- Template-style chart components (pure CSS/SVG) ---------- */

function HorizontalBars({ data, color = '#22c55e' }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="hbar-list">
      {data.map((d) => (
        <div className="hbar-row" key={d.stage}>
          <span className="hbar-label">{d.stage}</span>
          <div className="hbar-track">
            <div
              className="hbar-fill"
              style={{ width: `${Math.round((d.count / max) * 100)}%`, background: color }}
            />
          </div>
          <span className="hbar-value">{d.count}</span>
        </div>
      ))}
    </div>
  )
}

function Donut({ data, size = 130 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const colors = ['#1e3a8a', '#0ea5e9', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#facc15', '#64748b', '#0f766e']
  let acc = 0
  const segments = data.map((d, i) => {
    const start = acc
    acc += (d.value / total) * 100
    return { ...d, start, end: acc, color: colors[i % colors.length] }
  })
  const grad = segments
    .map((s) => `${s.color} ${s.start}% ${s.end}%`)
    .join(', ')

  return (
    <div className="donut-wrap">
      <div className="donut" style={{ width: size, height: size, background: `conic-gradient(${grad || '#e2e8f0'})` }}>
        <div className="donut-hole" />
      </div>
      <div className="donut-legend">
        {segments.map((s) => (
          <div className="legend-row" key={s.label}>
            <span className="legend-swatch" style={{ background: s.color }} />
            <span className="legend-label">{s.label}</span>
            <span className="legend-value">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MonthlyLine({ data }) {
  const months = data.map((d) => d.month)
  const counts = data.map((d) => d.count)
  const max = Math.max(...counts, 1)
  const W = 300
  const H = 110
  const pad = 4
  const step = months.length > 1 ? (W - pad * 2) / (months.length - 1) : W - pad * 2
  const points = counts
    .map((c, i) => {
      const x = pad + i * step
      const y = H - pad - (c / max) * (H - pad * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="line-svg" preserveAspectRatio="none">
        <polygon points={`${pad},${H - pad} ${points} ${W - pad},${H - pad}`} fill="rgba(59,130,246,0.15)" />
        <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="line-x-labels">
        {months.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  )
}

function VacancyDonut({ value }) {
  return (
    <div className="donut-wrap">
      <div className="donut vacancy-donut" style={{ width: 130, height: 130, background: `conic-gradient(#f97316 0% ${value}%, #e2e8f0 ${value}% 100%)` }}>
        <div className="donut-hole">
          <span className="vacancy-pct">{value}%</span>
        </div>
      </div>
    </div>
  )
}

function AnalyticsCard({ title, children }) {
  return (
    <div className="analytics-card">
      <h3 className="analytics-title">{title}</h3>
      {children}
    </div>
  )
}

/* ---------- Template-style analytics dashboard ---------- */
function DashboardAnalytics({ dashboard, selected }) {
  if (!dashboard) return null
  const v = dashboard.vacancy

  const metrics = [
    { label: 'Active vacancies', value: v.active_vacancies },
    { label: 'Hired', value: v.hired },
    { label: 'Rejected', value: v.rejected },
    { label: 'Total candidates', value: dashboard.total_candidates },
  ]

  return (
    <div className="analytics-layout">
      {/* Left column: pipeline + final decision */}
      <div className="analytics-col">
        <AnalyticsCard title="RECRUITMENT PIPELINE">
          <HorizontalBars data={dashboard.pipeline} />
        </AnalyticsCard>
        <AnalyticsCard title="FINAL DECISION">
          <Donut data={dashboard.decisions.map((d) => ({ label: d.label, value: d.count }))} />
        </AnalyticsCard>
      </div>

      {/* Center column: sources + monthly */}
      <div className="analytics-col">
        <AnalyticsCard title="SOURCES OF APPLICATIONS">
          <Donut data={dashboard.sources.map((s) => ({ label: s.label, value: s.value }))} />
        </AnalyticsCard>
        <AnalyticsCard title="NUMBER OF APPLICATIONS BY MONTH">
          <MonthlyLine data={dashboard.monthly} />
        </AnalyticsCard>
      </div>

      {/* Right column: vacancy stats + fill rate */}
      <div className="analytics-col">
        <AnalyticsCard title="VACANCIES STATISTICS">
          <div className="metric-grid">
            {metrics.map((m) => (
              <div className="metric-card" key={m.label}>
                <span className="metric-value">{m.value}</span>
                <span className="metric-label">{m.label}</span>
              </div>
            ))}
          </div>
        </AnalyticsCard>
        <AnalyticsCard title="VACANCY FILL RATE">
          <VacancyDonut value={v.fill_rate} />
          <p className="analytics-note">
            {selected ? `Filtered to ${selected}` : 'Across all recruiters'}
          </p>
        </AnalyticsCard>
      </div>
    </div>
  )
}

/* ---------- Dashboard section ---------- */
function Dashboard({ stats, selected, onSelect, onRefreshStats, onDeleteRecruiter, dataVersion, sources, showClients, onShowClients, month, year, onMonthChange, onYearChange }) {
  const [candidates, setCandidates] = useState([])
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [openCandidate, setOpenCandidate] = useState(null)
  const [openClient, setOpenClient] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingCandidates(true)
      try {
        const data = await api.getCandidates(selected || undefined, undefined, {
          month: month || undefined,
          year: year || undefined,
        })
        if (!cancelled) {
          // Sort by application date ascending (chronological, not lexical).
          const sorted = [...(data.candidates || [])].sort((a, b) => {
            const da = parseDateLabel(a.date)
            const db = parseDateLabel(b.date)
            if (da && db) return da - db
            return String(a.date || '').localeCompare(String(b.date || ''))
          })
          setCandidates(sorted)
        }
      } catch (err) {
        if (!cancelled) setCandidates([])
      } finally {
        if (!cancelled) setLoadingCandidates(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [selected, dataVersion, month, year])

  async function handleStatusChange(updated) {
    // Update the open row + table in place
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setOpenCandidate(updated)
    // Refresh recruiter status counts + KPIs
    onRefreshStats()
  }

  function handleSaved(updated) {
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setOpenCandidate(null)
    onRefreshStats()
  }

  function handleDeleted(candidate) {
    setCandidates((prev) => prev.filter((c) => c.id !== candidate.id))
    setDeleteTarget(null)
    onRefreshStats()
  }

  async function handleExport() {
    setExporting(true)
    setExportError(null)
    try {
      await api.exportCandidates(selected || undefined, undefined, {
        month: month || undefined,
        year: year || undefined,
      })
    } catch (err) {
      setExportError(err.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="dashboard">
      <div className="section-head">
        <h2>{selected ? `${selected}'s pipeline` : 'All recruiters'}</h2>
        <div className="section-actions">
          <div className="date-filter">
            <label htmlFor="month-filter">Month</label>
            <select
              id="month-filter"
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
            >
              <option value="">All months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {new Date(0, i).toLocaleString('en', { month: 'long' })}
                </option>
              ))}
            </select>
            <label htmlFor="year-filter">Year</label>
            <select id="year-filter" value={year} onChange={(e) => onYearChange(e.target.value)}>
              <option value="">All years</option>
              {(() => {
                const years = new Set()
                candidates.forEach((c) => {
                  const m = c.date && c.date.match(/(19|20)\d{2}/)
                  if (m) years.add(m[0])
                })
                return Array.from(years)
                  .sort((a, b) => b - a)
                  .map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))
              })()}
            </select>
          </div>
          {exportError && <span className="export-error">{exportError}</span>}
          <button className="btn-secondary export-btn" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting…' : '⬇ Export to Excel'}
          </button>
          <span className="section-count">
            {loadingCandidates ? '…' : `${candidates.length} candidates`}
          </span>
        </div>
      </div>
      <div className="recruiter-grid">
        {stats.map((s, i) => (
          <RecruiterCard
            key={s.recruiter}
            recruiter={s}
            index={i}
            selected={selected === s.recruiter}
            onSelect={onSelect}
            onDelete={onDeleteRecruiter}
          />
        ))}
      </div>

      <div className="table-panel">
        {loadingCandidates ? (
          <p className="empty-state">Loading candidates…</p>
        ) : (
          <CandidatesTable
            candidates={candidates}
            onOpenCandidate={setOpenCandidate}
            onOpenClient={setOpenClient}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      {editTarget && (
        <EditCandidateModal
          candidate={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteCandidateModal
          candidate={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}

      {openClient && (
        <ClientCandidatesModal
          client={openClient}
          candidates={candidates}
          onClose={() => setOpenClient(null)}
          onOpenCandidate={setOpenCandidate}
        />
      )}
      {openCandidate && (
        <CandidateDetailModal
          candidate={openCandidate}
          onClose={() => setOpenCandidate(null)}
          onStatusChange={handleStatusChange}
        />
      )}
      {showClients && sources && (
        <AllClientsModal
          sources={sources}
          candidates={candidates}
          onClose={onShowClients}
          onOpenClient={(name) => {
            setOpenClient(name)
            onShowClients()
          }}
        />
      )}
    </section>
  )
}

/* ---------- App ---------- */
function App() {
  const [stats, setStats] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [selected, setSelected] = useState(null)
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [dataVersion, setDataVersion] = useState(0)
  const [showClients, setShowClients] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const params = { month: month || undefined, year: year || undefined }
      const [statsData, dashData] = await Promise.all([
        api.getStats(params),
        api.getDashboard(selected || undefined, params),
      ])
      setStats(statsData.stats)
      setDashboard(dashData)
      setDataVersion((v) => v + 1)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [selected, month, year])

  useEffect(() => {
    refresh()
  }, [refresh])

  function handleDeleted(recruiter) {
    setDeleteTarget(null)
    if (selected === recruiter.recruiter) setSelected(null)
    refresh()
  }

  function handleSelect(name) {
    setSelected(name)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">RT</span>
          <div className="brand-text">
            <h1>Recruitment Tracker</h1>
            <span className="brand-sub">Daily pipeline overview</span>
          </div>
        </div>
        <nav className="main-nav">
          <button className="nav-tab active">Dashboard</button>
        </nav>
        <div className="topbar-actions">
          <button className="btn-secondary" onClick={refresh}>
            ↻ Refresh
          </button>
          <button className="btn-secondary" onClick={() => setShowLogs(true)}>
            🕘 Transaction Logs
          </button>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            + Add recruiter
          </button>
          <button className="btn-upload" onClick={() => setShowUpload(true)}>
            ↑ Upload Excel
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <strong>Cannot reach the backend.</strong> {error} Make sure MongoDB and the API are
          running.
        </div>
      )}

      {loading ? (
        <p className="empty-state">Loading dashboard…</p>
      ) : (
        <>
          <KpiStrip stats={stats} sources={dashboard?.sources} onOpenClients={() => setShowClients(true)} />
          <DashboardAnalytics dashboard={dashboard} selected={selected} />
          <Dashboard
            stats={stats}
            selected={selected}
            onSelect={handleSelect}
            onRefreshStats={refresh}
            onDeleteRecruiter={setDeleteTarget}
            dataVersion={dataVersion}
            sources={dashboard?.sources}
            showClients={showClients}
            onShowClients={() => setShowClients(false)}
            month={month}
            year={year}
            onMonthChange={setMonth}
            onYearChange={setYear}
          />
        </>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={refresh} />}
      {showAdd && <AddRecruiterModal onClose={() => setShowAdd(false)} onAdded={refresh} />}
      {showLogs && <TransactionLogsModal onClose={() => setShowLogs(false)} />}
      {deleteTarget && (
        <DeleteRecruiterModal
          recruiter={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}

export default App
