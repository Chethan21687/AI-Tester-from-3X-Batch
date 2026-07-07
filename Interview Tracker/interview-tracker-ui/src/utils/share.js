// Dashboard-level sharing: Excel export, email summary, Teams share.
import * as XLSX from 'xlsx'
import { ALL_FIELDS } from '../config/fields.js'

// Build a worksheet row set from candidates using human labels as headers.
function toRows(candidates) {
  return candidates.map(c => {
    const o = {}
    ALL_FIELDS.forEach(f => { o[f.label] = c[f.key] ?? '' })
    return o
  })
}

export function exportExcel(candidates, filename = 'Interview_Tracker.xlsx') {
  const ws = XLSX.utils.json_to_sheet(toRows(candidates))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Submission Log')
  XLSX.writeFile(wb, filename)
}

// A compact text summary of the pipeline for email / Teams messages.
export function buildSummary(candidates) {
  const by = key => candidates.reduce((m, c) => {
    const k = c[key] || '—'; m[k] = (m[k] || 0) + 1; return m
  }, {})
  const statusCounts = by('status')
  const clientCounts = by('client')
  const line = obj => Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([k, v]) => `  ${k}: ${v}`).join('\n')

  const scheduled = candidates
    .filter(c => c.interviewDate)
    .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
    .map(c => `  ${new Date(c.interviewDate).toLocaleString()} — ${c.name} (${c.client}, ${c.interviewMode || 'TBD'}, ${c.interviewDuration || '?'}m)`)
    .join('\n')

  return (
    `Interview Tracker — Pipeline Summary\n` +
    `Total candidates: ${candidates.length}\n\n` +
    `By Status:\n${line(statusCounts)}\n\n` +
    `By Client (Requirement):\n${line(clientCounts)}\n\n` +
    `Upcoming / Scheduled Interviews:\n${scheduled || '  (none)'}\n`
  )
}

// Opens the default mail client with the summary pre-filled.
export function mailtoSummary(candidates, to = '') {
  const subject = `Interview Tracker Report — ${new Date().toLocaleDateString()}`
  const body = buildSummary(candidates) +
    `\n(Attach the exported Excel from "Export Excel" before sending.)`
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

// Microsoft Teams "share to Teams" launcher. Opens the Teams share dialog
// pre-filled with a message; the recruiter picks the channel/chat.
export function teamsShareUrl(candidates) {
  const msg = buildSummary(candidates)
  // Teams share deep link. href is required; we pass a summary as the message.
  const params = new URLSearchParams({
    href: 'https://teams.microsoft.com',
    msgText: msg
  })
  return `https://teams.microsoft.com/share?${params.toString()}`
}

export function openTeamsShare(candidates) {
  window.open(teamsShareUrl(candidates), '_blank', 'noopener,width=700,height=600')
}
