import { useState, useMemo, useEffect } from 'react'
import { sampleCandidates } from './data/sampleCandidates.js'
import { CANDIDATE_STATUS, ALL_FIELDS, normalizeStatus, normalizeRecruiter } from './config/fields.js'
import { exportExcel, mailtoSummary, openTeamsShare } from './utils/share.js'
import Dashboard from './components/Dashboard.jsx'
import CandidateForm from './components/CandidateForm.jsx'
import CandidateTable from './components/CandidateTable.jsx'
import FileUpload from './components/FileUpload.jsx'

const STORE_KEY = 'interview-tracker-candidates'
const migrate = list => list.map(c => ({
  ...c,
  status: normalizeStatus(c.status),
  recruiter: normalizeRecruiter(c.recruiter)
}))

export default function App() {
  const [candidates, setCandidates] = useState(() => {
    const saved = localStorage.getItem(STORE_KEY)
    return migrate(saved ? JSON.parse(saved) : sampleCandidates)
  })
  const [tab, setTab] = useState('dashboard')
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  // Generic field drill-down filter from the dashboard: { key, value }.
  const [filter, setFilter] = useState({ key: '', value: '' })
  const labelFor = key => (ALL_FIELDS.find(f => f.key === key) || {}).label || key

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(candidates))
  }, [candidates])

  // Search scans EVERY field so any detail of any candidate (incl. newly
  // added ones, which live in the same list) is findable.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return candidates.filter(c => {
      const matchFilter = !filter.key || (c[filter.key] || '') === filter.value
      if (!q) return matchFilter
      const hay = ALL_FIELDS.map(f => c[f.key])
        .concat([c.candId, c.reqId])
        .join(' ')
        .toLowerCase()
      return matchFilter && hay.includes(q)
    })
  }, [candidates, search, filter])

  const saveCandidate = c => {
    const rec = { ...c, status: normalizeStatus(c.status) }
    setCandidates(prev => {
      const exists = prev.some(p => p.id === rec.id)
      return exists ? prev.map(p => (p.id === rec.id ? rec : p)) : [rec, ...prev]
    })
    setShowForm(false); setEditing(null)
  }
  // Inline status change — auto-applied immediately (persists + refreshes dashboard).
  const updateStatus = (id, status) =>
    setCandidates(prev => prev.map(c => (c.id === id ? { ...c, status } : c)))

  const deleteCandidate = id => {
    if (confirm('Delete this candidate?')) setCandidates(prev => prev.filter(c => c.id !== id))
  }
  const importCandidates = rows => setCandidates(prev => [...migrate(rows), ...prev])
  const startAdd = () => { setEditing(null); setShowForm(true) }
  const startEdit = c => { setEditing(c); setShowForm(true) }
  const resetSeed = () => {
    if (confirm('Reset to sample data? Clears your changes.')) setCandidates(migrate(sampleCandidates))
  }
  // Dashboard hyperlink -> jump to candidate list filtered by any field.
  const openFilter = (key, value) => { setFilter({ key, value }); setSearch(''); setTab('candidates') }
  const clearAll = () => { setSearch(''); setFilter({ key: '', value: '' }) }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Interview Tracker</h1>
          <p className="sub">Candidates — Submission Log · pipeline dashboard &amp; sharing</p>
        </div>
        <div className="topbar-actions">
          <button className="btn primary" onClick={startAdd}>+ Add</button>
          <button className="btn" onClick={() => exportExcel(candidates)}>⬇ Export Excel</button>
          <button className="btn" onClick={() => { window.location.href = mailtoSummary(candidates) }}>✉ Mail</button>
          <button className="btn" onClick={() => openTeamsShare(candidates)}>Teams</button>
          <button className="btn ghost" onClick={resetSeed}>Reset</button>
        </div>
      </header>

      <nav className="tabs">
        <button className={tab === 'dashboard' ? 'tab on' : 'tab'} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={tab === 'candidates' ? 'tab on' : 'tab'} onClick={() => setTab('candidates')}>Candidates ({candidates.length})</button>
        <button className={tab === 'import' ? 'tab on' : 'tab'} onClick={() => setTab('import')}>Import</button>
      </nav>

      {showForm && (
        <CandidateForm initial={editing} onSave={saveCandidate}
          onCancel={() => { setShowForm(false); setEditing(null) }} />
      )}

      {tab === 'dashboard' && <Dashboard candidates={candidates} onSelect={openFilter} />}

      {tab === 'import' && <FileUpload onImport={importCandidates} />}

      {tab === 'candidates' && (
        <>
          <div className="card toolbar">
            <input className="search" placeholder="Search any detail — name, phone, email, client, req, CTC, notes…"
              value={search} onChange={e => setSearch(e.target.value)} />
            <select
              value={filter.key === 'status' ? filter.value : 'All'}
              onChange={e => setFilter(e.target.value === 'All' ? { key: '', value: '' } : { key: 'status', value: e.target.value })}
            >
              <option value="All">All Statuses</option>
              {CANDIDATE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {filter.key && (
              <span className="chip">{labelFor(filter.key)}: <b>{filter.value}</b>
                <button className="chip-x" title="Clear filter" onClick={() => setFilter({ key: '', value: '' })}>✕</button>
              </span>
            )}
            {(search || filter.key) && (
              <button className="btn ghost" onClick={clearAll}>Clear</button>
            )}
            <span className="count">{filtered.length} / {candidates.length}</span>
          </div>
          <CandidateTable candidates={filtered} onEdit={startEdit}
            onDelete={deleteCandidate} onStatusChange={updateStatus} />
        </>
      )}

      <footer className="foot">
        Data stored locally in your browser. Drop the Submission Log Excel into the <code>data/</code> folder, then use Import.
      </footer>
    </div>
  )
}
