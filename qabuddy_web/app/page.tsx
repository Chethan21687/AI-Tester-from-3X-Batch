'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, User, Loader2, ExternalLink, Check } from 'lucide-react'

const C = {
  bg: '#FDFBF5', band: '#F7F2E6', sub: '#FBF8EF', card: '#FFFFFF',
  border: '#E6DCC4', border2: '#EAE2CE', ink: '#3B3220', muted: '#8A7C63',
  faint: '#B3A587', gold: '#9C7C3C', goldSoft: '#F3ECDA', terra: '#C0603A',
  terraSoft: '#F8EAE3',
}

// 12 knowledge sources from the QABuddy Enterprise Requirement Document.
// `dot` = colored indicator, `count` = demo chunk count, `ctx` = grounding text
// injected into the system prompt when the source is in scope.
const SOURCES = [
  { id: 'selenium', label: 'Selenium repo', dot: '#C0603A', count: 6,
    ctx: 'Selenium repo (Java · TestNG · Maven · POM · utilities · Jenkins): https://github.com/SeleniumHQ/selenium — explain code, generate automation, compare implementations.' },
  { id: 'playwright', label: 'Playwright repo', dot: '#4C9A6A', count: 6,
    ctx: 'Playwright repo (Python · Pytest · Page Objects · Fixtures · API): https://github.com/microsoft/playwright — generate tests, fix locators, explain framework.' },
  { id: 'vwo', label: 'VWO project', dot: '#3E7CB1', count: 4,
    ctx: 'VWO project: end-to-end automation for login, dashboard, reports, heatmaps, funnels, API validation, regression.' },
  { id: 'testcases', label: 'Test cases', dot: '#5B57A6', count: 8,
    ctx: 'Test case repository: ~5,000 manual + automated cases (CSV/XLSX/JSON) with Test ID, steps, expected result, priority, severity, automation status, sprint mapping.' },
  { id: 'jira', label: 'JIRA · QAB', dot: '#B3413B', count: 6,
    ctx: 'JIRA project key QAB — Epics/Stories/Tasks/Bugs/Defects/Sprints. Samples: QAB-1 User Authentication (Epic), QAB-2 Login Story, QAB-6 Automate Login (Task), QAB-15 Login 500 Error (Bug), QAB-101 Payment Failure.' },
  { id: 'docs', label: 'Company docs', dot: '#8A5CB0', count: 3,
    ctx: 'Company docs: QA Guidelines, Automation Standards, Engineering Handbook, Coding Standards, Release Checklist, README.md, Architecture.md, deployment guides.' },
  { id: 'figma', label: 'Figma', dot: '#C86B9E', count: 2,
    ctx: 'Figma (Phase 2): wireframes, ER diagrams, user guides, UI flows, prototypes.' },
  { id: 'meetings', label: 'Meeting notes', dot: '#3F9E9E', count: 2,
    ctx: 'Meeting notes & recordings: sprint planning, retrospectives, standups, client meetings, transcripts.' },
  { id: 'lucid', label: 'Lucid charts', dot: '#3AA6B9', count: 2,
    ctx: 'Lucid charts: architecture, deployment, API flow, database ERD, CI/CD diagrams (text/PDF).' },
  { id: 'requirements', label: 'Requirements', dot: '#C99A3A', count: 3,
    ctx: 'Requirement documents: PRD, BRD, FRD, SRS PDFs — business, functional, technical requirements.' },
  { id: 'jenkins', label: 'Jenkins', dot: '#6B7280', count: 4,
    ctx: 'Jenkins: pipeline logs, console output, HTML/Allure reports, screenshots, build history.' },
  { id: 'swagger', label: 'Swagger', dot: '#7FA83A', count: 2,
    ctx: 'Swagger: API specs for contract/Swagger validation.' },
]

const MODES = [
  { id: 'auto', label: 'auto-detect', hint: 'Detect intent (explain / generate / analyze / summarize) automatically.' },
  { id: 'explain', label: 'explain code', hint: 'Explain framework code and structure step by step.' },
  { id: 'generate', label: 'generate test', hint: 'Generate Selenium/Playwright tests or manual test cases.' },
  { id: 'analyze', label: 'analyze jira', hint: 'Analyze JIRA tickets, defects, root cause, and history.' },
  { id: 'summarize', label: 'summarize', hint: 'Summarize meetings, builds, or documents concisely.' },
]

const STARTERS = [
  'Explain QAB-15: the Login 500 Error bug and likely root cause',
  'Generate a Playwright test for the login module',
  'Which test cases cover payment failure (QAB-101)?',
  'Summarize the latest sprint retrospective',
]

