import { useState, useEffect, useRef } from 'react'
import { FIELD_GROUPS, ALL_FIELDS, emptyCandidate, coerceDates, splitName, composeName, composeInterview, splitInterview, findDuplicate } from '../config/fields.js'
import { parseResume, validateResumeFile, RESUME_ACCEPT } from '../utils/parseResume.js'

const REQUIRED = ALL_FIELDS.filter(f => f.required)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Friendly labels for the raw parsed keys, shown in the preview/validate modal.
const PARSED_LABELS = {
  name: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  location: 'Location (Current)',
  education: 'Education',
  totalExp: 'Total Experience (yrs)',
  relevantExp: 'Relevant Experience / Skills',
  noticePeriod: 'Notice Period'
}

// The current form value that corresponds to a parsed key (name spans two fields).
function formValueFor(form, key) {
  if (key === 'name') return [form.firstName, form.lastName].filter(Boolean).join(' ').trim()
  return String(form[key] ?? '').trim()
}
const norm = v => String(v ?? '').trim().replace(/\s+/g, ' ').toLowerCase()

// A stored value that isn't one of the configured options (a recruiter who
// joined after the roster was written, a status from an imported sheet) would
// render the <select> blank and be silently wiped on save. Keep it as an
// extra option so it stays visible and survives an edit.
function optionsFor(field, value) {
  const v = String(value ?? '')
  return v && !field.options.includes(v) ? [...field.options, v] : field.options
}

// Title-case a client name: each word's first letter uppercased, rest lower —
// so any casing the user types collapses to one canonical spelling.
const titleCaseClient = v =>
  String(v ?? '').trim().replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\p{L}/gu, ch => ch.toUpperCase())

