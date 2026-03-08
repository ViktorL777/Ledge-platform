'use client'
import { useState, useRef } from 'react'

// ============================================
// LEDGE — Board of Advisors
// app/board/page.js
// Full spec implementation:
//   - 5 archetypes + real person swap
//   - "Run Board" (fast) vs "Watch it unfold" (animated)
//   - Round 1 → Round 2 → Synthesis
//   - Continue conversation (pay-per-use framing)
//   - Use Last Board
// ============================================

const BASE_ARCHETYPES = [
  {
    id: 'systems_thinker',
    title: 'The Systems Thinker',
    subtitle: 'After Senge & Meadows',
    tagline: 'Traces every decision back to its structural root.',
    role: 'Slows down immediate solutions — reveals the deeper structure.',
    avatar: '⬡',
    color: '#2d4a6a',
  },
  {
    id: 'provocative_strategist',
    title: 'The Provocative Strategist',
    subtitle: 'After Sun Tzu & Machiavelli',
    tagline: 'Says what no one else dares to say.',
    role: 'Challenges comfortable consensus — asks the forbidden questions.',
    avatar: '◈',
    color: '#7a3a1a',
  },
  {
    id: 'empathetic_culture_builder',
    title: 'The Empathetic Culture Builder',
    subtitle: 'After Brown & Schein',
    tagline: 'Always asks: what does this do to the people?',
    role: 'Counterbalances purely analytical thinking — keeps humans in the frame.',
    avatar: '◯',
    color: '#1a5a3a',
  },
  {
    id: 'pragmatic_operator',
    title: 'The Pragmatic Operator',
    subtitle: 'After Drucker',
    tagline: 'What works in reality, not in theory.',
    role: 'Brings feasibility back when ideas float too high.',
    avatar: '▣',
    color: '#3a3a5a',
  },
  {
    id: 'innovative_risk_taker',
    title: 'The Innovative Risk-Taker',
    subtitle: 'After Jobs & Thiel',
    tagline: 'Breaks the comfortable status quo.',
    role: 'Disrupts status quo defense — makes the group uncomfortable on purpose.',
    avatar: '◆',
    color: '#5a1a6a',
  },
]

function makePersonas(base) {
  return base.map(a => ({ ...a, realPerson: null, swapping: false, swapInput: '' }))
}

