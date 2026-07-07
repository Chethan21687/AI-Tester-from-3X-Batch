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
    title: 'Identifiers',
    fields: [
      { key: 'candId', label: 'Cand ID', type: 'text' },
      { key: 'reqId', label: 'Req ID', type: 'text' },
      { key: 'client', label: 'Client', type: 'text' },
      { key: 'reqStatus', label: 'Requirement Status', type: 'select', options: REQ_STATUS }
    ]
  },
  {
    title: 'Candidate & Contact',
    fields: [
      { key: 'name', label: 'Candidate Name', type: 'text', required: true },
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
      { key: 'dateSourced', label: 'Date Sourced', type: 'text' },
      { key: 'dateSubmitted', label: 'Date Submitted', type: 'text' }
    ]
  },
  {
    title: 'Compensation',
    fields: [
      { key: 'currentCTC', label: 'Current CTC', type: 'text' },
      { key: 'expectedCTC', label: 'Expected CTC', type: 'text' },
      { key: 'offeredCTC', label: 'Offered CTC', type: 'text' },
      { key: 'rateUnit', label: 'Rate Unit', type: 'text' },
      { key: 'earliestJoining', label: 'Earliest Joining Date', type: 'text' }
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

export function emptyCandidate() {
  const base = {
    reqStatus: 'Open',
    status: 'Internal Review',
    willingRelocate: 'Yes',
    source: 'Naukri',
    interviewMode: '',
    lastRoundOutcome: ''
  }
  ALL_FIELDS.forEach(f => { if (!(f.key in base)) base[f.key] = '' })
  return base
}
