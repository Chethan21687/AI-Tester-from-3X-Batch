import { useEffect, useState } from 'react'
import { fetchAuditLog } from '../utils/store.js'

// Read-only deletion audit trail from MongoDB.
export default function AuditLog() {
  const [entries, setEntries] = useState(null)
  const [err, setErr] = useState('')

  const load = () => {
    setErr('')
    fetchAuditLog().then(setEntries).catch(e => setErr(e.message))
  }
  useEffect(load, [])

  return (
    <div className="card">
      <div className="form-head">
        <h3>Deletion Audit Log</h3>
        <button className="btn ghost" onClick={load} title="Refresh">🔄 Refresh</button>
      </div>
      {err && <p className="msg err">Could not load audit log: {err}</p>}
      {!entries && !err && <p className="muted">Loading…</p>}
      {entries && entries.length === 0 && <p className="empty">No deletions recorded yet.</p>}
      {entries && entries.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Deleted At</th><th>Cand ID</th><th>Candidate</th><th>Client</th><th>Status</th><th>Recruiter</th><th>Reason</th></tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i}>
                  <td className="nowrap">{new Date(e.deletedAt).toLocaleString()}</td>
                  <td className="nowrap">{e.candId || '—'}</td>
                  <td>{e.name || '—'}</td>
                  <td>{e.client || '—'}</td>
                  <td>{e.status || '—'}</td>
                  <td>{e.recruiter || '—'}</td>
                  <td>{e.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
