import { useRef, useState } from 'react'
import { parseCandidateFile } from '../utils/parseFile.js'

// Bulk import candidates from Excel / CSV / PDF via picker or drag-and-drop.
export default function FileUpload({ onImport }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [dupes, setDupes] = useState([])   // rows rejected as duplicates
  const [updates, setUpdates] = useState([]) // existing records filled in
  // 'skip'   — reject rows that match an existing candidate (default)
  // 'update' — use them to fill blank fields on the record they match
  const [mode, setMode] = useState('skip')

  async function handleFiles(fileList) {
    const file = fileList?.[0]
    if (!file) return
    setBusy(true); setMsg(null); setDupes([]); setUpdates([])
    try {
      const candidates = await parseCandidateFile(file)
      if (!candidates.length) {
        setMsg({ type: 'warn', text: `No candidate rows found in "${file.name}". Check the column headers.` })
      } else {
        // onImport screens duplicates and reports what it kept.
        const res = onImport(candidates, mode) ||
          { added: candidates.length, updated: 0, total: candidates.length, duplicates: [], updates: [] }
        const dupes = res.duplicates || []
        setDupes(dupes)
        setUpdates(res.updates || [])
        const parts = []
        if (res.added) parts.push(`added ${res.added}`)
        if (res.updated) parts.push(`updated ${res.updated}`)
        if (dupes.length) parts.push(`skipped ${dupes.length} duplicate(s)`)
        if (!res.added && !res.updated) {
          setMsg({ type: 'warn', text: `Nothing changed from "${file.name}" — all ${res.total} row(s) already exist with no blanks to fill.` })
        } else {
          setMsg({ type: 'ok', text: `"${file.name}": ${parts.join(', ')} — of ${res.total} row(s).` })
        }
      }
    } catch (err) {
      setMsg({ type: 'err', text: `Failed to parse "${file.name}": ${err.message}` })
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="card upload">
      <h2>Import Submission Log</h2>

      <div className="import-mode">
        <span className="im-label">When a row matches an existing candidate:</span>
        <label className={mode === 'skip' ? 'im-opt on' : 'im-opt'}>
          <input type="radio" name="import-mode" value="skip"
            checked={mode === 'skip'} onChange={() => setMode('skip')} />
          <b>Skip it</b><small>Keep the existing record untouched.</small>
        </label>
        <label className={mode === 'update' ? 'im-opt on' : 'im-opt'}>
          <input type="radio" name="import-mode" value="update"
            checked={mode === 'update'} onChange={() => setMode('update')} />
          <b>Fill in blanks</b><small>Add missing details (phone, experience, CTC, recruiter…) to the existing record. Values already there are kept — except Date Sourced, which the file always sets.</small>
        </label>
        <label className={mode === 'replace' ? 'im-opt on' : 'im-opt'}>
          <input type="radio" name="import-mode" value="replace"
            checked={mode === 'replace'} onChange={() => setMode('replace')} />
          <b>Replace with file</b><small>The file wins on every column it fills — corrects wrong values. Blank cells in the file never erase what's stored.</small>
        </label>
      </div>

      <div
        className="dropzone"
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.pdf"
          hidden
          onChange={e => handleFiles(e.target.files)}
        />
        <p className="dz-icon">⬆</p>
        <p>{busy ? 'Parsing…' : 'Drop Excel / CSV / PDF here, or click to browse'}</p>
        <small>Supported: .xlsx, .xls, .csv, .pdf</small>
      </div>
      {msg && <p className={`msg ${msg.type}`}>{msg.text}</p>}
      {updates.length > 0 && (
        <div className="dupe-report ok">
          <h4>Updated existing records ({updates.length})</h4>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Cand ID</th><th>Candidate</th><th>Fields filled in</th></tr></thead>
              <tbody>
                {updates.map((u, i) => (
                  <tr key={i}>
                    <td className="nowrap">{u.candId || '—'}</td>
                    <td>{u.name}</td>
                    <td>{u.filled.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {dupes.length > 0 && (
        <div className="dupe-report">
          <h4>Skipped duplicates ({dupes.length})</h4>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Row</th><th>Matched by</th><th>Existing record</th></tr></thead>
              <tbody>
                {dupes.map((d, i) => (
                  <tr key={i}>
                    <td>{d.name}</td>
                    <td>{d.reason}</td>
                    <td className="nowrap">{d.existing?.candId || '—'} · {d.existing?.name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="hint">Matched on email, phone (last 10 digits), or name + client. Edit the existing record instead, or change the detail that clashes and re-import.</small>
        </div>
      )}
      <small className="hint">
        Reads the <b>Candidates — Submission Log</b>. Multi-sheet Excel is merged by Cand ID + Name.
        Recognized columns: Cand ID, Req ID, Client, Candidate Name (or First/Last Name), Phone (<i>Contact Number</i>),
        Email, Total Experience (<i>Total Years</i>), Relevant Experience (<i>Relevent Years</i>), Notice Period,
        Location, Education, Source, Recruiter (<i>Recriuter</i>), Date / Date Sourced / Date Submitted, Status,
        Current CTC (<i>CCTC</i>), Expected CTC (<i>ECTC</i>), Offered CTC, Rate Unit, Earliest Joining,
        # Interviews Done, Last Round Outcome, Owner, Reason, Notes.
      </small>
    </div>
  )
}
