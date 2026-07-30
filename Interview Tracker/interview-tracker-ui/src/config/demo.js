// Demo mode — a self-contained guest walkthrough of the tracker.
//
// In demo mode the app runs on the anonymized dataset (src/data/demoCandidates.js)
// and NOTHING touches the shared backend: no /api/candidates read or write, no
// /api/audit write, no beforeunload beacon. Edits live in sessionStorage for the
// life of the page only — every page load starts again from the pristine seed,
// so one visitor's additions are never inherited by the next.
//
// Enter: append ?demo=1 to the URL (or click "Try the demo"). Leave: ?demo=0,
// or the "Exit demo" button in the demo banner.

const FLAG_KEY = 'interview-tracker-demo'
export const DEMO_STORE_KEY = 'interview-tracker-demo-candidates'
export const DEMO_AUDIT_KEY = 'interview-tracker-demo-audit'

// Resolved once at module load so every caller sees the same answer for the
// life of the page (entering/leaving demo always reloads).
const demo = (() => {
  try {
    const param = new URLSearchParams(window.location.search).get('demo')
    let on
    if (param === '1' || param === 'true') { sessionStorage.setItem(FLAG_KEY, '1'); on = true }
    else if (param === '0' || param === 'false') { clearDemoData(); return false }
    else on = sessionStorage.getItem(FLAG_KEY) === '1'
    // Every page load is a fresh demo: drop whatever the previous load added,
    // imported or deleted before App reads the sandbox.
    if (on) clearSandbox()
    return on
  } catch {
    return false
  }
})()

export const isDemo = () => demo

// The sandbox: candidates + audit entries written during this page load.
function clearSandbox() {
  try {
    sessionStorage.removeItem(DEMO_STORE_KEY)
    sessionStorage.removeItem(DEMO_AUDIT_KEY)
  } catch { /* storage unavailable — nothing to clear */ }
}

export function clearDemoData() {
  clearSandbox()
  try { sessionStorage.removeItem(FLAG_KEY) } catch { /* storage unavailable */ }
}

// Drop everything added/edited in the sandbox and reload back onto the pristine
// anonymized seed. Demo mode itself stays on.
export function resetDemoData() {
  clearSandbox()
  window.location.reload()
}

export function enterDemo() {
  clearSandbox()
  const url = new URL(window.location.href)
  url.searchParams.set('demo', '1')
  window.location.href = url.toString()
}

export function exitDemo() {
  clearDemoData()
  const url = new URL(window.location.href)
  url.searchParams.delete('demo')
  window.location.href = url.toString()
}
