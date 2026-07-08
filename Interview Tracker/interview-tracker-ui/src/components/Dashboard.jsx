// Dashboard: pipeline analytics — status of requirements, candidates,
// interviews (schedule / mode / duration), and per-status breakdowns.
import { statusClass } from '../config/fields.js'

function countBy(list, key) {
  return list.reduce((m, c) => {
    const k = (c[key] || '').trim() || '—'
    m[k] = (m[k] || 0) + 1
    return m
  }, {})
}

// `onPick(fieldKey, value)` makes each row a hyperlink to the filtered list.
// `colored` uses the status colour palette; other breakdowns render neutral.
function Breakdown({ title, data, fieldKey, onPick, colored }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1
  const rows = Object.entries(data).sort((a, b) => b[1] - a[1])
  const cls = k => (colored ? statusClass(k) : 'pill neutral')
  return (
    <div className="card bd">
      <h3>{title}</h3>
      {rows.map(([k, v]) => {
        const clickable = onPick && k !== '—'
        return (
          <div className="bd-row" key={k}>
            {clickable
              ? <button className={`link-pill ${cls(k)}`} title={`View ${v} candidate(s) — ${k}`}
                  onClick={() => onPick(fieldKey, k)}>{k}</button>
              : <span className={cls(k)}>{k}</span>}
            <div className="bar"><div className="bar-fill" style={{ width: `${(v / total) * 100}%` }} /></div>
            <span className="bd-count">{v}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard({ candidates, onSelect, onTile }) {
  const total = candidates.length
  const isInterview = c => /scheduled|tbs|yet to schedule/i.test(c.status || '')
  const isRejected = c => /reject|drop-out|duplicate/i.test(c.status || '')
  const submitted = candidates.filter(c => c.status === 'Submit to Client').length
  const inInterview = candidates.filter(isInterview).length
  const joined = candidates.filter(c => c.status === 'Joined').length
  const rejected = candidates.filter(isRejected).length
  const openReqs = new Set(candidates.filter(c => c.reqStatus !== 'Closed').map(c => c.reqId)).size

  // Each tile carries the predicate its count is derived from, so clicking it
  // opens the candidate list filtered to exactly those records.
  const tiles = [
    { label: 'Candidates', value: total, test: () => true },
    { label: 'Open Requirements', value: openReqs, test: c => c.reqStatus !== 'Closed' },
    { label: 'Submitted', value: submitted, test: c => c.status === 'Submit to Client' },
    { label: 'In Interview', value: inInterview, test: isInterview },
    { label: 'Joined', value: joined, test: c => c.status === 'Joined' },
    { label: 'Rejected / Dropped', value: rejected, test: isRejected }
  ]

  const upcoming = candidates
    .filter(c => c.interviewDate)
    .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))

  return (
    <div className="dashboard">
      <div className="stats">
        {tiles.map(t => (
          <button
            className="stat stat-link"
            key={t.label}
            onClick={() => onTile && onTile({ label: t.label, test: t.test })}
            title={`View ${t.value} — ${t.label}`}
          >
            <div className="stat-value">{t.value}</div>
            <div className="stat-label">{t.label}</div>
          </button>
        ))}
      </div>

      <div className="bd-grid">
        <Breakdown title="Candidate Status" fieldKey="status" colored data={countBy(candidates, 'status')} onPick={onSelect} />
        <Breakdown title="Requirement Status" fieldKey="reqStatus" colored data={countBy(candidates, 'reqStatus')} onPick={onSelect} />
        <Breakdown title="By Client" fieldKey="client" data={countBy(candidates, 'client')} onPick={onSelect} />
        <Breakdown title="By Recruiter" fieldKey="recruiter" data={countBy(candidates, 'recruiter')} onPick={onSelect} />
      </div>

      <div className="card">
        <h3>Interview Schedule</h3>
        {upcoming.length === 0 ? (
          <p className="muted">No interviews scheduled.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>When</th><th>Candidate</th><th>Client</th><th>Req</th><th>Mode</th><th>Duration</th><th>Status</th></tr>
              </thead>
              <tbody>
                {upcoming.map(c => (
                  <tr key={c.id}>
                    <td className="nowrap">{new Date(c.interviewDate).toLocaleString()}</td>
                    <td>{c.name}</td>
                    <td>{c.client}</td>
                    <td>{c.reqId}</td>
                    <td>{c.interviewMode || '—'}</td>
                    <td>{c.interviewDuration ? `${c.interviewDuration} min` : '—'}</td>
                    <td>
                      {onSelect
                        ? <button className={`link-pill ${statusClass(c.status)}`} onClick={() => onSelect('status', c.status)}>{c.status}</button>
                        : <span className={statusClass(c.status)}>{c.status}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