const STEPS = [
  { n: 1, title: 'Understand', body: 'your question is condensed and rewritten into search variants' },
  { n: 2, title: 'Hybrid search', body: 'meaning (dense) + exact keywords (ids, exceptions, method names) across selected sources' },
  { n: 3, title: 'Fuse & rerank', body: 'both result lists merge (RRF), a cross-encoder keeps the 6 most relevant chunks' },
  { n: 4, title: 'Cited answer', body: 'the LLM answers only from those chunks, citing [n] → file:line, ticket, or build' },
]

function buildSystem(scope: string[], mode: string): string {
  const active = SOURCES.filter(s => scope.includes(s.id))
  const modeHint = MODES.find(m => m.id === mode)?.hint || ''
  let s = `You are QA Buddy, an internal QA knowledge assistant for the QABuddy platform. Answer grounded ONLY in the in-scope sources below.

Mode: ${modeHint}

Sources in scope:`
  for (const a of active) s += `\n- ${a.ctx}`
  s += `

Rules:
1. Ground every claim in the in-scope sources; if the answer is not covered, say so.
2. Reference JIRA by key (QAB-15), test cases by ID, and code by file path.
3. When asked to generate tests, produce runnable, well-structured code.
4. After your answer, output EXACTLY one line and never omit it:
<sources>[{"label":"<short>","type":"<source id>","ref":"<path, key, or url>"}]</sources>`
  return s
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ label: string; type: string; ref: string }>
}

