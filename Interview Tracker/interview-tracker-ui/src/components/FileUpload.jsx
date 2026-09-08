import { useRef, useState } from 'react'
import { parseCandidateFile } from '../utils/parseFile.js'

// Bulk import candidates from Excel / CSV / PDF via picker or drag-and-drop.
export default function FileUpload({ onImport }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  async function handleFiles(fileList) {
    const file = fileList?.[0]
    if (!file) return
    setBusy(true); setMsg(null)
    try {
      const candidates = await parseCandidateFile(file)
      if (!candidates.length) {
        setMsg({ type: 'warn', text: `No candidate rows found in "${file.name}". Check the column headers.` })
      } else {
        onImport(candidates)
        setMsg({ type: 'ok', text: `Imported ${candidates.length} candidate(s) from "${file.name}".` })
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
      <small className="hint">
        Reads the <b>Candidates — Submission Log</b>. Multi-sheet Excel is merged by Cand ID + Name.
        Recognized columns: Cand ID, Req ID, Client, Candidate Name, Phone, Email, Total/Relevant Experience,
        Notice Period, Location, Education, Source, Recruiter, Date Sourced/Submitted, Status, Current/Expected/Offered CTC,
        Rate Unit, Earliest Joining, # Interviews Done, Last Round Outcome, Owner, Reason, Notes.
      </small>
    </div>
  )
}
