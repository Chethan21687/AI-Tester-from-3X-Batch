// Thin client for the Langflow REST API.
// All calls go through cfg.baseUrl ('' in dev → Vite proxy to :7860).

export function authHeaders(apiKey) {
  return apiKey && apiKey.trim() ? { 'x-api-key': apiKey.trim() } : {}
}

// Parse a response as JSON, but give a useful error when the server returns
// HTML (e.g. the SPA's index.html because Base URL doesn't point at Langflow).
async function parseJson(res, what) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    const looksHtml = /^\s*</.test(text)
    if (looksHtml)
      throw new Error(
        `${what}: got an HTML page instead of JSON. Base URL is not pointing at ` +
          `a Langflow server (it hit the app itself). Set Base URL in Connection ` +
          `settings to your Langflow URL, or the VITE_LANGFLOW_URL env var.`
      )
    throw new Error(`${what}: response was not valid JSON — ${text.slice(0, 120)}`)
  }
}

// GET the flow graph and auto-discover the input / file / output node ids.
// Returns { chatInputId, fileId, chatOutputId, nodes } — any may be ''.
export async function discoverComponents(cfg) {
  const res = await fetch(`${cfg.baseUrl}/api/v1/flows/${cfg.flowId}`, {
    headers: authHeaders(cfg.apiKey)
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Could not load flow (${res.status}): ${t}`)
  }
  const flow = await parseJson(res, 'Load flow')
  const nodes = flow?.data?.nodes || flow?.nodes || []

  const idOf = (matchers) => {
    for (const n of nodes) {
      const id = n.id || ''
      const type = n?.data?.type || n?.data?.node?.type || ''
      const hay = `${id} ${type}`.toLowerCase()
      if (matchers.some((m) => hay.includes(m))) return id
    }
    return ''
  }

  return {
    chatInputId: idOf(['chatinput', 'textinput']),
    fileId: idOf(['file']),
    chatOutputId: idOf(['chatoutput']),
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n?.data?.type || n?.data?.node?.type || ''
    }))
  }
}

// Upload a file to the flow. Returns the server-side file path string.
export async function uploadFile(cfg, file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${cfg.baseUrl}/api/v1/files/upload/${cfg.flowId}`, {
    method: 'POST',
    headers: authHeaders(cfg.apiKey),
    body: fd
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Upload of ${file.name} failed (${res.status}): ${t}`)
  }
  const data = await parseJson(res, 'Upload')
  return data.file_path || data.filePath || data.path
}

// Run the flow. tweaks is a plain object keyed by component id.
export async function runFlow(cfg, { inputValue, tweaks, sessionId }) {
  const body = {
    output_type: 'chat',
    input_type: 'chat',
    input_value: inputValue,
    session_id: sessionId,
    tweaks: tweaks || {}
  }
  const res = await fetch(
    `${cfg.baseUrl}/api/v1/run/${cfg.flowId}?stream=false`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(cfg.apiKey) },
      body: JSON.stringify(body)
    }
  )
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Run failed (${res.status}): ${t}`)
  }
  return parseJson(res, 'Run')
}

// Pull the message text out of Langflow's nested run response.
export function extractText(data) {
  const out = data?.outputs?.[0]?.outputs?.[0]
  const msg = out?.results?.message
  const text =
    msg?.text ||
    msg?.data?.text ||
    out?.outputs?.message?.message ||
    out?.artifacts?.message ||
    ''
  const props = msg?.properties || msg?.data?.properties || {}
  return {
    text,
    sessionId: data?.session_id,
    model: props?.source?.source || props?.source?.display_name,
    usage: props?.usage
  }
}
