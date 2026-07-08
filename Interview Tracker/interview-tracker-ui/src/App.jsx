import { useState, useMemo, useEffect, useRef } from 'react'
import { sampleCandidates } from './data/sampleCandidates.js'
import { CANDIDATE_STATUS, ALL_FIELDS, normalizeStatus, normalizeRecruiter, generateIds } from './config/fields.js'
import { exportExcel, mailtoSummary, openTeamsShare } from './utils/share.js'
import { fetchCandidates, saveCandidates } from './utils/store.js'
import Dashboard from './components/Dashboard.jsx'
import CandidateForm from './components/CandidateForm.jsx'
import CandidateTable from './components/CandidateTable.jsx'
import FileUpload from './components/FileUpload.jsx'

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
  // Drill-down filter: exact field match {key,value} OR predicate {test,label}.
  const [filter, setFilter] = useState(EMPTY_FILTER)
  // Toast confirming DB writes: { type: 'ok'|'err'|'info', text }.
  const [notice, setNotice] = useState(null)
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

  // Search scans EVERY field so any detail of any candidate (incl. newly
  // added ones, which live in the same list) is findable.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return candidates.filter(c => {
      const matchFilter = filter.test
        ? filter.test(c)
        : (!filter.key || (c[filter.key] || '') === filter.value)
      if (!q) return matchFilter
      const hay = ALL_FIELDS.map(f => c[f.key])
        .concat([c.candId, c.reqId, c.name])
        .join(' ')
        .toLowerCase()
      return matchFilter && hay.includes(q)
    })
  }, [candidates, search, filter])

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
    setNotice({ type: 'info', text: `Saving "${who}" to database…` })
    try {
      await saveCandidates(next)               // <-- explicit, awaited DB insert
      setNotice({ type: 'ok', text: `✅ "${who}" saved to database (${rec.candId}). It is now searchable across all users.` })
    } catch (e) {
      setNotice({ type: 'err', text: `❌ Could not save "${who}" to the database: ${e.message}. Change kept locally — retry when back online.` })
    }
  }
  // Inline status change — auto-applied immediately (persists + refreshes dashboard).
  const updateStatus = (id, status) =>
    mutate(prev => prev.map(c => (c.id === id ? { ...c, status } : c)))

  const deleteCandidate = id => {
    if (confirm('Delete this candidate?')) mutate(prev => prev.filter(c => c.id !== id))
  }
  const importCandidates = rows => mutate(prev => [...migrate(rows), ...prev])
  const startAdd = () => { setEditing(null); setShowForm(true) }
  const startEdit = c => { setEditing(c); setShowForm(true) }
  const resetSeed = () => {
    if (confirm('Reset to sample data? Clears your changes.')) mutate(() => migrate(sampleCandidates))
  }
  // Dashboard hyperlink -> jump to candidate list filtered by any field.
  const openFilter = (key, value) => { setFilter({ ...EMPTY_FILTER, key, value }); setSearch(''); setTab('candidates') }
  // Dashboard stat tile -> jump to candidate list filtered by a predicate.
  const openTile = ({ label, test }) => { setFilter({ ...EMPTY_FILTER, label, test }); setSearch(''); setTab('candidates') }
  const clearAll = () => { setSearch(''); setFilter(EMPTY_FILTER) }
  const filterActive = filter.key || filter.test

  // Auto-dismiss success/info toasts (keep errors until clicked).
  useEffect(() => {
    if (!notice || notice.type === 'err') return
    const t = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(t)
  }, [notice])

  return (
    <div className="app">
      {notice && (
        <div className={`toast ${notice.type}`} role="status" onClick={() => setNotice(null)}>
          {notice.text}
        </div>
      )}
      <header className="topbar">
        <div>
          <h1>Interview Tracker</h1>
          <p className="sub">Candidates — Submission Log · pipeline dashboard &amp; sharing</p>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn primary" onClick={startAdd} title="Add" aria-label="Add">➕</button>
          <button className="icon-btn" onClick={() => exportExcel(candidates)} title="Export to Excel" aria-label="Export to Excel">📊</button>
          <button className="icon-btn" onClick={() => { window.location.href = mailtoSummary(candidates) }} title="Mail" aria-label="Mail">✉️</button>
          <button className="icon-btn" onClick={() => openTeamsShare(candidates)} title="Teams" aria-label="Teams">👥</button>
          <button className="icon-btn ghost" onClick={resetSeed} title="Reset" aria-label="Reset">🔄</button>
        </div>
      </header>

      <nav className="tabs">
        <button className={tab === 'dashboard' ? 'tab on' : 'tab'} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={tab === 'candidates' ? 'tab on' : 'tab'} onClick={() => setTab('candidates')}>Candidates ({candidates.length})</button>
        <button className={tab === 'import' ? 'tab on icon-tab' : 'tab icon-tab'} onClick={() => setTab('import')} title="Import" aria-label="Import">📥</button>
      </nav>

      {showForm && (
        <CandidateForm initial={editing} onSave={saveCandidate}
          onCancel={() => { setShowForm(false); setEditing(null) }} />
      )}

      {tab === 'dashboard' && <Dashboard candidates={candidates} onSelect={openFilter} onTile={openTile} />}

      {tab === 'import' && <FileUpload onImport={importCandidates} />}

      {tab === 'candidates' && (
        <>
          <div className="card toolbar">
            <input className="search" placeholder="Search any detail — name, phone, email, client, req, CTC, notes…"
              value={search} onChange={e => setSearch(e.target.value)} />
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
            {(search || filterActive) && (
              <button className="btn ghost" onClick={clearAll}>Clear</button>
            )}
            <span className="count">{filtered.length} / {candidates.length}</span>
          </div>
          <CandidateTable candidates={filtered} onEdit={startEdit}
            onDelete={deleteCandidate} onStatusChange={updateStatus} />
        </>
      )}

      <footer className="foot">
        Shared candidate data syncs across all users. Drop the Submission Log Excel into the <code>data/</code> folder, then use Import.
      </footer>
    </div>
  )
}
