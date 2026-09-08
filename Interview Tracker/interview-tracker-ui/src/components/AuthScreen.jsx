import { useState, useRef, useEffect } from 'react'
import { login, register, loginWithGoogle, GOOGLE_CLIENT_ID } from '../config/auth.js'

// Lazy-load the Google Identity Services script once.
let gsiPromise = null
function loadGsi() {
  if (gsiPromise) return gsiPromise
  gsiPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve(window.google)
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true; s.defer = true
    s.onload = () => resolve(window.google)
    s.onerror = () => reject(new Error('Could not load Google Sign-In'))
    document.head.appendChild(s)
  })
  return gsiPromise
}

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('login')          // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const googleRef = useRef(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Render the real Google button when a Client ID is configured.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleRef.current) return
    let cancelled = false
    loadGsi().then(google => {
      if (cancelled) return
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }) => {
          try { onAuthed(loginWithGoogle(credential)) }
          catch (e) { setErr(e.message) }
        }
      })
      google.accounts.id.renderButton(googleRef.current, {
        theme: 'outline', size: 'large', width: 320, text: 'continue_with'
      })
    }).catch(e => setErr(e.message))
    return () => { cancelled = true }
  }, [onAuthed])

  async function submit(e) {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      if (mode === 'register') {
        if (!form.name.trim()) throw new Error('Name is required')
        if (form.password.length < 6) throw new Error('Password must be at least 6 characters')
      }
      const user = mode === 'login' ? await login(form) : await register(form)
      onAuthed(user)
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card card">
        <div className="auth-brand">
          <span className="auth-logo">🎯</span>
          <h1>Interview Tracker</h1>
          <p className="sub">Sign in to manage your candidate pipeline</p>
        </div>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'auth-tab on' : 'auth-tab'} onClick={() => { setMode('login'); setErr('') }}>Login</button>
          <button className={mode === 'register' ? 'auth-tab on' : 'auth-tab'} onClick={() => { setMode('register'); setErr('') }}>Register</button>
        </div>

        <form onSubmit={submit} className="auth-form" noValidate>
          {mode === 'register' && (
            <label className="field">
              <span>Full Name</span>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Doe" />
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@company.com" />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" />
          </label>

          {err && <p className="msg err">{err}</p>}

          <button type="submit" className="btn primary auth-submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        {GOOGLE_CLIENT_ID ? (
          <div className="google-btn" ref={googleRef} />
        ) : (
          <button className="btn google-fallback" type="button" disabled
            title="Add your Google OAuth Client ID in src/config/auth.js to enable">
            <span className="g-mark">G</span> Continue with Google
          </button>
        )}
        {!GOOGLE_CLIENT_ID && (
          <small className="auth-hint">
            Google Sign-In is off. Set <code>GOOGLE_CLIENT_ID</code> in <code>src/config/auth.js</code> to enable it.
          </small>
        )}
      </div>
    </div>
  )
}
