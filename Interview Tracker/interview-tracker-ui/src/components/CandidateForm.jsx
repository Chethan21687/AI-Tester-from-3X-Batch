import { useState, useEffect } from 'react'
import { FIELD_GROUPS, emptyCandidate } from '../config/fields.js'

// Add or edit a candidate. Controlled form driven by FIELD_GROUPS config.
export default function CandidateForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(emptyCandidate())

  useEffect(() => {
    setForm(initial ? { ...emptyCandidate(), ...initial } : emptyCandidate())
  }, [initial])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const submit = e => {
    e.preventDefault()
    if (!form.name?.trim()) return alert('Candidate Name is required')
    if (!form.email?.trim()) return alert('Email is required')
    onSave({ ...form, id: form.id || 'c-' + Date.now() })
  }

  return (
    <form className="card form" onSubmit={submit}>
      <div className="form-head">
        <h2>{initial ? 'Edit Candidate' : 'Add Candidate'}</h2>
        {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>}
      </div>

      {FIELD_GROUPS.map(group => (
        <fieldset key={group.title} className="field-group">
          <legend>{group.title}</legend>
          <div className="grid">
            {group.fields.map(f => (
              <label key={f.key} className="field">
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
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="form-actions">
        <button type="submit" className="btn primary">{initial ? 'Save Changes' : 'Add Candidate'}</button>
      </div>
    </form>
  )
}
