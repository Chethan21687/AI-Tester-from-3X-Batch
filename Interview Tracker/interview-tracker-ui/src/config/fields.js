// Central field + dropdown definitions for the Interview Tracker.
// Mirrors the "Candidates — Submission Log" columns from the PRD/Excel,
// plus interview-scheduling fields (date / mode / duration).

export const CANDIDATE_STATUS = [
  'Duplicate',
  'Submit to Client',
  'Screen Reject',
  'Screen Select',
  'Internal Review',
  'L1 Select',
  'L1 Reject',
  'L1 TBS',
  'L1 Scheduled',
  'L1 Yet to Schedule',
  'L2 Select',
  'L2 Reject',
  'L2 TBS',
  'L2 Scheduled',
  'L2 Yet to Schedule',
  'Final Reject',
  'Final Select',
  'On Hold',
  'Drop-Out',
  'Offer Accepted',
  'Offer Rejected',
  'Joined'
]

// Maps legacy/imported status labels to the current CANDIDATE_STATUS values.
export const STATUS_REMAP = {
  'sourced': 'Internal Review',
  'submitted to client': 'Submit to Client',
  'client reviewing': 'Submit to Client',
  'interview scheduled': 'L2 Scheduled',
  'in interview': 'L2 Scheduled',
  'selected': 'Final Select',
  'on-hold': 'On Hold',
  'dropped out': 'Drop-Out',
  'no-show': 'Drop-Out',
  'rejected - tech': 'Screen Reject',
  'rejected - rate': 'Screen Reject',
  'rejected - notice': 'Screen Reject'
}

export function normalizeStatus(v) {
  if (!v) return v
  const hit = STATUS_REMAP[String(v).trim().toLowerCase()]
  return hit || v
}

// Pill colour class for a status value.
export function statusClass(v) {
  const s = (v || '').toLowerCase()
  if (s.includes('select') || s === 'joined' || s === 'offer accepted' || s === 'closed') return 'pill ok'
  if (s.includes('reject') || s === 'drop-out' || s === 'duplicate') return 'pill bad'
  if (s === 'on hold' || s.includes('tbs') || s.includes('yet to schedule')) return 'pill idle'
  return 'pill warn'
}

export const REQ_STATUS = ['Open', 'On Hold', 'Closed']
export const INTERVIEW_MODE = ['', 'Online', 'Teams', 'Telephonic', 'Face to Face']
export const LAST_ROUND_OUTCOME = ['', 'Pending', 'Selected', 'Rejected', 'Req Hold']
export const RELOCATE = ['Yes', 'No']
export const SOURCE = ['Naukri', 'LinkedIn', 'Internal Bench', 'Referral', 'Other']
export const RECRUITERS = ['Roshini S', 'Archana H R', 'Apoorva M', 'Reshma D S']

// Maps short/legacy recruiter names to the current full names.
export const RECRUITER_REMAP = {
  'roshini': 'Roshini S',
  'archana': 'Archana H R',
  'apoorva': 'Apoorva M',
  'apporva': 'Apoorva M',
  'apporva m': 'Apoorva M',
  'reshma': 'Reshma D S'
}
// Resolve whatever a sheet holds ("archana", "ARCHANA H R", "Archana H R") to
// the one canonical spelling, so the dashboard never splits one recruiter into
// several groups. A first-name-only value resolves when exactly one recruiter
// on the roster has that first name; anything else (a full name not on the
// roster, e.g. a new joiner) is kept verbatim rather than guessed at.
export function normalizeRecruiter(v) {
  if (!v) return v
  const raw = String(v).trim().replace(/\s+/g, ' ')
  if (!raw) return raw
  const lower = raw.toLowerCase()
  const exact = RECRUITERS.find(r => r.toLowerCase() === lower)
  if (exact) return exact
  const mapped = RECRUITER_REMAP[lower]
  if (mapped) return mapped
  if (!lower.includes(' ')) {
    const hits = RECRUITERS.filter(r => r.toLowerCase().split(' ')[0] === lower)
    if (hits.length === 1) return hits[0]
  }
  return raw
}

