const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const getSettings = () => request('/settings');
export const saveSettings = (settings) =>
  request('/settings', { method: 'POST', body: JSON.stringify(settings) });
export const fetchJiraTicket = (ticketId) =>
  request('/jira/fetch', { method: 'POST', body: JSON.stringify({ ticketId }) });
export const generateTestCases = (ticketId) =>
  request('/cases/generate', { method: 'POST', body: JSON.stringify({ ticketId }) });
