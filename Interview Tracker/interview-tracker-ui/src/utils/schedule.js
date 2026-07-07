// Per-candidate interview scheduling: calendar invite (.ics) + email notify.

function toICSDate(dt) {
  if (!dt) return ''
  return dt.replace(/[-:]/g, '').replace('T', 'T') + '00'
}
function addMinutes(dt, mins) {
  const d = new Date(dt)
  d.setMinutes(d.getMinutes() + (Number(mins) || 30))
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function buildICS(c) {
  const start = toICSDate(c.interviewDate)
  const end = toICSDate(addMinutes(c.interviewDate, c.interviewDuration))
  const uid = `${c.id}-${Date.now()}@interview-tracker`
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Interview Tracker//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Interview - ${c.name} (${c.client})`,
    `DESCRIPTION:Mode: ${c.interviewMode || 'TBD'} | Req: ${c.reqId} | Skills: ${c.relevantExp}`,
    c.email ? `ATTENDEE;CN=${c.name}:mailto:${c.email}` : '',
    'END:VEVENT', 'END:VCALENDAR'
  ].filter(Boolean).join('\r\n')
}

export function downloadICS(c) {
  const blob = new Blob([buildICS(c)], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `interview-${c.name.replace(/\s+/g, '_')}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

export function mailtoSchedule(c) {
  const when = c.interviewDate ? new Date(c.interviewDate).toLocaleString() : '(set Interview Date)'
  const subject = `Interview Scheduled - ${c.name} (${c.client})`
  const body =
    `Hi ${c.name},\n\n` +
    `Your interview is scheduled for ${when}.\n` +
    `Mode: ${c.interviewMode || 'TBD'}\n` +
    `Duration: ${c.interviewDuration || 30} min\n` +
    `Requirement: ${c.reqId} (${c.client})\n\n` +
    `Regards,\n${c.recruiter || 'Recruitment Team'}`
  return `mailto:${c.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
