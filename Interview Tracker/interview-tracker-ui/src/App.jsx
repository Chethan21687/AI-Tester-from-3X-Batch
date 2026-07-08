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
  // Set once the user edits anything, so a late initial fetch can't clobber it.
  const dirtyRef = useRef(false)
  const [tab, setTab] = useState('dashboard')
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  // Drill-down filter: exact field match {key,value} OR predicate {test,label}.
  const [filter, setFilter] = useState(EMPTY_FILTER)
  const labelFor = key => (ALL_FIELDS.find(f => f.key === key) || {}).label || key

  // Mark dirty on every user mutation so the shared list is treated as ours.
  const mutate = updater => { dirtyRef.current = true; setCandidates(updater) }

  // Load the shared dataset once so all users see the same list/counts.
  // Skip applying it if the user already edited (avoids clobbering local work).
  useEffect(() => {
    let alive = true
    fetchCandidates()
      .then(list => {
        if (!alive || dirtyRef.current) return
        if (list.length) {
          setCandidates(migrate(list))
        } else {
          setCandidates(migrate(sampleCandidates))
          saveCandidates(sampleCandidates).catch(() => {})
        }
      })
      .catch(() => {}) // offline: keep the cached list
      .finally(() => { if (alive) setLoaded(true) })
    return () => { alive = false }
  }, [])

  // Persist: cache locally immediately, push to the shared store (debounced)
  // after the initial load so we never overwrite it prematurely.
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(candidates))
    if (!loaded) return
    const t = setTimeout(() => { saveCandidates(candidates).catch(() => {}) }, 500)
    return () => clearTimeout(t)
  }, [candidates, loaded])

  // Flush pending edits on tab close / reload so nothing is lost mid-debounce.
  useEffect(() => {
    const flush = () => {
      if (!dirtyRef.current || !navigator.sendBeacon) return
      navigator.sendBeacon('/api/candidates',
        new Blob([JSON.stringify({ candidates })], { type: 'application/json' }))
    }
    window.addEventListener('beforeunload', flush)
    return () => window.removeEventListener('beforeunload', flush)
  }, [candidates])

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

  const saveCandidate = c => {
    mutate(prev => {
      // Auto-fill Cand ID / Req ID for new candidates before inserting.
      const rec = generateIds({ ...c, status: normalizeStatus(c.status) }, prev)
      const exists = prev.some(p => p.id === rec.id)
      return exists ? prev.map(p => (p.id === rec.id ? rec : p)) : [rec, ...prev]
    })
    setShowForm(false); setEditing(null)
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

  return (
    <div className="app">
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