// Add or edit a candidate. Controlled form driven by FIELD_GROUPS config.
export default function CandidateForm({ initial, existing = [], onSave, onCancel }) {
  const [form, setForm] = useState(emptyCandidate())
  const [resume, setResume] = useState(null)   // { busy?, type, text } upload status
  const [resumeData, setResumeData] = useState(null) // { fileName, text, parsed, isPdf, url }
  const [showPreview, setShowPreview] = useState(false)
  const [previewTab, setPreviewTab] = useState('compare') // 'compare' | 'doc'
  const [errors, setErrors] = useState({})      // { fieldKey: message }
  const [popup, setPopup] = useState(null)      // { title, lines[] } validation modal
  const resumeRef = useRef(null)
  const docxRef = useRef(null)         // container the DOCX is rendered into
  const [docxErr, setDocxErr] = useState(null)

  useEffect(() => {
    if (initial) {
      const rec = splitInterview(coerceDates({ ...emptyCandidate(), ...initial }))
      // Legacy records only have `name` — derive First/Last for the split fields.
      if (!rec.firstName && rec.name) Object.assign(rec, splitName(rec.name))
      setForm(rec)
    } else {
      setForm(emptyCandidate())
    }
    setErrors({}); setResume(null); setResumeData(null); setShowPreview(false); setPopup(null)
  }, [initial])

  // Release the object URL used for the PDF preview when it changes / unmounts.
  useEffect(() => () => { if (resumeData?.url) URL.revokeObjectURL(resumeData.url) }, [resumeData])

  // Render the DOCX as an actual Word document (formatted) when its tab opens.
  useEffect(() => {
    const el = docxRef.current
    if (!showPreview || previewTab !== 'doc' || !resumeData?.isDocx || !el) return
    let cancelled = false
    setDocxErr(null)
    el.innerHTML = '<p class="pv-loading">Rendering Word document…</p>'
    import('docx-preview')
      .then(({ renderAsync }) => {
        if (cancelled) return
        el.innerHTML = ''
        return renderAsync(resumeData.file, el, null, {
          className: 'docx',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          experimental: true
        })
      })
      .catch(err => {
        if (cancelled) return
        el.innerHTML = ''
        setDocxErr(err.message || 'Could not render this document.')
      })
    return () => { cancelled = true }
  }, [showPreview, previewTab, resumeData])

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
      const { fields: parsed, text } = await parseResume(file)
      // Keep the raw file + extracted text so the user can preview & validate.
      const lower = file.name.toLowerCase()
      const isPdf = lower.endsWith('.pdf')
      const isDocx = lower.endsWith('.docx')
      setResumeData({
        fileName: file.name,
        file,           // raw blob — used to render the DOCX as a Word document
        text,
        parsed,
        isPdf,
        isDocx,
        url: isPdf ? URL.createObjectURL(file) : ''
      })

      // Map the parsed full name onto the First/Last fields for the form.
      const applied = { ...parsed }
      if (applied.name) { Object.assign(applied, splitName(applied.name)); delete applied.name }
      const keys = Object.keys(parsed)
      if (!keys.length) {
        setResume({ type: 'warn', text: `⚠ "${file.name}" uploaded, but no details could be read from it. Enter fields manually.` })
      } else {
        setForm(f => ({ ...f, ...applied }))
        setErrors({})
        setResume({ type: 'ok', text: `✅ "${file.name}" uploaded — auto-filled ${keys.length} field(s): ${keys.join(', ')}. Preview to validate before saving.` })
      }
    } catch (err) {
      setResume({ type: 'err', text: `❌ Failed to parse "${file.name}": ${err.message}` })
    }
  }

  // Re-apply the originally parsed values onto the form (useful after edits).
  function applyParsed() {
    if (!resumeData?.parsed) return
    const applied = { ...resumeData.parsed }
    if (applied.name) { Object.assign(applied, splitName(applied.name)); delete applied.name }
    setForm(f => ({ ...f, ...applied }))
    setErrors({})
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

  const doSave = f => onSave(composeInterview(composeName({ ...f, id: f.id || 'c-' + Date.now() })))

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
    // Normalise the client name to Title Case regardless of how it was typed
    // ("acme" / "ACME" / "aCmE" -> "Acme") so the same client is never split
    // into separate groups in the dashboard and filters.
    const rec = composeName({ ...form, client: titleCaseClient(form.client) })

    // Duplicate guard: same email, phone or name+client as an existing record.
    // Blocked by default; the recruiter can override deliberately (e.g. the
    // same person genuinely submitted against a second requirement).
    const dup = findDuplicate(rec, existing)
    if (dup) {
      const who = dup.candidate.name || dup.candidate.email || 'an existing candidate'
      setPopup({
        title: 'Duplicate candidate',
        lines: [
          `This candidate matches ${who}${dup.candidate.candId ? ` (${dup.candidate.candId})` : ''} by ${dup.reason}.`,
          `Existing record — client: ${dup.candidate.client || '—'} · status: ${dup.candidate.status || '—'} · recruiter: ${dup.candidate.recruiter || '—'}.`,
          'Edit that record instead, or save anyway if this is a genuinely separate submission.'
        ],
        actions: [
          { label: 'Cancel', run: () => setPopup(null) },
          { label: 'Save Anyway', primary: true, run: () => { setPopup(null); doSave(rec) } }
        ]
      })
      return
    }
    doSave(rec)
  }

  const splitting = showPreview && resumeData

  return (
    <div className={`form-shell${splitting ? ' split' : ''}`}>
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
        {resumeData && (
          <button
            type="button"
            className="btn tiny preview-toggle"
            onClick={() => setShowPreview(s => !s)}
          >
            {showPreview ? '✖ Close Preview' : '🔍 Preview & Validate Parsed Details'}
          </button>
        )}
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
                    {optionsFor(f, form[f.key]).map(o => <option key={o} value={o}>{o}</option>)}
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
            {popup.actions
              ? <div className="modal-actions">
                  {popup.actions.map((a, i) => (
                    <button key={i} type="button" className={`btn ${a.primary ? 'primary' : 'ghost'}`} onClick={a.run}>{a.label}</button>
                  ))}
                </div>
              : <button type="button" className="btn primary" onClick={() => setPopup(null)}>Got it</button>}
          </div>
        </div>
      )}
    </form>

    {splitting && (
      <aside className="card resume-preview-pane">
        <div className="form-head">
          <h2>Resume Preview</h2>
          <button type="button" className="icon-btn ghost" onClick={() => setShowPreview(false)}
            title="Close preview" aria-label="Close preview">✖️</button>
        </div>
        <small className="pv-file">📄 {resumeData.fileName}</small>

        <div className="pv-tabs">
          <button type="button" className={previewTab === 'compare' ? 'pv-tab on' : 'pv-tab'}
            onClick={() => setPreviewTab('compare')}>Parsed vs Form</button>
          <button type="button" className={previewTab === 'doc' ? 'pv-tab on' : 'pv-tab'}
            onClick={() => setPreviewTab('doc')}>Resume Document</button>
        </div>

        {previewTab === 'compare' && (
          <div className="pv-compare">
            {Object.keys(resumeData.parsed).length === 0 ? (
              <p className="msg warn">No details were parsed from this resume.</p>
            ) : (
              <>
                <div className="pv-table-wrap">
                  <table className="parse-table">
                    <thead>
                      <tr><th>Field</th><th>Parsed from resume</th><th>In form now</th><th></th></tr>
                    </thead>
                    <tbody>
                      {Object.keys(resumeData.parsed).map(key => {
                        const p = resumeData.parsed[key]
                        const fv = formValueFor(form, key)
                        const match = norm(p) === norm(fv)
                        return (
                          <tr key={key} className={match ? 'ok' : 'diff'}>
                            <td>{PARSED_LABELS[key] || key}</td>
                            <td>{p}</td>
                            <td>{fv || <em className="muted">— empty —</em>}</td>
                            <td className="pv-flag">{match ? '✓' : '✎'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="pv-actions">
                  <button type="button" className="btn tiny" onClick={applyParsed}>↺ Re-apply Parsed Values</button>
                </div>
                <small className="hint">✓ form matches the parsed value · ✎ you changed it. Edit any field on the left — this table updates live.</small>
              </>
            )}
          </div>
        )}

        {previewTab === 'doc' && (
          <div className="pv-doc">
            {resumeData.isPdf && (
              <iframe title="Resume document" src={resumeData.url} className="pv-frame" />
            )}
            {resumeData.isDocx && (
              <div className="pv-docx-wrap">
                {docxErr
                  ? <pre className="pv-text">Couldn't render Word view ({docxErr}).{'\n\n'}{resumeData.text}</pre>
                  : <div ref={docxRef} className="pv-docx" />}
              </div>
            )}
            {!resumeData.isPdf && !resumeData.isDocx && (
              <pre className="pv-text">{resumeData.text || 'No text could be extracted from this file.'}</pre>
            )}
          </div>
        )}
      </aside>
    )}
    </div>
  )
}
