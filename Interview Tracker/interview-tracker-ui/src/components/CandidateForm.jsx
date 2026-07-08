import { useState, useEffect, useRef } from 'react'
import { FIELD_GROUPS, ALL_FIELDS, emptyCandidate, coerceDates } from '../config/fields.js'
import { parseResume, validateResumeFile, RESUME_ACCEPT } from '../utils/parseResume.js'

const REQUIRED = ALL_FIELDS.filter(f => f.required)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Add or edit a candidate. Controlled form driven by FIELD_GROUPS config.
export default function CandidateForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(emptyCandidate())
  const [resume, setResume] = useState(null)   // { busy?, type, text } upload status
  const [errors, setErrors] = useState({})      // { fieldKey: message }
  const [popup, setPopup] = useState(null)      // { title, lines[] } validation modal
  const resumeRef = useRef(null)

  useEffect(() => {
    setForm(initial ? coerceDates({ ...emptyCandidate(), ...initial }) : emptyCandidate())
    setErrors({}); setResume(null); setPopup(null)
  }, [initial])

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  // Validate + parse an uploaded resume, then auto-populate matched fields.
  async function handleResume(fileList) {
    const file = fileList?.[0]
    if (resumeRef.current) resumeRef.current.value = ''
    if (!file) return

    // 1) Format / size validation.
    const check = validateResumeFile(file)
    if (!check.ok) {
      setResume({ type: 'err', text: `❌ ${check.msg}` })
      return
    }

    // 2) Parse.
    setResume({ busy: true, text: `Uploading & parsing "${file.name}"…` })
    try {
      const found = await parseResume(file)
      const keys = Object.keys(found)
      if (!keys.length) {
        setResume({ type: 'warn', text: `⚠ "${file.name}" uploaded, but no details could be read from it. Enter fields manually.` })
      } else {
        setForm(f => ({ ...f, ...found }))
        setErrors({})
        setResume({ type: 'ok', text: `✅ "${file.name}" uploaded — auto-filled ${keys.length} field(s): ${keys.join(', ')}. Review before saving.` })
      }
    } catch (err) {
      setResume({ type: 'err', text: `❌ Failed to parse "${file.name}": ${err.message}` })
    }
  }

  function validate() {
    const errs = {}
    REQUIRED.forEach(f => {
      if (!String(form[f.key] ?? '').trim()) errs[f.key] = `${f.label} is required`
    })
    if (form.email?.trim() && !EMAIL_RE.test(form.email.trim())) {
      errs.email = 'Enter a valid email address'
    }
    return errs
  }

  const submit = e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      setPopup({
        title: 'Please fix the highlighted fields',
        lines: Object.values(errs)
      })
      return
    }
    onSave({ ...form, id: form.id || 'c-' + Date.now() })
  }

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <div className="form-head">
        <h2>{initial ? 'Edit Candidate' : 'Add Candidate'}</h2>
        {onCancel && <button type="button" className="icon-btn ghost" onClick={onCancel} title="Cancel" aria-label="Cancel">✖️</button>}
      </div>

      <div className="resume-import">
        <div
          className={`dropzone sm${resume?.busy ? ' busy' : ''}`}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleResume(e.dataTransfer.files) }}
          onClick={() => resumeRef.current?.click()}
        >
          <input
            ref={resumeRef}
            type="file"
            accept={RESUME_ACCEPT.join(',')}
            hidden
            onChange={e => handleResume(e.target.files)}
          />
          <p className="dz-icon">{resume?.busy ? '⏳' : '📄'}</p>
          <p className="dz-title">{resume?.busy ? 'Parsing…' : 'Upload Resume to auto-fill details'}</p>
          <small>Accepted: PDF · DOCX · TXT — parses name, email, phone, location, education, experience</small>
        </div>
        {resume && !resume.busy && <p className={`msg ${resume.type}`}>{resume.text}</p>}
      </div>

      {FIELD_GROUPS.map(group => (
        <fieldset key={group.title} className="field-group">
          <legend>{group.title}</legend>
          <div className="grid">
            {group.fields.map(f => (
              <label key={f.key} className={`field${errors[f.key] ? ' has-error' : ''}`}>
                <span>{f.label}{f.required && <em className="req">*</em>}</span>
                {f.type === 'select' ? (
                  <select value={form[f.key] ?? ''} onChange={e => set(f.key, e.target.value)}>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    value={form[f.key] ?? ''}
                    placeholder={f.placeholder || ''}
                    onChange={e => set(f.key, e.target.value)}
                  />
                )}
                {errors[f.key] && <em className="field-err">{errors[f.key]}</em>}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="form-actions">
        <button type="submit" className="btn primary">{initial ? 'Save Changes' : 'Add Candidate'}</button>
      </div>

      {popup && (
        <div className="modal-overlay" onClick={() => setPopup(null)}>
          <div className="modal" role="alertdialog" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h3>{popup.title}</h3>
            <ul>{popup.lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
            <button type="button" className="btn primary" onClick={() => setPopup(null)}>Got it</button>
          </div>
        </div>
      )}
    </form>
  )
}