export default function BoardPage() {
  const [phase, setPhase] = useState('input')       // input | casting | running | round1 | round2 | complete | continuing
  const [problem, setProblem] = useState('')
  const [mode, setMode] = useState('fast')           // 'fast' | 'watch'
  const [personas, setPersonas] = useState(makePersonas(BASE_ARCHETYPES))
  const [lastBoard, setLastBoard] = useState(null)

  const [round1, setRound1] = useState([])
  const [round2, setRound2] = useState([])
  const [synthesis, setSynthesis] = useState('')

  // Continue conversation
  const [continueMessages, setContinueMessages] = useState([])  // [{role, text, personaId?}]
  const [continueInput, setContinueInput] = useState('')
  const [continueLoading, setContinueLoading] = useState(false)

  const [progress, setProgress] = useState({ current: 0, total: 5, label: '' })
  const bottomRef = useRef(null)

  // ── HELPERS ────────────────────────────────────────────
  const getPersona = id => personas.find(p => p.id === id)
  const updatePersona = (i, updates) => {
    setPersonas(prev => prev.map((p, idx) => idx === i ? { ...p, ...updates } : p))
  }

  const callSpeak = async (persona, round, existingR1 = []) => {
    const res = await fetch('/api/board/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem,
        persona: { id: persona.id, title: persona.title, subtitle: persona.subtitle, tagline: persona.tagline, role: persona.role, realPerson: persona.realPerson },
        round,
        allPersonas: personas.map(p => ({ id: p.id, title: p.title, realPerson: p.realPerson })),
        round1Opinions: existingR1,
      }),
    })
    const data = await res.json()
    return data.opinion || ''
  }

  const callSynthesize = async (r1, r2) => {
    const res = await fetch('/api/board/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem,
        personas: personas.map(p => ({ id: p.id, title: p.title, realPerson: p.realPerson })),
        round1: r1,
        round2: r2,
      }),
    })
    const data = await res.json()
    return data.synthesis || ''
  }

  // ── RUN BOARD ─────────────────────────────────────────
  const handleRunBoard = async () => {
    if (!problem.trim()) return
    // Save this board as "last board"
    setLastBoard(personas.map(p => ({ ...p })))
    setPhase('running')
    setRound1([])
    setRound2([])
    setSynthesis('')
    setContinueMessages([])

    if (mode === 'fast') {
      // ── FAST MODE: fire all in parallel, show all at once ──
      setProgress({ current: 0, total: 11, label: 'Running full board session…' })

      // R1: all 5 in parallel
      const r1Promises = personas.map(p => callSpeak(p, 1).then(opinion => ({ personaId: p.id, opinion })).catch(() => ({ personaId: p.id, opinion: 'Unavailable.' })))
      const r1Results = await Promise.all(r1Promises)
      setRound1(r1Results)
      setProgress({ current: 5, total: 11, label: 'Board reacting to each other…' })

      // R2: all 5 in parallel
      const r2Promises = personas.map(p => callSpeak(p, 2, r1Results).then(reaction => ({ personaId: p.id, reaction })).catch(() => ({ personaId: p.id, reaction: 'Unavailable.' })))
      const r2Results = await Promise.all(r2Promises)
      setRound2(r2Results)
      setProgress({ current: 10, total: 11, label: 'Synthesising…' })

      const syn = await callSynthesize(r1Results, r2Results).catch(() => 'Synthesis unavailable.')
      setSynthesis(syn)
      setProgress({ current: 11, total: 11, label: 'Done' })
      setPhase('complete')
    } else {
      // ── WATCH MODE: sequential, each card appears as ready ──
      const r1Results = []
      for (let i = 0; i < personas.length; i++) {
        setProgress({ current: i + 1, total: 11, label: `${personas[i].realPerson || personas[i].title} is speaking…` })
        const opinion = await callSpeak(personas[i], 1).catch(() => 'Unavailable.')
        r1Results.push({ personaId: personas[i].id, opinion })
        setRound1([...r1Results])
      }
      setPhase('round1_done')

      const r2Results = []
      for (let i = 0; i < personas.length; i++) {
        setProgress({ current: 6 + i, total: 11, label: `${personas[i].realPerson || personas[i].title} reacts…` })
        const reaction = await callSpeak(personas[i], 2, r1Results).catch(() => 'Unavailable.')
        r2Results.push({ personaId: personas[i].id, reaction })
        setRound2([...r2Results])
      }

      setProgress({ current: 11, total: 11, label: 'Synthesising…' })
      const syn = await callSynthesize(r1Results, r2Results).catch(() => 'Synthesis unavailable.')
      setSynthesis(syn)
      setPhase('complete')
    }
  }

  // ── CONTINUE CONVERSATION ─────────────────────────────
  const handleContinue = async () => {
    if (!continueInput.trim() || continueLoading) return
    const question = continueInput.trim()
    setContinueInput('')
    setContinueLoading(true)
    setPhase('continuing')

    const newMessages = [...continueMessages, { role: 'user', text: question }]
    setContinueMessages(newMessages)

    try {
      const res = await fetch('/api/board/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem,
          personas: personas.map(p => ({ id: p.id, title: p.title, realPerson: p.realPerson, subtitle: p.subtitle, tagline: p.tagline, role: p.role })),
          round1,
          round2,
          synthesis,
          history: continueMessages,
          question,
        }),
      })
      const data = await res.json()
      const boardResponse = data.responses || []
      setContinueMessages([...newMessages, ...boardResponse.map(r => ({ role: 'board', personaId: r.personaId, text: r.reply }))])
    } catch {
      setContinueMessages([...newMessages, { role: 'error', text: 'The board could not respond.' }])
    }
    setContinueLoading(false)
    setPhase('complete')
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const handleReset = () => {
    setPhase('input')
    setProblem('')
    setRound1([])
    setRound2([])
    setSynthesis('')
    setContinueMessages([])
    setPersonas(makePersonas(BASE_ARCHETYPES))
  }

  const handleUseLastBoard = () => {
    if (lastBoard) setPersonas(lastBoard.map(p => ({ ...p, swapping: false, swapInput: '' })))
  }

  const isRunning = phase === 'running'
  const showRound1 = round1.length > 0
  const showRound2 = round2.length > 0
  const showSynthesis = synthesis !== ''

  return (
    <div style={s.page}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <header style={s.header}>
        <a href="/" style={s.backLink}>← Ledge</a>
        <div style={s.headerCenter}>
          <div style={s.headerTitle}>Board of Advisors</div>
          <div style={s.headerSub}>Five voices · Two rounds · One synthesis</div>
        </div>
        <div style={{ width: 80 }} />
      </header>

      <main style={s.main}>

        {/* ── INPUT ──────────────────────────────────────── */}
        {(phase === 'input' || phase === 'casting') && (
          <section style={s.section}>
            <div style={s.label}>The challenge</div>
            <div style={s.card}>
              <textarea
                style={s.textarea}
                value={problem}
                onChange={e => setProblem(e.target.value)}
                placeholder="Describe the leadership challenge you want the Board to examine. Be specific — the richer the context, the sharper the session."
                rows={5}
                disabled={phase === 'casting'}
              />
              {phase === 'input' && (
                <div style={s.btnRow}>
                  <button
                    style={problem.trim().length > 20 ? s.btn : s.btnDisabled}
                    disabled={problem.trim().length <= 20}
                    onClick={() => setPhase('casting')}
                  >
                    Compose Your Board →
                  </button>
                </div>
              )}
              {phase === 'casting' && (
                <button style={s.editLink} onClick={() => setPhase('input')}>Edit challenge</button>
              )}
            </div>
          </section>
        )}

        {/* ── CASTING ────────────────────────────────────── */}
        {phase === 'casting' && (
          <section style={s.section}>
            <div style={s.labelRow}>
              <div style={s.label}>Your board</div>
              {lastBoard && (
                <button style={s.useLastBtn} onClick={handleUseLastBoard}>↩ Use last board</button>
              )}
            </div>
            <p style={s.desc}>
              Five archetypal advisors have been assembled. You can replace any with a real person — they will speak in that person's documented style and worldview.
            </p>
            <div style={s.personaGrid}>
              {personas.map((p, i) => (
                <div key={p.id} style={s.personaCard}>
                  <div style={{ ...s.avatarBox, background: p.color }}>{p.avatar}</div>
                  <div style={s.pName}>{p.realPerson || p.title}</div>
                  {!p.realPerson && <div style={s.pInspiration}>{p.subtitle}</div>}
                  <div style={s.pTagline}>"{p.tagline}"</div>
                  <div style={s.pRole}>{p.role}</div>
                  {p.swapping ? (
                    <div>
                      <input
                        style={s.swapInput}
                        value={p.swapInput}
                        onChange={e => updatePersona(i, { swapInput: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && p.swapInput.trim() && updatePersona(i, { realPerson: p.swapInput.trim(), swapping: false })}
                        placeholder="e.g. Elon Musk, Brené Brown…"
                        autoFocus
                      />
                      <div style={s.disclaimer}>AI simulation — does not represent this person's actual views.</div>
                      <div style={s.swapBtns}>
                        <button style={s.swapConfirm} onClick={() => p.swapInput.trim() && updatePersona(i, { realPerson: p.swapInput.trim(), swapping: false })}>Confirm</button>
                        <button style={s.swapCancel} onClick={() => updatePersona(i, { swapping: false, swapInput: '' })}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={s.swapRow}>
                      {p.realPerson ? (
                        <>
                          <span style={s.realBadge}>Real person</span>
                          <button style={s.link} onClick={() => updatePersona(i, { swapping: true, swapInput: p.realPerson })}>Change</button>
                          <button style={s.link} onClick={() => updatePersona(i, { realPerson: null })}>Reset</button>
                        </>
                      ) : (
                        <button style={s.link} onClick={() => updatePersona(i, { swapping: true })}>Replace with real person</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── MODE SELECTOR ─────────────────────────── */}
            <div style={s.modeRow}>
              <div style={s.modeLabel}>Session mode</div>
              <div style={s.modeBtns}>
                <button
                  style={mode === 'fast' ? s.modeActive : s.modeInactive}
                  onClick={() => setMode('fast')}
                >
                  <span style={s.modeIcon}>⚡</span>
                  <div>
                    <div style={s.modeTitle}>Run Board</div>
                    <div style={s.modeSub}>Results appear all at once</div>
                  </div>
                </button>
                <button
                  style={mode === 'watch' ? s.modeActive : s.modeInactive}
                  onClick={() => setMode('watch')}
                >
                  <span style={s.modeIcon}>◎</span>
                  <div>
                    <div style={s.modeTitle}>Watch it unfold</div>
                    <div style={s.modeSub}>Each advisor speaks in turn</div>
                  </div>
                </button>
              </div>
            </div>

            <div style={s.centerRow}>
              <button style={s.runBtn} onClick={handleRunBoard}>
                {mode === 'fast' ? '⚡ Run Board' : '◎ Watch it unfold'} →
              </button>
            </div>
          </section>
        )}

        {/* ── PROGRESS ───────────────────────────────────── */}
        {isRunning && (
          <div style={s.progressCard}>
            <div style={s.progressLabel}>{progress.label}</div>
            <div style={s.progressTrack}>
              <div style={{ ...s.progressFill, width: `${Math.round((progress.current / progress.total) * 100)}%` }} />
            </div>
            <div style={s.progressCount}>{progress.current} / {progress.total}</div>
          </div>
        )}

        {/* ── ROUND 1 ────────────────────────────────────── */}
        {showRound1 && (
          <section style={s.section}>
            <div style={s.label}>Round 1 — Initial positions</div>
            <div style={s.columnsGrid}>
              {round1.map(({ personaId, opinion }) => {
                const p = getPersona(personaId)
                return (
                  <div key={personaId} style={{ ...s.column, borderTop: `3px solid ${p.color}` }}>
                    <div style={s.colHeader}>
                      <span style={{ ...s.colAvatar, background: p.color }}>{p.avatar}</span>
                      <span style={s.colName}>{p.realPerson || p.title}</span>
                    </div>
                    <p style={s.colText}>{opinion}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── ROUND 2 ────────────────────────────────────── */}
        {showRound2 && (
          <section style={s.section}>
            <div style={s.label}>Round 2 — The board reacts</div>
            <div style={s.columnsGrid}>
              {round2.map(({ personaId, reaction }) => {
                const p = getPersona(personaId)
                return (
                  <div key={personaId} style={{ ...s.column, borderTop: `3px solid ${p.color}`, background: 'rgba(26,43,74,0.02)' }}>
                    <div style={s.colHeader}>
                      <span style={{ ...s.colAvatar, background: p.color }}>{p.avatar}</span>
                      <span style={s.colName}>{p.realPerson || p.title}</span>
                      <span style={s.reactingBadge}>reacting</span>
                    </div>
                    <p style={s.colText}>{reaction}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── SYNTHESIS ──────────────────────────────────── */}
        {showSynthesis && (
          <div style={s.synthesisCard}>
            <div style={s.synthesisLabel}>Board Synthesis</div>
            <div style={s.synthesisText}>{synthesis}</div>
            <div style={s.synthesisActions}>
              <button
                style={s.copyBtn}
                onClick={() => navigator.clipboard?.writeText(`Board of Advisors — Ledge\n\nChallenge:\n${problem}\n\nSynthesis:\n${synthesis}`)}
              >
                Copy synthesis
              </button>
              <button style={s.newSessionBtn} onClick={handleReset}>New session</button>
            </div>
          </div>
        )}

        {/* ── CONTINUE CONVERSATION ──────────────────────── */}
        {(phase === 'complete' || phase === 'continuing') && showSynthesis && (
          <section style={s.continueSection}>
            <div style={s.continueHeader}>
              <div>
                <div style={s.label}>Continue the conversation</div>
                <p style={s.continueSub}>Ask the board a follow-up question. They will respond individually.</p>
              </div>
              <div style={s.continuePricing}>€0.99 / round</div>
            </div>

            {continueMessages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <div key={i} style={s.userMsg}>
                    <span style={s.userMsgLabel}>You</span>
                    <p style={s.userMsgText}>{msg.text}</p>
                  </div>
                )
              }
              if (msg.role === 'board') {
                const p = getPersona(msg.personaId)
                return (
                  <div key={i} style={{ ...s.boardReply, borderLeft: `3px solid ${p?.color || '#1a2b4a'}` }}>
                    <div style={s.boardReplyName}>{p?.realPerson || p?.title || msg.personaId}</div>
                    <p style={s.boardReplyText}>{msg.text}</p>
                  </div>
                )
              }
              return null
            })}

            <div ref={bottomRef} />

            <div style={s.continueInputRow}>
              <textarea
                style={s.continueTextarea}
                value={continueInput}
                onChange={e => setContinueInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleContinue())}
                placeholder="Ask the board a follow-up…"
                rows={3}
                disabled={continueLoading}
              />
              <button
                style={continueLoading || !continueInput.trim() ? s.btnDisabled : s.btn}
                disabled={continueLoading || !continueInput.trim()}
                onClick={handleContinue}
              >
                {continueLoading ? '…' : 'Ask →'}
              </button>
            </div>
            <div style={s.continueNote}>Each follow-up round is billed separately. ⌘+Enter to send.</div>
          </section>
        )}

      </main>
    </div>
  )
}

// ============================================
// STYLES
// ============================================
const s = {
  page: { minHeight: '100vh', background: '#f7f6f3', fontFamily: "'DM Sans', sans-serif" },
  header: { background: '#1a2b4a', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  backLink: { color: '#b87333', textDecoration: 'none', fontSize: '0.875rem', width: 80 },
  headerCenter: { textAlign: 'center' },
  headerTitle: { fontFamily: "'Fraunces', serif", color: '#f7f6f3', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' },
  headerSub: { color: '#6b7b8d', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.2rem' },
  main: { maxWidth: 1160, margin: '0 auto', padding: '2.5rem 1.5rem 6rem' },
  section: { marginBottom: '2.5rem' },
  label: { fontFamily: "'Fraunces', serif", color: '#b87333', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.75rem' },
  labelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' },
  useLastBtn: { background: 'none', border: '1px solid rgba(26,43,74,0.2)', borderRadius: 6, color: '#6b7b8d', fontSize: '0.75rem', cursor: 'pointer', padding: '0.3rem 0.75rem', fontFamily: "'DM Sans', sans-serif" },
  desc: { color: '#6b7b8d', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: 680 },
  card: { background: '#fff', borderRadius: 16, padding: '2rem', border: '1px solid rgba(26,43,74,0.08)', boxShadow: '0 4px 20px rgba(26,43,74,0.06)' },
  textarea: { width: '100%', padding: '1rem', fontSize: '0.95rem', lineHeight: 1.7, color: '#1a2b4a', background: '#f7f6f3', border: '1.5px solid rgba(26,43,74,0.12)', borderRadius: 10, resize: 'vertical', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
  btnRow: { display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' },
  btn: { background: '#1a2b4a', color: '#f7f6f3', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  btnDisabled: { background: '#c8d0d8', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', fontSize: '0.9rem', cursor: 'not-allowed', fontFamily: "'DM Sans', sans-serif" },
  editLink: { background: 'none', border: 'none', color: '#b87333', fontSize: '0.8rem', cursor: 'pointer', padding: '0.4rem 0 0', fontFamily: "'DM Sans', sans-serif", textDecoration: 'underline' },
  personaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  personaCard: { background: '#fff', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(26,43,74,0.08)', boxShadow: '0 2px 10px rgba(26,43,74,0.05)', display: 'flex', flexDirection: 'column' },
  avatarBox: { width: 38, height: 38, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#fff', marginBottom: '0.75rem', flexShrink: 0 },
  pName: { fontFamily: "'Fraunces', serif", color: '#1a2b4a', fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.2rem' },
  pInspiration: { color: '#b87333', fontSize: '0.67rem', letterSpacing: '0.04em', marginBottom: '0.5rem' },
  pTagline: { color: '#1a2b4a', fontSize: '0.77rem', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '0.5rem' },
  pRole: { color: '#6b7b8d', fontSize: '0.72rem', lineHeight: 1.5, marginBottom: '0.75rem', flexGrow: 1 },
  swapRow: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' },
  link: { background: 'none', border: 'none', color: '#b87333', fontSize: '0.72rem', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontFamily: "'DM Sans', sans-serif" },
  realBadge: { background: 'rgba(184,115,51,0.1)', color: '#b87333', fontSize: '0.62rem', borderRadius: 4, padding: '0.1rem 0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase' },
  swapInput: { width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.8rem', color: '#1a2b4a', background: '#f7f6f3', border: '1.5px solid #b87333', borderRadius: 6, outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', marginBottom: '0.3rem' },
  disclaimer: { color: '#9ba8b5', fontSize: '0.63rem', lineHeight: 1.4, fontStyle: 'italic', marginBottom: '0.4rem' },
  swapBtns: { display: 'flex', gap: '0.5rem' },
  swapConfirm: { background: '#1a2b4a', color: '#fff', border: 'none', borderRadius: 5, padding: '0.3rem 0.75rem', fontSize: '0.73rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  swapCancel: { background: 'none', color: '#6b7b8d', border: '1px solid rgba(26,43,74,0.15)', borderRadius: 5, padding: '0.3rem 0.75rem', fontSize: '0.73rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },

  // Mode selector
  modeRow: { marginBottom: '2rem' },
  modeLabel: { fontFamily: "'Fraunces', serif", color: '#b87333', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.75rem' },
  modeBtns: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  modeActive: { display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#1a2b4a', color: '#f7f6f3', border: 'none', borderRadius: 10, padding: '0.9rem 1.5rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' },
  modeInactive: { display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', color: '#1a2b4a', border: '1.5px solid rgba(26,43,74,0.15)', borderRadius: 10, padding: '0.9rem 1.5rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' },
  modeIcon: { fontSize: '1.3rem' },
  modeTitle: { fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.2 },
  modeSub: { fontSize: '0.72rem', opacity: 0.7, marginTop: '0.15rem' },

  centerRow: { display: 'flex', justifyContent: 'center', marginTop: '0.5rem' },
  runBtn: { background: '#1a2b4a', color: '#f7f6f3', border: 'none', borderRadius: 10, padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em' },

  // Progress
  progressCard: { background: '#fff', borderRadius: 12, padding: '2rem', textAlign: 'center', marginBottom: '2rem', border: '1px solid rgba(26,43,74,0.08)' },
  progressLabel: { color: '#1a2b4a', fontFamily: "'Fraunces', serif", fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' },
  progressTrack: { height: 4, background: 'rgba(26,43,74,0.1)', borderRadius: 2, overflow: 'hidden', maxWidth: 400, margin: '0 auto' },
  progressFill: { height: '100%', background: '#b87333', borderRadius: 2, transition: 'width 0.4s ease' },
  progressCount: { color: '#9ba8b5', fontSize: '0.78rem', marginTop: '0.75rem' },

  // Columns (boardroom table feel)
  columnsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  column: { background: '#fff', borderRadius: 0, padding: '1.25rem', border: '1px solid rgba(26,43,74,0.08)', borderRadius: 4, boxShadow: '0 2px 8px rgba(26,43,74,0.04)' },
  colHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
  colAvatar: { width: 26, height: 26, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff', flexShrink: 0 },
  colName: { fontFamily: "'Fraunces', serif", color: '#1a2b4a', fontSize: '0.8rem', fontWeight: 600, flex: 1, lineHeight: 1.2 },
  reactingBadge: { background: 'rgba(184,115,51,0.1)', color: '#b87333', fontSize: '0.58rem', borderRadius: 3, padding: '0.1rem 0.35rem', letterSpacing: '0.06em', textTransform: 'uppercase' },
  colText: { color: '#3a4a5a', fontSize: '0.83rem', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' },

  // Synthesis
  synthesisCard: { background: '#1a2b4a', borderRadius: 16, padding: '2.5rem', marginBottom: '2rem' },
  synthesisLabel: { fontFamily: "'Fraunces', serif", color: '#b87333', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1.25rem' },
  synthesisText: { fontSize: '0.95rem', lineHeight: 1.85, color: '#f7f6f3', whiteSpace: 'pre-line', marginBottom: '2rem' },
  synthesisActions: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  copyBtn: { background: '#b87333', color: '#fff', border: 'none', borderRadius: 8, padding: '0.65rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  newSessionBtn: { background: 'rgba(247,246,243,0.1)', color: '#f7f6f3', border: '1px solid rgba(247,246,243,0.2)', borderRadius: 8, padding: '0.65rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },

  // Continue conversation
  continueSection: { marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(26,43,74,0.1)' },
  continueHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  continueSub: { color: '#6b7b8d', fontSize: '0.83rem', margin: '0.25rem 0 0', lineHeight: 1.5 },
  continuePricing: { background: 'rgba(184,115,51,0.1)', color: '#b87333', fontSize: '0.75rem', fontWeight: 600, borderRadius: 6, padding: '0.3rem 0.75rem', letterSpacing: '0.04em', whiteSpace: 'nowrap' },
  userMsg: { background: '#fff', border: '1px solid rgba(26,43,74,0.1)', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '0.75rem' },
  userMsgLabel: { color: '#b87333', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' },
  userMsgText: { color: '#1a2b4a', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 },
  boardReply: { background: '#fff', paddingLeft: '1rem', margin: '0 0 0.5rem 1rem', padding: '0.9rem 1rem 0.9rem 1rem', borderRadius: '0 8px 8px 0', marginBottom: '0.6rem', border: '1px solid rgba(26,43,74,0.06)' },
  boardReplyName: { fontFamily: "'Fraunces', serif", color: '#1a2b4a', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' },
  boardReplyText: { color: '#3a4a5a', fontSize: '0.83rem', lineHeight: 1.7, margin: 0 },
  continueInputRow: { display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginTop: '1.25rem' },
  continueTextarea: { flex: 1, padding: '0.85rem 1rem', fontSize: '0.9rem', lineHeight: 1.6, color: '#1a2b4a', background: '#fff', border: '1.5px solid rgba(26,43,74,0.15)', borderRadius: 8, resize: 'none', outline: 'none', fontFamily: "'DM Sans', sans-serif" },
  continueNote: { color: '#9ba8b5', fontSize: '0.68rem', marginTop: '0.5rem' },
}
