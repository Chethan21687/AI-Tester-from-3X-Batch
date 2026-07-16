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

// Title-case a client name so any casing collapses to one canonical spelling.
const titleCaseClient = v =>
  String(v ?? '').trim().replace(/\s+/g, ' ').toLowerCase().replace(/\b\p{L}/gu, ch => ch.toUpperCase())

// Group candidates by client, merging case variants ("CODEYOUNG" + "Codeyoung"
// -> one "Codeyoung" row) and displaying the Title-Case label.
function countByClient(list) {
  return list.reduce((m, c) => {
    const raw = (c.client || '').trim()
    const label = raw ? titleCaseClient(raw) : '—'
    m[label] = (m[label] || 0) + 1
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
  // Open requirement = reqStatus exactly "Open" (not On Hold / Closed).
  const isOpenReq = c => (c.reqStatus || '').trim().toLowerCase() === 'open'
  const openCandidates = candidates.filter(isOpenReq)

  // A "requirement" is identified by CLIENT (case-insensitive) so the same
  // client added across many candidates counts as ONE open requirement — not
  // one per candidate/auto-generated Req ID. Falls back to Req ID, then row id.
  const reqKey = c => (c.client || c.reqId || c.id || '').toString().trim().toLowerCase()

  // Tile value = number of DISTINCT open requirements (one per client).
  const openReqCount = new Set(openCandidates.map(reqKey).filter(Boolean)).size
  // Client-wise breakdown shows how many candidates sit on each open client.
  const openCandCount = openCandidates.length
  const openByClient = countByClient(openCandidates)

  // Each tile carries the predicate its count is derived from, so clicking it
  // opens the candidate list filtered to exactly those records.
  const tiles = [
    { label: 'Candidates', value: total, test: () => true },
    { label: 'Open Requirements', value: openReqCount, test: isOpenReq },
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

        {/* Open requirements only, grouped client-wise. Clicking a client opens
            the candidate list filtered to Open + that client. */}
        <div className="card bd">
          <h3>Open Requirements — by Client</h3>
          {Object.keys(openByClient).length === 0 ? (
            <p className="muted">No open requirements.</p>
          ) : (
            Object.entries(openByClient).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
              const clickable = onTile && k !== '—'
              return (
                <div className="bd-row" key={k}>
                  {clickable
                    ? <button className="link-pill pill neutral" title={`View ${v} candidate(s) on open requirement — ${k}`}
                        onClick={() => onTile({ label: `Open · ${k}`, test: c => isOpenReq(c) && titleCaseClient(c.client) === k })}>{k}</button>
                    : <span className="pill neutral">{k}</span>}
                  <div className="bar"><div className="bar-fill" style={{ width: `${(v / (openCandCount || 1)) * 100}%` }} /></div>
                  <span className="bd-count">{v}</span>
                </div>
              )
            })
          )}
        </div>

        <Breakdown title="By Client" fieldKey="client" data={countByClient(candidates)}
          onPick={onTile && ((_, k) => onTile({ label: `Client · ${k}`, test: c => titleCaseClient(c.client) === k }))} />
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
