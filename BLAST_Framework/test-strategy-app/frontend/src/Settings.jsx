import { useEffect, useState } from 'react';
import {
  Hash, Mail, KeyRound, Link2, Brain, Cpu,
  CheckCircle2, AlertCircle, Lock, Loader2
} from 'lucide-react';
import { getSettings, saveSettings } from './api';

const FIELD_DEFS = [
  { key: 'jiraId', label: 'Jira ID', placeholder: 'e.g. SCRUM-8', type: 'text', icon: Hash, group: 'Jira' },
  { key: 'jiraEmail', label: 'Jira Email', placeholder: 'you@company.com', type: 'email', icon: Mail, group: 'Jira' },
  { key: 'jiraToken', label: 'Jira API Token', placeholder: 'paste new token to update', type: 'password', icon: KeyRound, group: 'Jira' },
  { key: 'jiraBaseUrl', label: 'Jira Base URL', placeholder: 'https://yourcompany.atlassian.net', type: 'text', icon: Link2, group: 'Jira' },
  { key: 'groqApiKey', label: 'Groq API Key', placeholder: 'paste new key to update', type: 'password', icon: Brain, group: 'Groq' },
  { key: 'groqModel', label: 'Groq Model', placeholder: 'llama-3.3-70b-versatile', type: 'text', icon: Cpu, group: 'Groq' }
];

const GROUPS = ['Jira', 'Groq'];

export default function Settings() {
  const [form, setForm] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then((data) => setForm(data))
      .catch((err) => setStatus({ type: 'error', text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      // Don't resend masked secret placeholders — only send if user typed a fresh value
      const payload = { ...form };
      if (form.jiraTokenSet && /•/.test(payload.jiraToken || '')) delete payload.jiraToken;
      if (form.groqApiKeySet && /•/.test(payload.groqApiKey || '')) delete payload.groqApiKey;

      const saved = await saveSettings(payload);
      setForm(saved);
      setStatus({ type: 'success', text: 'Settings saved.' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-block">
        <Loader2 className="spin" size={28} />
        <span>Loading settings…</span>
      </div>
    );
  }

  const readOnly = Boolean(form.readOnly);

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <h2>Connection Settings</h2>
        {readOnly && (
          <span className="badge badge-locked"><Lock size={14} /> Read-only (env-configured)</span>
        )}
      </div>
      <p className="hint">
        {readOnly
          ? form.note
          : 'Jira ID here is the default ticket used when generating a strategy. Tokens/keys are masked once saved — type a new value only if you want to replace it.'}
      </p>

      {GROUPS.map((group) => (
        <fieldset className="field-group" key={group}>
          <legend>{group} connection</legend>
          <div className="field-grid">
            {FIELD_DEFS.filter((f) => f.group === group).map(({ key, label, placeholder, type, icon: Icon }) => (
              <label key={key} className="field">
                <span><Icon size={15} /> {label}</span>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key] ?? ''}
                  onChange={handleChange(key)}
                  autoComplete="off"
                  disabled={readOnly}
                />
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {!readOnly && (
        <button type="submit" className="primary-btn" disabled={saving}>
          {saving ? <Loader2 className="spin" size={16} /> : <CheckCircle2 size={16} />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      )}

      {status && (
        <p className={`status ${status.type}`}>
          {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {status.text}
        </p>
      )}
    </form>
  );
}
