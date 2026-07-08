// Lightweight client-side auth for the demo app (no backend). Accounts and the
// active session live in localStorage. NOTE: this is a front-end-only demo —
// do not treat localStorage credential storage as real security.

// --- Google Sign-In -------------------------------------------------------
// Paste your Google OAuth 2.0 Client ID here (Google Cloud Console →
// APIs & Services → Credentials → OAuth client ID → Web application).
// Add your app origins (e.g. http://localhost:5174 and the Vercel URL) to the
// client's "Authorized JavaScript origins". Leave '' to hide Google Sign-In.
export const GOOGLE_CLIENT_ID = ''

const USERS_KEY = 'interview-tracker-users'
const SESSION_KEY = 'interview-tracker-session'

async function hash(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

const loadUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
const saveUsers = list => localStorage.setItem(USERS_KEY, JSON.stringify(list))

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') }
  catch { return null }
}
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
}
export function logout() { localStorage.removeItem(SESSION_KEY) }

export async function register({ name, email, password }) {
  email = email.trim().toLowerCase()
  const users = loadUsers()
  if (users.some(u => u.email === email)) {
    throw new Error('An account with this email already exists. Please log in.')
  }
  const user = { name: name.trim(), email, pass: await hash(password), provider: 'password' }
  users.push(user)
  saveUsers(users)
  return setSession({ name: user.name, email: user.email, provider: 'password' })
}

export async function login({ email, password }) {
  email = email.trim().toLowerCase()
  const user = loadUsers().find(u => u.email === email)
  if (!user || user.pass !== await hash(password)) {
    throw new Error('Invalid email or password.')
  }
  return setSession({ name: user.name, email: user.email, provider: 'password' })
}

// Called after Google returns a credential (JWT). We only decode the profile
// client-side to display it; upsert a matching local account.
export function loginWithGoogle(credentialJwt) {
  const payload = JSON.parse(atob(credentialJwt.split('.')[1]))
  const email = (payload.email || '').toLowerCase()
  const name = payload.name || email.split('@')[0]
  const users = loadUsers()
  if (!users.some(u => u.email === email)) {
    users.push({ name, email, pass: null, provider: 'google' })
    saveUsers(users)
  }
  return setSession({ name, email, provider: 'google', picture: payload.picture })
}
