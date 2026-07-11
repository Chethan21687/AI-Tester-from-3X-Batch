import { useEffect, useMemo, useState } from 'react'
import { marked } from 'marked'
import {
  discoverComponents,
  uploadFile,
  runFlow,
  extractText
} from './langflow.js'
import {
  parseTestCases,
  TC_COLUMNS,
  exportCsv,
  exportExcel,
  exportJson
} from './testcases.js'

const DEFAULT_QUERY =
  'Using the requirement context below, generate 500 detailed test cases. ' +
  'Return them as a markdown table with columns: TC ID | Title | Priority | ' +
  'Preconditions | Steps | Expected Result. Cover positive, negative, ' +
  'boundary, and edge scenarios.'

const DEFAULTS = {
  baseUrl: '',
  flowId: '1b208206-690f-48e2-862d-d627a03b04a0',
  apiKey: '',
  chatInputId: '',
  fileId: '',
  query: DEFAULT_QUERY,
  target: 500,
  batch: 50
}

const STORAGE_KEY = 'rag-tc-cfg'

function loadCfg() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { ...DEFAULTS, ...saved }
  } catch {
    return DEFAULTS
  }
}

export default function App() {
  const [pdf, setPdf] = useState(null)
  const [cfg, setCfg] = useState(loadCfg)

  // Persist config (incl. API key) to localStorage so it survives reloads.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
    } catch {
      /* storage unavailable — ignore */
    }
  }, [cfg])
  const [showCfg, setShowCfg] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [logs, setLogs] = useState([])

  const setField = (k) => (e) => setCfg((c) => ({ ...c, [k]: e.target.value }))

  const addLog = (level, message, detail) =>
    setLogs((prev) => [
      ...prev,
      { ts: new Date().toLocaleTimeString(), level, message, detail }
    ])

  async function autoDiscover() {
    setError('')
    try {
      setStatus('Discovering flow components…')
      const d = await discoverComponents(cfg)
      setCfg((c) => ({
        ...c,
        chatInputId: c.chatInputId || d.chatInputId,
        fileId: c.fileId || d.fileId
      }))
      addLog(
        'info',
        'Components discovered',
        `chat input: ${d.chatInputId || '—'} · file: ${d.fileId || '—'}`
      )
      if (!d.chatInputId && !d.fileId)
        addLog('warn', 'No matching nodes found', 'Set component IDs manually.')
    } catch (e) {
      setError('Could not discover components. See logs.')
      addLog('error', 'Discovery failed', e.message || String(e))
    } finally {
      setStatus('')
    }
  }

  function validate() {
    const errs = []
    if (!cfg.flowId.trim()) errs.push('Flow ID is empty.')
    if (!cfg.query.trim()) errs.push('Requirement / prompt is empty.')
    if (pdf && !/\.pdf$/i.test(pdf.name))
      errs.push(`"${pdf.name}" is not a .pdf file.`)
    return errs
  }

  async function run() {
    setError('')
    setResult(null)
    const vErrors = validate()
    if (vErrors.length) {
      setError('Validation failed. See error logs below.')
      vErrors.forEach((m) => addLog('error', 'Validation failed', m))
      return
    }

    setLoading(true)
    try {
      const tweaks = {}
      let fileId = cfg.fileId

      if (pdf) {
        if (!fileId) {
          setStatus('Discovering file component…')
          const d = await discoverComponents(cfg)
          fileId = d.fileId
          if (fileId) setCfg((c) => ({ ...c, fileId }))
        }
        if (!fileId)
          throw new Error(
            'A PDF was selected but no File component id is set. Use "Auto-discover" or set it in settings.'
          )
        setStatus('Uploading requirement PDF…')
        const path = await uploadFile(cfg, pdf)
        addLog('info', 'Uploaded PDF', path)
        tweaks[fileId] = { path }
      }

      const target = Math.max(1, parseInt(cfg.target, 10) || 500)
      const batch = Math.max(1, parseInt(cfg.batch, 10) || 50)

      const collected = []
      const seen = new Set()
      let lastMeta = {}
      let lastRaw = null
      let stall = 0
      const maxIters = Math.ceil(target / batch) + 4

      for (let iter = 0; iter < maxIters && collected.length < target; iter++) {
        const start = collected.length + 1
        const end = Math.min(target, start + batch - 1)
        setStatus(
          `Generating test cases ${start}–${end} of ${target}… (${collected.length} so far)`
        )

        const prompt =
          `${cfg.query}\n\n` +
          `IMPORTANT BATCH INSTRUCTION: Output ONLY test cases numbered ${start} ` +
          `through ${end} (${end - start + 1} of ${target} total). Use unique ` +
          `TC IDs like TC${String(start).padStart(3, '0')} … TC${String(end).padStart(3, '0')}. ` +
          `Do NOT repeat any earlier test case. Return ONLY the markdown table ` +
          `(header row + data rows), no prose before or after.`

        const data = await runFlow(cfg, {
          inputValue: prompt,
          tweaks,
          sessionId: `testcase-ui-${start}`
        })
        lastRaw = data
        const ex = extractText(data)
        lastMeta = ex
        const parsed = parseTestCases(ex.text)

        let added = 0
        for (const tc of parsed.cases) {
          const key = String(tc.id || '').toLowerCase().trim()
          const dupKey = key || `t:${(tc.title || '').toLowerCase().trim()}`
          if (dupKey && seen.has(dupKey)) continue
          seen.add(dupKey)
          collected.push(tc)
          added++
          if (collected.length >= target) break
        }

        addLog(
          'info',
          `Batch ${iter + 1}: +${added} test cases`,
          `total ${collected.length}/${target} (${parsed.format})`
        )

        // Progressive render so the table fills as batches complete.
        setResult({
          ...lastMeta,
          cases: collected.slice(),
          format: parsed.format,
          raw: lastRaw
        })

        if (added === 0) {
          stall++
          if (stall >= 2) {
            addLog(
              'warn',
              'Stopped early',
              `Two batches added nothing new — model likely exhausted context at ${collected.length}.`
            )
            break
          }
        } else {
          stall = 0
        }
      }

      if (!collected.length)
        addLog(
          'warn',
          'No structured test cases parsed',
          'Showing raw output instead — check the format or prompt.'
        )
      else if (collected.length < target)
        addLog(
          'warn',
          `Reached ${collected.length}/${target}`,
          'Lower the batch size, or the model/RAG context ran out of unique cases.'
        )
      else addLog('info', 'Generation complete', `${collected.length} test cases`)

      setResult({
        ...lastMeta,
        cases: collected,
        format: parseTestCases(lastMeta.text || '').format,
        raw: lastRaw
      })
    } catch (e) {
      setError('Request failed. See error logs below.')
      addLog('error', 'Request failed', e.message || String(e))
    } finally {
      setLoading(false)
      setStatus('')
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="brand">
          <span className="logo">◆</span>
          <div>
            <h1>RAG Test Case Generator</h1>
            <p className="sub">
              Upload a requirement PDF, run it through your Langflow RAG flow,
              and get structured test cases you can filter and export.
            </p>
          </div>
        </div>
      </header>

      <section className="card">
        <div className="upload-row">
          <PdfPicker file={pdf} onPick={setPdf} />
        </div>

        <label className="field">
          <span>Requirement / prompt</span>
          <textarea rows={4} value={cfg.query} onChange={setField('query')} />
        </label>

        <div className="cfg-bar">
          <button
            className="toggle"
            type="button"
            onClick={() => setShowCfg((v) => !v)}
          >
            {showCfg ? '▾ Hide connection settings' : '▸ Connection settings'}
          </button>
          <div className="cfg-actions">
            <button className="ghost" type="button" onClick={autoDiscover}>
              Auto-discover components
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem(STORAGE_KEY)
                } catch {
                  /* ignore */
                }
                setCfg(DEFAULTS)
                addLog('info', 'Saved settings cleared', 'API key removed from this browser.')
              }}
            >
              Forget saved settings
            </button>
          </div>
        </div>

        {showCfg && (
          <div className="cfg-grid">
            <Field label="Base URL" value={cfg.baseUrl} onChange={setField('baseUrl')} placeholder="blank = dev proxy → :7860" />
            <Field label="Flow ID" value={cfg.flowId} onChange={setField('flowId')} />
            <Field label="API key (x-api-key)" type="password" value={cfg.apiKey} onChange={setField('apiKey')} placeholder="if Langflow auth is on" />
            <Field label="Chat Input component ID" value={cfg.chatInputId} onChange={setField('chatInputId')} placeholder="auto-discovered" />
            <Field label="File component ID" value={cfg.fileId} onChange={setField('fileId')} placeholder="auto-discovered" />
            <Field label="Target test cases" type="number" value={cfg.target} onChange={setField('target')} />
            <Field label="Batch size (per LLM call)" type="number" value={cfg.batch} onChange={setField('batch')} />
          </div>
        )}

        <button className="run" onClick={run} disabled={loading}>
          {loading ? status || 'Working…' : 'Generate test cases'}
        </button>
        {loading && status && <div className="progress">{status}</div>}
      </section>

      {error && <div className="alert error">{error}</div>}

      {logs.length > 0 && <ErrorLogs logs={logs} onClear={() => setLogs([])} />}

      {result && <ResultView result={result} />}
    </div>
  )
}

