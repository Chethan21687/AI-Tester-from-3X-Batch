const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function handleResponse(res) {
  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data.detail) detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
    } catch {
      /* ignore */
    }
    throw new Error(detail)
  }
  return res.json()
}

export async function getStats(filters = {}) {
  const params = new URLSearchParams()
  if (filters.month) params.set('month', filters.month)
  if (filters.year) params.set('year', filters.year)
  const res = await fetch(`${API_BASE}/stats?${params.toString()}`)
  return handleResponse(res)
}

export async function getDashboard(recruiter, filters = {}) {
  const params = new URLSearchParams()
  if (recruiter) params.set('recruiter', recruiter)
  if (filters.month) params.set('month', filters.month)
  if (filters.year) params.set('year', filters.year)
  const res = await fetch(`${API_BASE}/dashboard?${params.toString()}`)
  return handleResponse(res)
}

export async function getRecruiters() {
  const res = await fetch(`${API_BASE}/recruiters`)
  return handleResponse(res)
}

export async function addRecruiter(name, email) {
  const res = await fetch(`${API_BASE}/recruiters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  })
  return handleResponse(res)
}

export async function deleteRecruiter(id) {
  const res = await fetch(`${API_BASE}/recruiters/${id}`, { method: 'DELETE' })
  return handleResponse(res)
}

export async function getCandidates(recruiter, date, filters = {}) {
  const params = new URLSearchParams()
  if (recruiter) params.set('recruiter', recruiter)
  if (date) params.set('date', date)
  if (filters.month) params.set('month', filters.month)
  if (filters.year) params.set('year', filters.year)
  const res = await fetch(`${API_BASE}/candidates?${params.toString()}`)
  return handleResponse(res)
}

export async function updateCandidateStatus(id, status) {
  const res = await fetch(`${API_BASE}/candidates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  return handleResponse(res)
}

export async function updateCandidate(id, fields) {
  const res = await fetch(`${API_BASE}/candidates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  })
  return handleResponse(res)
}

export async function deleteCandidate(id) {
  const res = await fetch(`${API_BASE}/candidates/${id}`, { method: 'DELETE' })
  return handleResponse(res)
}

export async function exportCandidates(recruiter, date, filters = {}) {
  const params = new URLSearchParams()
  if (recruiter) params.set('recruiter', recruiter)
  if (date) params.set('date', date)
  if (filters.month) params.set('month', filters.month)
  if (filters.year) params.set('year', filters.year)
  const res = await fetch(`${API_BASE}/candidates/export?${params.toString()}`)
  if (!res.ok) {
    let detail = `Export failed (${res.status})`
    try {
      const data = await res.json()
      if (data.detail) detail = data.detail
    } catch {
      /* ignore */
    }
    throw new Error(detail)
  }
  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition') || ''
  const match = disposition.match(/filename="?([^";]+)"?/)
  const filename = match ? match[1] : 'candidates_export.xlsx'
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function getLogs(params = {}) {
  const query = new URLSearchParams()
  if (params.recruiter) query.set('recruiter', params.recruiter)
  if (params.candidate) query.set('candidate', params.candidate)
  if (params.limit) query.set('limit', params.limit)
  const res = await fetch(`${API_BASE}/logs?${query.toString()}`)
  return handleResponse(res)
}

export async function uploadExcel(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form })
  return handleResponse(res)
}