export default function Home() {
  const [scope, setScope] = useState<string[]>(SOURCES.map(s => s.id))
  const [mode, setMode] = useState('auto')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, busy])

  const toggle = (id: string) =>
    setScope(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const totalChunks = SOURCES.filter(s => scope.includes(s.id)).reduce((a, s) => a + s.count, 0)

  async function ask(question?: string) {
    const q = (question ?? input).trim()
    if (!q || busy) return
    if (scope.length === 0) { setErr('Select at least one knowledge source.'); return }
    setErr('')
    setInput('')
    const h = [...messages, { role: 'user' as const, content: q }]
    setMessages(h)
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: h, scope, system: buildSystem(scope, mode) }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      let clean = data.answer || ''
      let sources: Message['sources'] = []
      const m = clean.match(/<sources>([\s\S]*?)<\/sources>/)
      if (m) {
        clean = clean.replace(m[0], '').trim()
        try { sources = JSON.parse(m[1]) } catch { }
      }
      setMessages(p => [...p, { role: 'assistant', content: clean, sources }])
    } catch (e: any) {
      setErr(e.message)
      setMessages(p => p.slice(0, -1))
      setInput(q)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg, color: C.ink }}>
      {/* ── Sidebar ───────────────────────────── */}
      <aside style={{ width: 288, flexShrink: 0, background: C.card, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '20px 22px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4C9A6A', boxShadow: '0 0 0 3px #DCEBE1' }} />
            <span style={{ fontWeight: 700, fontSize: 20 }}>QA Buddy</span>
          </div>
          <div style={{ fontSize: 10.5, color: C.faint, letterSpacing: 2, marginTop: 4, marginLeft: 19 }}>QA KNOWLEDGE SYSTEM</div>
        </div>

        <div style={{ padding: '0 22px', flex: 1 }}>
          <div style={{ fontSize: 10.5, color: C.gold, fontWeight: 700, letterSpacing: 1.5, margin: '4px 0 10px' }}>KNOWLEDGE BASE</div>
          {SOURCES.map(s => {
            const on = scope.includes(s.id)
            return (
              <button key={s.id} onClick={() => toggle(s.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? C.terra : C.card, border: `1.5px solid ${on ? C.terra : C.border}` }}>
                  {on && <Check size={11} color="#fff" strokeWidth={3} />}
                </span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0, opacity: on ? 1 : 0.35 }} />
                <span style={{ flex: 1, fontSize: 13.5, color: on ? C.ink : C.muted }}>{s.label}</span>
                <span style={{ fontSize: 12, color: C.faint }}>{s.count}</span>
              </button>
            )
          })}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, color: C.muted }}>
            <span>total chunks <b style={{ color: C.ink }}>{totalChunks}</b></span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => setScope(SOURCES.map(s => s.id))}
              style={{ fontSize: 12, padding: '4px 12px', borderRadius: 7, border: `1px solid ${C.border}`, background: C.sub, color: C.muted, cursor: 'pointer' }}>all</button>
            <button onClick={() => setScope([])}
              style={{ fontSize: 12, padding: '4px 12px', borderRadius: 7, border: `1px solid ${C.border}`, background: C.sub, color: C.muted, cursor: 'pointer' }}>none</button>
          </div>

          <div style={{ fontSize: 10.5, color: C.gold, fontWeight: 700, letterSpacing: 1.5, margin: '22px 0 8px' }}>MODE</div>
          <select value={mode} onChange={e => setMode(e.target.value)}
            style={{ width: '100%', padding: '9px 11px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.sub, color: C.ink, fontSize: 13, cursor: 'pointer' }}>
            {MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>

        <div style={{ padding: '16px 22px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10.5, color: C.gold, fontWeight: 700, letterSpacing: 1.5 }}>INGEST</span>
          <button onClick={() => setErr('Ingestion is a Phase-2 backend feature (Qdrant + ingestion worker); this web build answers from the documented sources.')}
            style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, border: `1px solid ${C.border}`, background: C.card, color: C.muted, cursor: 'pointer' }}>open</button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ height: 4, background: '#1E3A5F' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 26px', borderBottom: `1px solid ${C.border}`, fontSize: 12.5, color: C.muted }}>
          <span>ask <span style={{ color: C.faint }}>→</span> hybrid search <span style={{ color: C.faint }}>→</span> rerank <span style={{ color: C.faint }}>→</span> <b style={{ color: C.terra }}>cited answer</b></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4C9A6A' }} />online</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '30px 26px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            {messages.length === 0 && (
              <>
                <p style={{ fontSize: 20, lineHeight: 1.6, color: C.ink, fontWeight: 400, marginTop: 4 }}>
                  Ask a question and receive a single, <b style={{ color: C.terra }}>citation-backed</b> answer drawn directly from your
                  team's QA knowledge base — the Selenium and Playwright frameworks, ~5,000 test cases, JIRA (QAB), product
                  requirements, meeting notes, and Jenkins build logs.
                </p>

                <div style={{ background: C.card, border: `1px solid ${C.border2}`, borderRadius: 14, padding: '22px 24px', margin: '26px 0' }}>
                  <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 1.5, marginBottom: 16 }}>HOW YOUR ANSWER IS FETCHED</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px 40px' }}>
                    {STEPS.map(st => (
                      <div key={st.n} style={{ display: 'flex', gap: 12 }}>
                        <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: '50%', border: `1.5px solid ${C.terra}`, color: C.terra, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{st.n}</span>
                        <div>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{st.title}</div>
                          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginTop: 2 }}>{st.body}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                  {STARTERS.map((q, i) => (
                    <button key={i} onClick={() => ask(q)}
                      style={{ textAlign: 'left', background: C.card, border: `1px solid ${C.border2}`, borderRadius: 999, padding: '13px 20px', cursor: 'pointer', fontSize: 13.5, color: C.ink, lineHeight: 1.4 }}>
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 18, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.role === 'user' ? C.terraSoft : C.goldSoft, border: `1px solid ${C.border}` }}>
                  {m.role === 'user' ? <User size={16} color={C.terra} /> : <Sparkles size={16} color={C.gold} />}
                </div>
                <div style={{ maxWidth: '82%' }}>
                  <div style={{ background: C.card, border: `1px solid ${m.role === 'user' ? C.terraSoft : C.border2}`, borderRadius: 12, padding: '12px 15px', fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                    {m.content}
                  </div>
                  {m.sources?.length ? (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {m.sources.map((s, j) => (
                        <a key={j} href={s.ref.startsWith('http') ? s.ref : '#'} target={s.ref.startsWith('http') ? '_blank' : undefined} rel={s.ref.startsWith('http') ? 'noreferrer' : undefined}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.goldSoft, border: `1px solid ${C.border}`, borderRadius: 999, padding: '4px 11px', fontSize: 11.5, color: C.gold, fontWeight: 600, textDecoration: 'none' }}>
                          {s.label} {s.ref.startsWith('http') && <ExternalLink size={11} />}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {busy && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: C.muted, fontSize: 13 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: C.goldSoft, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={16} color={C.gold} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
                Retrieving from {scope.length} source{scope.length > 1 ? 's' : ''}…
              </div>
            )}
            {err && (
              <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', color: '#791F1F', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginTop: 8 }}>
                {err}
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, background: C.card, padding: '16px 26px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', border: `1.5px solid ${C.terra}`, borderRadius: 12, background: C.sub, padding: 6 }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask() } }}
                placeholder="ask about tests, tickets, failures, the framework…"
                disabled={busy}
                rows={1}
                style={{ flex: 1, resize: 'none', border: 'none', background: 'transparent', padding: '9px 11px', fontSize: 14, color: C.ink, outline: 'none', fontFamily: 'inherit', maxHeight: 160 }}
              />
              <button onClick={() => ask()} disabled={busy || !input.trim()}
                style={{ background: busy || !input.trim() ? C.border : C.terra, border: 'none', borderRadius: 9, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: busy ? 'default' : 'pointer', flexShrink: 0 }}>
                <Send size={17} color="#fff" />
              </button>
            </div>
            <div style={{ fontSize: 11.5, color: C.faint, marginTop: 8 }}>enter to send · shift+enter for newline · answers always cite their sources</div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