// Column groups drive the Add/Edit form. `type` selects the widget.
export const FIELD_GROUPS = [
  {
    // Cand ID / Req ID are auto-generated on save (see generateIds) — not shown.
    title: 'Identifiers',
    fields: [
      { key: 'client', label: 'Client', type: 'text' },
      { key: 'reqStatus', label: 'Requirement Status', type: 'select', options: REQ_STATUS }
    ]
  },
  {
    title: 'Candidate & Contact',
    fields: [
      { key: 'firstName', label: 'First Name', type: 'text', required: true },
      { key: 'lastName', label: 'Last Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone', type: 'tel' },
      { key: 'location', label: 'Location (Current)', type: 'text' },
      { key: 'preferredLocation', label: 'Preferred Location', type: 'text' },
      { key: 'willingRelocate', label: 'Willing to Relocate', type: 'select', options: RELOCATE },
      { key: 'education', label: 'Education', type: 'text' }
    ]
  },
  {
    title: 'Experience & Skills',
    fields: [
      { key: 'totalExp', label: 'Total Experience (yrs)', type: 'text' },
      { key: 'relevantExp', label: 'Relevant Experience', type: 'text' },
      { key: 'noticePeriod', label: 'Notice Period', type: 'text' }
    ]
  },
  {
    title: 'Sourcing',
    fields: [
      { key: 'source', label: 'Source', type: 'select', options: SOURCE },
      { key: 'recruiter', label: 'Source Detail / Recruiter', type: 'select', options: ['', ...RECRUITERS] },
      { key: 'dateSourced', label: 'Date Sourced', type: 'date' },
      { key: 'dateSubmitted', label: 'Date Submitted', type: 'date' }
    ]
  },
  {
    title: 'Compensation',
    fields: [
      { key: 'currentCTC', label: 'Current CTC', type: 'text' },
      { key: 'expectedCTC', label: 'Expected CTC', type: 'text' },
      { key: 'offeredCTC', label: 'Offered CTC', type: 'text' },
      { key: 'rateUnit', label: 'Rate Unit', type: 'text' },
      { key: 'earliestJoining', label: 'Earliest Joining Date', type: 'date' }
    ]
  },
  {
    title: 'Interview & Status',
    fields: [
      { key: 'status', label: 'Candidate Status', type: 'select', options: CANDIDATE_STATUS },
      // Interview schedule split into date + time so any time (incl. next-day)
      // is freely selectable; composed back into `interviewDate` on save.
      { key: 'interviewDateOnly', label: 'Interview Date', type: 'date' },
      { key: 'interviewTime', label: 'Interview Time', type: 'time' },
      { key: 'interviewMode', label: 'Interview Mode', type: 'select', options: INTERVIEW_MODE },
      { key: 'interviewDuration', label: 'Duration (min)', type: 'number' },
      { key: 'interviewsDone', label: '# Interviews Done', type: 'text' },
      { key: 'lastRoundOutcome', label: 'Last Round Outcome', type: 'select', options: LAST_ROUND_OUTCOME }
    ]
  },
  {
    title: 'Ownership & Notes',
    fields: [
      { key: 'owner', label: 'Owner (Recruiter)', type: 'text' },
      { key: 'rejectReason', label: 'Reason if Rejected/Dropped', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'text' }
    ]
  }
]

export const ALL_FIELDS = FIELD_GROUPS.flatMap(g => g.fields)

// Native <input type="date"|"datetime-local"> only accept ISO values. Legacy
// data holds free-text like "21st May 2026" / "2nd June", so coerce to ISO for
// display in the calendar picker. Returns '' when it can't be parsed.
export function toISODate(v, withTime = false) {
  if (!v) return ''
  const s = String(v).trim()
  // Already ISO (yyyy-mm-dd or yyyy-mm-ddThh:mm) — keep as-is.
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return withTime ? s.slice(0, 16) : s.slice(0, 10)
  const cleaned = s.replace(/(\d+)(st|nd|rd|th)/gi, '$1')
  const d = new Date(cleaned.match(/\d{4}/) ? cleaned : cleaned + ' ' + new Date().getFullYear())
  if (isNaN(d)) return ''
  const pad = n => String(n).padStart(2, '0')
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return withTime ? `${date}T${pad(d.getHours())}:${pad(d.getMinutes())}` : date
}

const DATE_FIELD_TYPES = { date: false, 'datetime-local': true }
// Coerce every date-typed field on a candidate record to ISO for the form.
export function coerceDates(rec) {
  const out = { ...rec }
  ALL_FIELDS.forEach(f => {
    if (f.type in DATE_FIELD_TYPES && out[f.key]) {
      out[f.key] = toISODate(out[f.key], DATE_FIELD_TYPES[f.type])
    }
  })
  return out
}

// Auto-generate Cand ID / Req ID (e.g. CAND-0007) using the max existing
// number in the list so IDs stay unique even after deletes. Only fills blanks.
function nextNum(list, key, prefix) {
  const max = list.reduce((m, c) => {
    const n = parseInt(String(c[key] || '').replace(new RegExp('^' + prefix + '-?', 'i'), ''), 10)
    return Number.isFinite(n) && n > m ? n : m
  }, 0)
  return `${prefix}-${String(max + 1).padStart(4, '0')}`
}
export function generateIds(rec, list) {
  const out = { ...rec }
  if (!out.candId) out.candId = nextNum(list, 'candId', 'CAND')
  if (!out.reqId) out.reqId = nextNum(list, 'reqId', 'REQ')
  return out
}

