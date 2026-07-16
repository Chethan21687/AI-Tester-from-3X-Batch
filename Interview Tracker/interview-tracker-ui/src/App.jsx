import { useState, useMemo, useEffect, useRef } from 'react'
import { sampleCandidates } from './data/sampleCandidates.js'
import { CANDIDATE_STATUS, ALL_FIELDS, normalizeStatus, normalizeRecruiter, generateIds, toISODate } from './config/fields.js'
import { exportExcel, mailtoSummary, openTeamsShare } from './utils/share.js'
import { fetchCandidates, saveCandidates, logDeletion } from './utils/store.js'
import Dashboard from './components/Dashboard.jsx'
import CandidateForm from './components/CandidateForm.jsx'
import CandidateTable from './components/CandidateTable.jsx'
import FileUpload from './components/FileUpload.jsx'
import AuditLog from './components/AuditLog.jsx'

const STORE_KEY = 'interview-tracker-candidates'
const EMPTY_FILTER = { key: '', value: '', label: '', test: null }
const migrate = list => list.map(c => ({
  ...c,
  status: normalizeStatus(c.status),
  recruiter: normalizeRecruiter(c.recruiter)
}))

export default function App() {
  // Seed initial paint from the offline cache; the shared store loads next.
  const [candidates, setCandidates] = useState(() => {
    const saved = localStorage.getItem(STORE_KEY)
    return migrate(saved ? JSON.parse(saved) : sampleCandidates)
  })
  const [loaded, setLoaded] = useState(false)
  // dirtyRef: user has edited -> a late initial fetch must not clobber.
  // canWriteRef: the initial load succeeded -> safe to write to the DB. A
  // FAILED load keeps this false so we never overwrite the DB with stale data.
  const dirtyRef = useRef(false)
  const canWriteRef = useRef(false)
  const candidatesRef = useRef(candidates)
  candidatesRef.current = candidates
  const [tab, setTab] = useState('dashboard')
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  // Date-sourced calendar filter (ISO yyyy-mm-dd) — next to the search bar.
  const [dateSourced, setDateSourced] = useState('')
  // Drill-down filter: exact field match {key,value} OR predicate {test,label}.
  const [filter, setFilter] = useState(EMPTY_FILTER)
  // Toast confirming DB writes: { type: 'ok'|'err'|'info', text }.
  const [notice, setNotice] = useState(null)
  // Delete flow: candidate pending deletion + the recruiter's reason.
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteErr, setDeleteErr] = useState('')
  const labelFor = key => (ALL_FIELDS.find(f => f.key === key) || {}).label || key

  // Mark dirty on every user mutation so the shared list is treated as ours.
  const mutate = updater => { dirtyRef.current = true; setCandidates(updater) }

  // Load the shared dataset once so all users see the same list/counts.
  useEffect(() => {
    let alive = true
    fetchCandidates()
      .then(list => {
        if (!alive) return
        canWriteRef.current = true              // load OK -> writes are now safe
        if (dirtyRef.current) {
          // User edited while the fetch was in flight: keep their data and
          // push it, don't clobber with the just-fetched list.
          saveCandidates(candidatesRef.current).catch(() => {})
          return
        }
        if (list.length) {
          setCandidates(migrate(list))
        } else {
          const seed = migrate(sampleCandidates)  // empty DB -> seed once
          setCandidates(seed)
          saveCandidates(seed).catch(() => {})
        }
      })
      .catch(() => {}) // load failed: stay on cached list, DB writes stay disabled
      .finally(() => { if (alive) setLoaded(true) })
    return () => { alive = false }
  }, [])

  // Offline cache (paint + resilience) — always safe, never touches the DB.
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(candidates))
  }, [candidates])

  // Persist to the DB ONLY for genuine user edits, and only once the initial
  // load succeeded. Debounced so rapid edits collapse into one write.
  useEffect(() => {
    if (!dirtyRef.current || !canWriteRef.current) return
    const t = setTimeout(() => { saveCandidates(candidatesRef.current).catch(() => {}) }, 400)
    return () => clearTimeout(t)
  }, [candidates])

  // Flush pending edits on tab close / reload so nothing is lost mid-debounce.
  useEffect(() => {
    const flush = () => {
      if (!dirtyRef.current || !canWriteRef.current || !navigator.sendBeacon) return
      navigator.sendBeacon('/api/candidates',
        new Blob([JSON.stringify({ candidates: candidatesRef.current })], { type: 'application/json' }))
    }
    window.addEventListener('beforeunload', flush)
    return () => window.removeEventListener('beforeunload', flush)
  }, [])

  // Active = everything not soft-deleted. Every view, count, and export uses
  // this; the full `candidates` list (incl. deleted rows) is what gets persisted.
  const active = useMemo(() => candidates.filter(c => !c.deleted), [candidates])

  // Search scans EVERY field so any detail of any candidate (incl. newly
  // added ones, which live in the same list) is findable.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return active.filter(c => {
      const matchFilter = filter.test
        ? filter.test(c)
        : (!filter.key || (c[filter.key] || '') === filter.value)
      const matchDate = !dateSourced || toISODate(c.dateSourced) === dateSourced
      if (!matchDate) return false
      if (!q) return matchFilter
      const hay = ALL_FIELDS.map(f => c[f.key])
        .concat([c.candId, c.reqId, c.name])
        .join(' ')
        .toLowerCase()
      return matchFilter && hay.includes(q)
    })
  }, [active, search, filter, dateSourced])

  // Add/Edit a candidate. Awaits the DB write and confirms it so the user knows
  // the record was actually inserted into MongoDB (and is now searchable).
  const saveCandidate = async c => {
    const prev = candidatesRef.current
    // Auto-fill Cand ID / Req ID for new candidates before inserting.
    const rec = generateIds({ ...c, status: normalizeStatus(c.status) }, prev)
    const exists = prev.some(p => p.id === rec.id)
    const next = exists ? prev.map(p => (p.id === rec.id ? rec : p)) : [rec, ...prev]

    dirtyRef.current = true
    candidatesRef.current = next
    setCandidates(next)
    setShowForm(false); setEditing(null)
    const who = rec.name || rec.firstName || 'Candidate'
    const verb = exists ? 'updated in' : 'saved to'
    setNotice({ type: 'info', text: `${exists ? 'Updating' : 'Saving'} "${who}"…` })
    try {
      await saveCandidates(next)               // <-- explicit, awaited DB write
      setNotice({ type: 'ok', text: `✅ "${who}" ${verb} database (${rec.candId}). Changes are live for all users.` })
    } catch (e) {
      setNotice({ type: 'err', text: `❌ Could not save "${who}" to the database: ${e.message}. Change kept locally — retry when back online.` })
    }
  }
  // Inline status change — auto-applied immediately (persists + refreshes dashboard).
  const updateStatus = (id, status) =>
    mutate(prev => prev.map(c => (c.id === id ? { ...c, status } : c)))
  // Inline requirement-status change — same auto-persist behaviour.
  const updateReqStatus = (id, reqStatus) =>
    mutate(prev => prev.map(c => (c.id === id ? { ...c, reqStatus } : c)))

  // Open the delete-reason modal (recruiter must give a reason before deleting).
  const openDelete = c => { setDeleteTarget(c); setDeleteReason(''); setDeleteErr('') }
  // Soft delete: the record is kept in the dataset with a `deleted` flag and
  // hidden from every view, so it can always be recovered (Undo, or the audit
  // trail). It is never physically removed from the DB.
  const confirmDelete = async () => {
    const reason = deleteReason.trim()
    if (reason.length < 5) { setDeleteErr('Please enter a valid reason (at least 5 characters).'); return }
    const c = deleteTarget
    const stamp = { deleted: true, deletedAt: new Date().toISOString(), deletedReason: reason }
    const next = candidatesRef.current.map(p => (p.id === c.id ? { ...p, ...stamp } : p))
    dirtyRef.current = true
    candidatesRef.current = next
    setCandidates(next)
    setDeleteTarget(null)
    const who = c.name || c.firstName || 'Candidate'
    // Restore = clear the soft-delete flags and persist.
    const undo = () => {
      const back = candidatesRef.current.map(p => {
        if (p.id !== c.id) return p
        const { deleted, deletedAt, deletedReason, ...rest } = p
        return rest
      })
      dirtyRef.current = true
      candidatesRef.current = back
      setCandidates(back)
      saveCandidates(back).catch(() => {})
      setNotice({ type: 'ok', text: `↩️ Restored "${who}".` })
    }
    setNotice({ type: 'info', text: `Deleting "${who}"…` })
    try {
      // Record the deletion in the audit trail first, then persist the flag.
      await logDeletion({
        candId: c.candId, name: who, reason,
        recruiter: c.recruiter || c.owner || '', client: c.client || '', status: c.status || ''
      })
      await saveCandidates(next)
      setNotice({ type: 'ok', text: `🗑️ "${who}" deleted (recoverable) and logged. Reason: ${reason}`, action: { label: 'Undo', run: undo } })
    } catch (e) {
      setNotice({ type: 'err', text: `❌ Could not delete "${who}": ${e.message}.` })
    }
  }
  const importCandidates = rows => mutate(prev => [...migrate(rows), ...prev])
  // Non-destructive recovery: re-add any sample/test candidates missing from the
  // current dataset (e.g. ones removed before soft-delete existed). Existing
  // records are matched by Cand ID and never overwritten.
  const restoreSamples = () => {
    const have = new Set(candidatesRef.current.map(c => c.candId || c.id))
    const missing = migrate(sampleCandidates).filter(s => !have.has(s.candId || s.id))
    if (!missing.length) { setNotice({ type: 'ok', text: 'Sample candidates already present — nothing to restore.' }); return }
    const next = [...candidatesRef.current, ...missing]
    dirtyRef.current = true
    candidatesRef.current = next
    setCandidates(next)
    saveCandidates(next)
      .then(() => setNotice({ type: 'ok', text: `♻️ Restored ${missing.length} sample candidate(s).` }))
      .catch(e => setNotice({ type: 'err', text: `❌ Restore save failed: ${e.message}.` }))
  }
  const startAdd = () => { setEditing(null); setShowForm(true) }
  const startEdit = c => { setEditing(c); setShowForm(true) }
  // Switch tabs and always close any open Add/Edit form so navigation is never
  // blocked by the form overlaying the view.
  const goTab = t => { setTab(t); setShowForm(false); setEditing(null) }
  // Dashboard hyperlink -> jump to candidate list filtered by any field.
  const openFilter = (key, value) => { setFilter({ ...EMPTY_FILTER, key, value }); setSearch(''); goTab('candidates') }
  // Dashboard stat tile -> jump to candidate list filtered by a predicate.
  const openTile = ({ label, test }) => { setFilter({ ...EMPTY_FILTER, label, test }); setSearch(''); goTab('candidates') }
  const clearAll = () => { setSearch(''); setFilter(EMPTY_FILTER); setDateSourced('') }
  const filterActive = filter.key || filter.test

  // Auto-dismiss success/info toasts (keep errors until clicked).
  useEffect(() => {
    if (!notice || notice.type === 'err') return
    const t = setTimeout(() => setNotice(null), notice.action ? 10000 : 4000)
    return () => clearTimeout(t)
  }, [notice])

  return (
    <div className="app">
      {notice && (
        <div className={`toast ${notice.type}`} role="status" onClick={() => setNotice(null)}>
          <span>{notice.text}</span>
          {notice.action && (
            <button className="toast-action" onClick={e => { e.stopPropagation(); setNotice(null); notice.action.run() }}>
              {notice.action.label}
            </button>
          )}
        </div>
      )}
      <header className="topbar">
        <div>
          <h1>Interview Tracker</h1>
          <p className="sub">Candidates — Submission Log · pipeline dashboard &amp; sharing</p>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn primary" onClick={startAdd} title="Add" aria-label="Add">➕</button>
          <button className="icon-btn" onClick={() => exportExcel(active)} title="Export to Excel" aria-label="Export to Excel">📊</button>
          <button className="icon-btn" onClick={() => { window.location.href = mailtoSummary(active) }} title="Mail" aria-label="Mail">✉️</button>
          <button className="icon-btn" onClick={() => openTeamsShare(active)} title="Teams" aria-label="Teams">👥</button>
          <button className="icon-btn ghost" onClick={restoreSamples} title="Restore sample candidates" aria-label="Restore sample candidates">♻️</button>
        </div>
      </header>

      <nav className="tabs">
        <button className={tab === 'dashboard' ? 'tab on' : 'tab'} onClick={() => goTab('dashboard')}>Dashboard</button>
        <button className={tab === 'candidates' ? 'tab on' : 'tab'} onClick={() => goTab('candidates')}>Candidates ({active.length})</button>
        <button className={tab === 'import' ? 'tab on' : 'tab'} onClick={() => goTab('import')} title="Import">📥 Import</button>
        <button className={tab === 'audit' ? 'tab on' : 'tab'} onClick={() => goTab('audit')} title="Deletion audit log">🧾 Audit</button>
      </nav>

      {showForm ? (
        <CandidateForm initial={editing} onSave={saveCandidate}
          onCancel={() => { setShowForm(false); setEditing(null) }} />
      ) : (
        <>
      {tab === 'dashboard' && <Dashboard candidates={active} onSelect={openFilter} onTile={openTile} />}

      {tab === 'import' && <FileUpload onImport={importCandidates} />}

      {tab === 'audit' && <AuditLog />}

      {tab === 'candidates' && (
        <>
          <div className="card toolbar">
            <input className="search" placeholder="Search any detail — name, phone, email, client, req, CTC, notes…"
              value={search} onChange={e => setSearch(e.target.value)} />
            <label className="date-filter" title="Filter by Date Sourced">
              <span className="cal-ico" aria-hidden="true">📅</span>
              <input type="date" value={dateSourced} onChange={e => setDateSourced(e.target.value)} />
            </label>
            <select
              value={filter.key === 'status' ? filter.value : 'All'}
              onChange={e => setFilter(e.target.value === 'All' ? EMPTY_FILTER : { ...EMPTY_FILTER, key: 'status', value: e.target.value })}
            >
              <option value="All">All Statuses</option>
              {CANDIDATE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {filterActive && (
              <span className="chip">{filter.label || `${labelFor(filter.key)}: `}<b>{filter.label ? '' : filter.value}</b>
                <button className="chip-x" title="Clear filter" onClick={() => setFilter(EMPTY_FILTER)}>✕</button>
              </span>
            )}
            {(search || filterActive || dateSourced) && (
              <button className="btn ghost" onClick={clearAll}>Clear</button>
            )}
            <span className="count">{filtered.length} / {active.length}</span>
          </div>
          <CandidateTable candidates={filtered} onEdit={startEdit}
            onDelete={openDelete} onStatusChange={updateStatus} onReqStatusChange={updateReqStatus} />
        </>
      )}
        </>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" role="alertdialog" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h3>Delete candidate</h3>
            <p className="modal-text">
              Enter a reason to delete <b>{deleteTarget.name || deleteTarget.firstName || 'this candidate'}</b>
              {deleteTarget.candId ? ` (${deleteTarget.candId})` : ''}. Required for the recruiter audit trail.
            </p>
            <textarea
              className="reason-input"
              rows={3}
              autoFocus
              value={deleteReason}
              placeholder="e.g. Duplicate profile · Candidate withdrew · Position filled…"
              onChange={e => { setDeleteReason(e.target.value); if (deleteErr) setDeleteErr('') }}
            />
            {deleteErr && <p className="msg err">{deleteErr}</p>}
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="btn danger" onClick={confirmDelete}>Delete Candidate</button>
            </div>
          </div>
        </div>
      )}

      <footer className="foot">
        Shared candidate data syncs across all users. Drop the Submission Log Excel into the <code>data/</code> folder, then use Import.
      </footer>
    </div>
  )
}
