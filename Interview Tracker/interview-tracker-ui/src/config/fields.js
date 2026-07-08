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
export const RECRUITERS = ['Roshini S', 'Archana H R', 'Apporva M', 'Reshma D S']

// Maps short/legacy recruiter names to the current full names.
export const RECRUITER_REMAP = {
  'roshini': 'Roshini S',
  'archana': 'Archana H R',
  'apoorva': 'Apporva M',
  'apporva': 'Apporva M',
  'reshma': 'Reshma D S'
}
export function normalizeRecruiter(v) {
  if (!v) return v
  return RECRUITER_REMAP[String(v).trim().toLowerCase()] || v
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
      { key: 'interviewDate', label: 'Interview Scheduled Date', type: 'datetime-local' },
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

export function emptyCandidate() {
  const base = {
    reqStatus: 'Open',
    status: 'Internal Review',
    willingRelocate: 'Yes',
    source: 'Naukri',
    interviewMode: '',
    lastRoundOutcome: '',
    name: '',
    // Sensible date defaults on a fresh candidate.
    dateSourced: todayISO(),
    dateSubmitted: todayISO(),
    earliestJoining: todayISO(15)
  }
  ALL_FIELDS.forEach(f => { if (!(f.key in base)) base[f.key] = '' })
  return base
}