// --- name & date helpers ---------------------------------------------------
const pad = n => String(n).padStart(2, '0')
export function todayISO(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
// First token -> firstName, remainder -> lastName.
export function splitName(full) {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean)
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') }
}
// Keep the legacy single `name` field in sync from firstName + lastName.
export function composeName(rec) {
  const name = [rec.firstName, rec.lastName].filter(Boolean).join(' ').trim()
  return { ...rec, name: name || rec.name || '' }
}

// Two-way name sync. Records arrive with either shape: the seed and most
// imported sheets carry a single "Candidate Name" (-> `name`), while the form
// and our own Excel export carry First/Last Name. Whichever side is missing is
// derived, so the grid, search and export all have something to show.
export function syncNames(rec) {
  const out = { ...rec }
  if (!out.firstName && !out.lastName && out.name) Object.assign(out, splitName(out.name))
  if (!out.name && (out.firstName || out.lastName)) {
    out.name = [out.firstName, out.lastName].filter(Boolean).join(' ').trim()
  }
  return out
}

// Interview date/time <-> the canonical `interviewDate` datetime string.
export function composeInterview(rec) {
  const out = { ...rec }
  if (out.interviewDateOnly) {
    out.interviewDate = `${out.interviewDateOnly}T${out.interviewTime || '09:00'}`
  } else {
    out.interviewDate = ''
  }
  return out
}
export function splitInterview(rec) {
  const out = { ...rec }
  const v = String(out.interviewDate || '')
  if (v.includes('T')) {
    const [d, t] = v.split('T')
    out.interviewDateOnly = d
    out.interviewTime = (t || '').slice(0, 5)
  }
  return out
}

// --- duplicate detection ---------------------------------------------------
// A candidate is a duplicate of another when they share an email, a phone
// number (last 10 digits, so +91/0 prefixes and separators don't matter), or
// the same name for the same client. Soft-deleted records never match.
const key = v => String(v ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
const digits = v => String(v ?? '').replace(/\D/g, '').slice(-10)

export function duplicateReason(a, b) {
  if (a.email && key(a.email) === key(b.email)) return `email ${b.email}`
  const pa = digits(a.phone), pb = digits(b.phone)
  if (pa.length === 10 && pa === pb) return `phone ${b.phone}`
  if (a.name && key(a.name) === key(b.name) && a.client && key(a.client) === key(b.client)) {
    return `name + client (${b.name} · ${b.client})`
  }
  return ''
}

// First existing record that `rec` duplicates -> { candidate, reason }, else null.
export function findDuplicate(rec, list) {
  for (const c of list) {
    if (c.deleted || c.id === rec.id) continue
    const reason = duplicateReason(rec, c)
    if (reason) return { candidate: c, reason }
  }
  return null
}

// Merge an incoming (re-imported) row into an existing record: fills fields the
// existing record is missing and never overwrites a value already there, so a
// recruiter's later edits always win. Returns { rec, filled } — `filled` lists
// the field labels that gained a value, so the import can report what changed.
export function fillBlanks(existing, incoming, overwrite = []) {
  const rec = { ...existing }
  const filled = []
  ALL_FIELDS.concat([{ key: 'name', label: 'Candidate Name' }]).forEach(f => {
    const have = String(rec[f.key] ?? '').trim()
    const add = String(incoming[f.key] ?? '').trim()
    // `overwrite` fields come from the sheet even when a value is already
    // stored — used for Date Sourced, where an earlier import wrote the day it
    // ran instead of the date in the file.
    if (add && (!have || (overwrite.includes(f.key) && add !== have))) {
      rec[f.key] = add
      filled.push(f.label)
    }
  })
  if (incoming.extras) {
    const extras = { ...(rec.extras || {}) }
    Object.entries(incoming.extras).forEach(([h, v]) => {
      if (!String(extras[h] ?? '').trim() && String(v ?? '').trim()) { extras[h] = v; filled.push(h) }
    })
    rec.extras = extras
  }
  return { rec: syncNames(rec), filled }
}

export function emptyCandidate() {
  const base = {
    reqStatus: 'Open',
    status: 'Internal Review',
    willingRelocate: 'Yes',
    source: 'Naukri',
    interviewMode: '',
    lastRoundOutcome: '',
    name: '',
    interviewDate: '',
    // Sensible date defaults on a fresh candidate.
    dateSourced: todayISO(),
    dateSubmitted: todayISO(),
    earliestJoining: todayISO(15)
  }
  ALL_FIELDS.forEach(f => { if (!(f.key in base)) base[f.key] = '' })
  return base
}
