// Shared serialization helpers for the Recruiter Tracker serverless backend.

const MONTH_MAP = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
}

// A candidate's date is stored as text in the "3rd Aug 2026" style. Parse out
// the month number and year so dashboard/candidate filters can match on them.
// Returns { month, year } or null when the date can't be parsed.
export function parseDateParts(dateStr) {
  const parts = String(dateStr || '').trim().split(/\s+/)
  let month = null
  let year = null
  for (const token of parts) {
    const m = MONTH_MAP[token.slice(0, 3)]
    if (m) month = m
    const y = token.match(/(19|20)\d{2}/)
    if (y) year = Number(y[0])
  }
  if (month === null || year === null) return null
  return { month, year }
}

export function candidateToDict(doc) {
  return {
    id: String(doc._id),
    name: doc.name || '',
    phone: doc.phone || '',
    email: doc.email || '',
    status: doc.status || '',
    client: doc.client || '',
    recruiter: doc.recruiter || '',
    date: doc.date || '',
    total_experience: doc.total_experience || '',
    relevant_experience: doc.relevant_experience || '',
    skill: doc.skill || '',
    notice_period: doc.notice_period || '',
    current_location: doc.current_location || '',
    preferred_location: doc.preferred_location || '',
    current_ctc: doc.current_ctc || '',
    expected_ctc: doc.expected_ctc || '',
    education: doc.education || '',
    updated_at: doc.updated_at || '',
  }
}