function Field({ label, ...rest }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...rest} />
    </label>
  )
}

function PdfPicker({ file, onPick }) {
  return (
    <label className="file-card">
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={(e) => onPick(e.target.files[0] || null)}
      />
      <span className="file-icon">📄</span>
      <span className="file-label">Requirement PDF (optional)</span>
      <span className={'file-name' + (file ? ' has' : '')}>
        {file ? file.name : 'Click to choose a .pdf — or rely on the flow’s vector store'}
      </span>
    </label>
  )
}

function ErrorLogs({ logs, onClear }) {
  const hasError = logs.some((l) => l.level === 'error')
  return (
    <section className="card logs">
      <div className="logs-head">
        <h2 className={hasError ? 'err' : ''}>{hasError ? '⚠ Error logs' : 'Logs'}</h2>
        <button className="toggle" type="button" onClick={onClear}>
          Clear
        </button>
      </div>
      <ul className="log-list">
        {logs.map((l, i) => (
          <li key={i} className={'log-row ' + l.level}>
            <span className="log-ts">{l.ts}</span>
            <span className={'log-badge ' + l.level}>{l.level}</span>
            <span className="log-body">
              <strong>{l.message}</strong>
              {l.detail && <span className="log-detail">{l.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ResultView({ result }) {
  const [tab, setTab] = useState(result.cases.length ? 'table' : 'raw')
  const html = useMemo(
    () => marked.parse(result.text || '_No text returned._'),
    [result.text]
  )
  return (
    <section className="card result">
      <div className="meta">
        <span className="chip strong">{result.cases.length} test cases</span>
        {result.format && result.format !== 'none' && (
          <span className="chip">parsed as: {result.format}</span>
        )}
        {result.model && <span className="chip">model: {result.model}</span>}
        {result.usage && (
          <span className="chip">
            tokens: {result.usage.total_tokens}
          </span>
        )}
        {result.sessionId && <span className="chip">session: {result.sessionId}</span>}
      </div>

      <div className="tabs">
        <button className={tab === 'table' ? 'tab on' : 'tab'} onClick={() => setTab('table')} disabled={!result.cases.length}>
          Table
        </button>
        <button className={tab === 'raw' ? 'tab on' : 'tab'} onClick={() => setTab('raw')}>
          Raw output
        </button>
        <button className={tab === 'json' ? 'tab on' : 'tab'} onClick={() => setTab('json')}>
          Response JSON
        </button>
      </div>

      {tab === 'table' && result.cases.length > 0 && (
        <TestCaseTable cases={result.cases} />
      )}
      {tab === 'raw' && (
        <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
      )}
      {tab === 'json' && (
        <pre className="raw">{JSON.stringify(result.raw, null, 2)}</pre>
      )}
    </section>
  )
}

function TestCaseTable({ cases }) {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState({ key: '', dir: 1 })

  const rows = useMemo(() => {
    let r = cases
    if (q.trim()) {
      const t = q.toLowerCase()
      r = r.filter((tc) =>
        TC_COLUMNS.some((c) => String(tc[c.key] || '').toLowerCase().includes(t))
      )
    }
    if (sort.key) {
      r = [...r].sort((a, b) => {
        const av = String(a[sort.key] || '')
        const bv = String(b[sort.key] || '')
        return av.localeCompare(bv, undefined, { numeric: true }) * sort.dir
      })
    }
    return r
  }, [cases, q, sort])

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }))

  return (
    <div className="tc">
      <div className="tc-bar">
        <input
          className="tc-search"
          placeholder="Filter test cases…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="tc-count">
          {rows.length} / {cases.length}
        </span>
        <div className="tc-export">
          <button className="ghost" onClick={() => exportCsv(rows)}>CSV</button>
          <button className="ghost" onClick={() => exportExcel(rows)}>Excel</button>
          <button className="ghost" onClick={() => exportJson(rows)}>JSON</button>
        </div>
      </div>
      <div className="tc-scroll">
        <table className="tc-table">
          <thead>
            <tr>
              {TC_COLUMNS.map((c) => (
                <th key={c.key} onClick={() => toggleSort(c.key)}>
                  {c.label}
                  {sort.key === c.key ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((tc, i) => (
              <tr key={i}>
                {TC_COLUMNS.map((c) => (
                  <td key={c.key} className={'col-' + c.key}>
                    {tc[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
