'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// ============================================================
// LEDGE — AI Coach & Advisory Board
// app/coach/page.js v4
//
// CHANGES FROM v3:
// + Tab structure: AI Coach | Advisory Board (same page)
// + Advisory Board tab: full inline board flow
//   - "Activate your Board" always visible + active
//   - "I invite the AI-coach to formulate my question" option
//   - Coach reformulation via route.js reformulate mode
// + Board-ready banner in Coach chat (from route.js board_ready signal)
//   - Banner appears, Board tab activates with editable pre-filled context
// + Coach history passed as context when activating Board from Coach
// ============================================================

// ── BOARD ARCHETYPES ──────────────────────────────────────────
const BASE_ARCHETYPES = [
  { id: 'systems_thinker', title: 'The Systems Thinker', subtitle: 'After Senge & Meadows', tagline: 'Traces every decision back to its structural root.', role: 'Slows down immediate solutions — reveals the deeper structure.', avatar: '⬡', color: '#2d4a6a' },
  { id: 'provocative_strategist', title: 'The Provocative Strategist', subtitle: 'After Sun Tzu & Machiavelli', tagline: 'Says what no one else dares to say.', role: 'Challenges comfortable consensus — asks the forbidden questions.', avatar: '◈', color: '#7a3a1a' },
  { id: 'empathetic_culture_builder', title: 'The Empathetic Culture Builder', subtitle: 'After Brown & Schein', tagline: 'Always asks: what does this do to the people?', role: 'Counterbalances purely analytical thinking — keeps humans in the frame.', avatar: '◯', color: '#1a5a3a' },
  { id: 'pragmatic_operator', title: 'The Pragmatic Operator', subtitle: 'After Drucker', tagline: 'What works in reality, not in theory.', role: 'Brings feasibility back when ideas float too high.', avatar: '▣', color: '#3a3a5a' },
  { id: 'innovative_risk_taker', title: 'The Innovative Risk-Taker', subtitle: 'After Jobs & Thiel', tagline: 'Breaks the comfortable status quo.', role: 'Disrupts status quo defense — makes the group uncomfortable on purpose.', avatar: '◆', color: '#5a1a6a' },
];

function makePersonas(base) {
  return base.map(a => ({ ...a, realPerson: null, swapping: false, swapInput: '' }));
}

const MODE_META = {
  clarify: { label: 'Clarify', hint: 'Finding the real question' },
  analyze: { label: 'Analyze', hint: 'Mapping the full picture' },
  change_readiness: { label: 'Change Readiness', hint: 'Assessing when to act' },
};

// ============================================================
// EMAIL GATE MODAL
// ============================================================
function EmailGateModal({ onSave, onDismiss, isSaving }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);
  const handleSubmit = () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError('Please enter a valid email address.'); return; }
    setError(''); onSave(trimmed);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(26,43,74,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '2.5rem', maxWidth: '460px', width: '100%', boxShadow: '0 20px 60px rgba(26,43,74,0.2)' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.4rem', fontWeight: '600', color: '#1a2b4a', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Save your coaching profile</h2>
        <p style={{ fontSize: '0.88rem', color: '#6b7b8d', lineHeight: '1.65', marginBottom: '1.75rem' }}>The Coach will remember your patterns, challenges, and commitments across sessions — so the next conversation starts exactly where this one left off.</p>
        <input ref={inputRef} type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="your@email.com"
          style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '0.95rem', color: '#1a2b4a', backgroundColor: '#f7f6f3', border: error ? '1.5px solid #e05a5a' : '1.5px solid rgba(26,43,74,0.12)', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', marginBottom: '0.5rem' }}
          onFocus={e => { if (!error) e.target.style.borderColor = '#b87333'; }} onBlur={e => { if (!error) e.target.style.borderColor = 'rgba(26,43,74,0.12)'; }}
        />
        {error && <p style={{ fontSize: '0.78rem', color: '#e05a5a', marginBottom: '0.5rem' }}>{error}</p>}
        <p style={{ fontSize: '0.72rem', color: '#9ba8b5', marginBottom: '1.5rem', lineHeight: '1.5' }}>Your data is encrypted and never sold. You can delete everything from Settings at any time.</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleSubmit} disabled={isSaving} style={{ flex: 1, backgroundColor: '#1a2b4a', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>{isSaving ? 'Saving...' : 'Save profile'}</button>
          <button onClick={onDismiss} style={{ backgroundColor: 'transparent', border: '1px solid rgba(26,43,74,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#6b7b8d', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Not now</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROFILE SAVED BANNER
// ============================================================
function ProfileSavedBanner({ isNew, onDismiss }) {
  return (
    <div style={{ backgroundColor: 'rgba(184,115,51,0.08)', border: '1px solid rgba(184,115,51,0.25)', borderRadius: '10px', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div>
        <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#b87333', marginBottom: '0.2rem' }}>{isNew ? 'Profile created' : 'Profile updated'}</p>
        <p style={{ fontSize: '0.78rem', color: '#6b7b8d' }}>{isNew ? 'The Coach will remember your patterns in future sessions.' : 'Your coaching profile has been updated with insights from this session.'}</p>
      </div>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ba8b5', fontSize: '1.1rem', padding: '0 0.25rem' }}>×</button>
    </div>
  );
}

// ============================================================
// INTENT CAPTURE SCREEN
// ============================================================
function IntentCapture({ savedEmail, onStart }) {
  const [intent, setIntent] = useState('');
  const [email, setEmail] = useState(savedEmail || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);
  useEffect(() => { textareaRef.current?.focus(); }, []);
  const handleSubmit = () => {
    const trimmed = intent.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    onStart(trimmed, email.trim() || null);
  };
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f6f3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: '700', color: '#1a2b4a', letterSpacing: '-0.02em' }}>LEDGE</span>
          <span style={{ display: 'block', fontSize: '0.7rem', color: '#b87333', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '2px' }}>AI Coach</span>
        </a>
      </div>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '3rem', maxWidth: '600px', width: '100%', boxShadow: '0 4px 24px rgba(26,43,74,0.08)', border: '1px solid rgba(26,43,74,0.06)' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.7rem', fontWeight: '600', color: '#1a2b4a', marginBottom: '0.75rem', lineHeight: '1.3', letterSpacing: '-0.02em' }}>
          By the end of this conversation, what do you want to have — that you don't have right now?
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#6b7b8d', marginBottom: '2rem', lineHeight: '1.6' }}>A clarity you're missing. A decision you can't make yet. A map of something complex. Name it.</p>
        <textarea ref={textareaRef} value={intent} onChange={e => setIntent(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
          placeholder="e.g. I want to understand why I keep avoiding this conversation with my board..."
          rows={4}
          style={{ width: '100%', padding: '1rem', fontSize: '0.95rem', lineHeight: '1.6', color: '#1a2b4a', backgroundColor: '#f7f6f3', border: '1.5px solid rgba(26,43,74,0.12)', borderRadius: '10px', resize: 'vertical', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
          onFocus={e => { e.target.style.borderColor = '#b87333'; }} onBlur={e => { e.target.style.borderColor = 'rgba(26,43,74,0.12)'; }}
        />
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ba8b5', marginBottom: '0.4rem' }}>Returning? Enter your email to load your coaching profile.</p>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com (optional)"
            style={{ width: '100%', padding: '0.65rem 0.9rem', fontSize: '0.85rem', color: '#1a2b4a', backgroundColor: '#f7f6f3', border: '1.5px solid rgba(26,43,74,0.10)', borderRadius: '8px', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = '#b87333'; }} onBlur={e => { e.target.style.borderColor = 'rgba(26,43,74,0.10)'; }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#9ba8b5' }}>⌘ + Enter to begin</span>
          <button onClick={handleSubmit} disabled={!intent.trim() || isSubmitting}
            style={{ backgroundColor: intent.trim() ? '#1a2b4a' : '#c8d0d8', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.75rem', fontSize: '0.9rem', fontWeight: '600', cursor: intent.trim() ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif" }}>
            {isSubmitting ? 'Starting...' : 'Begin session'}
          </button>
        </div>
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <a href="/settings/coach" style={{ fontSize: '0.75rem', color: '#9ba8b5', textDecoration: 'none' }}>Settings & Privacy</a>
      </div>
    </div>
  );
}

// ============================================================
// BOARD READY BANNER — appears in Coach chat when signal fires
// ============================================================
function BoardReadyBanner({ reason, onActivate, onDismiss }) {
  return (
    <div style={{ backgroundColor: 'rgba(184,115,51,0.06)', border: '1.5px solid rgba(184,115,51,0.3)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.78rem', fontWeight: '700', color: '#b87333', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Advisory Board available</p>
        <p style={{ fontSize: '0.85rem', color: '#1a2b4a', lineHeight: '1.55', marginBottom: '0.75rem' }}>{reason}</p>
        <p style={{ fontSize: '0.72rem', color: '#9ba8b5', lineHeight: '1.4' }}>The Advisory Board is a limited feature. It uses your session quota or is available as a paid add-on.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
        <button onClick={onActivate}
          style={{ backgroundColor: '#b87333', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
          Activate your Board →
        </button>
        <button onClick={onDismiss}
          style={{ backgroundColor: 'transparent', border: 'none', color: '#9ba8b5', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'center' }}>
          Not now
        </button>
      </div>
    </div>
  );
}

// ============================================================
// COACH CHAT INTERFACE
// ============================================================
function CoachChatInterface({
  initialIntent, sessionId, mode, modeLabel, messages,
  onSendMessage, isLoading, onReset, leaderEmail,
  onRequestSaveProfile, profileSaved, isNewProfile,
  onDismissProfileBanner, showEmailGate, onSaveWithEmail,
  onDismissEmailGate, isSavingProfile,
  boardReadyData, onActivateBoard, onDismissBoardBanner,
}) {
  const [input, setInput] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const loadInsights = async () => {
    if (loadingInsights || insights) { setShowInsights(s => !s); return; }
    setLoadingInsights(true); setShowInsights(true);
    try {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      const res = await fetch('/api/insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: lastUserMsg?.content || initialIntent, mode }) });
      const data = await res.json();
      setInsights(data.articles || []);
    } catch { setInsights([]); }
    finally { setLoadingInsights(false); }
  };

  const modeMeta = MODE_META[mode] || MODE_META.clarify;
  const sessionLongEnough = messages.length >= 4;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f6f3', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>
      {showEmailGate && <EmailGateModal onSave={onSaveWithEmail} onDismiss={onDismissEmailGate} isSaving={isSavingProfile} />}

      {/* Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid rgba(26,43,74,0.08)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, minHeight: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.15rem', fontWeight: '700', color: '#1a2b4a', letterSpacing: '-0.02em' }}>LEDGE</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(184,115,51,0.08)', border: '1px solid rgba(184,115,51,0.2)', borderRadius: '20px', padding: '0.2rem 0.7rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#b87333', display: 'block' }} />
            <span style={{ fontSize: '0.72rem', color: '#b87333', fontWeight: '600', letterSpacing: '0.05em' }}>{modeLabel}</span>
            <span style={{ fontSize: '0.68rem', color: '#9ba8b5' }}>— {modeMeta.hint}</span>
          </div>
          {leaderEmail && <span style={{ fontSize: '0.72rem', color: '#9ba8b5' }}>↩ Profile loaded</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={loadInsights} style={{ backgroundColor: 'transparent', border: '1px solid rgba(26,43,74,0.15)', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: '#6b7b8d', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>📎</span><span>Related insights</span>
          </button>
          {sessionLongEnough && !leaderEmail && !profileSaved && (
            <button onClick={onRequestSaveProfile} style={{ backgroundColor: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.3)', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: '#b87333', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: '600' }}>Save profile</button>
          )}
          <button onClick={onReset} style={{ backgroundColor: 'transparent', border: 'none', color: '#9ba8b5', cursor: 'pointer', fontSize: '0.8rem', padding: '0.4rem 0.6rem', fontFamily: "'DM Sans', sans-serif" }}>New session</button>
        </div>
      </header>

      {/* Insights panel */}
      {showInsights && (
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid rgba(26,43,74,0.08)', padding: '1rem 1.5rem' }}>
          <h3 style={{ fontSize: '0.8rem', color: '#6b7b8d', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Related Insights from Ledge</h3>
          {loadingInsights ? <p style={{ fontSize: '0.85rem', color: '#9ba8b5' }}>Loading...</p>
            : insights?.length > 0 ? (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {insights.map((a, i) => (
                  <a key={i} href={a.url || a.original_url || '#'} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', backgroundColor: '#f7f6f3', border: '1px solid rgba(26,43,74,0.08)', borderRadius: '8px', padding: '0.7rem 1rem', maxWidth: '280px', textDecoration: 'none' }}>
                    <p style={{ fontSize: '0.78rem', color: '#b87333', fontWeight: '600', marginBottom: '0.25rem' }}>{a.primary_dimension || 'Leadership'}</p>
                    <p style={{ fontSize: '0.85rem', color: '#1a2b4a', lineHeight: '1.4', fontWeight: '500' }}>{a.title}</p>
                  </a>
                ))}
              </div>
            ) : <p style={{ fontSize: '0.85rem', color: '#9ba8b5' }}>No related articles found.</p>}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 1.5rem', maxWidth: '720px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {profileSaved && <ProfileSavedBanner isNew={isNewProfile} onDismiss={onDismissProfileBanner} />}
        {boardReadyData && (
          <BoardReadyBanner
            reason={boardReadyData.reason}
            onActivate={onActivateBoard}
            onDismiss={onDismissBoardBanner}
          />
        )}

        {/* Session goal */}
        <div style={{ backgroundColor: 'rgba(26,43,74,0.04)', border: '1px solid rgba(26,43,74,0.08)', borderRadius: '10px', padding: '0.875rem 1.25rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.72rem', color: '#9ba8b5', marginBottom: '0.3rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Session goal</p>
          <p style={{ fontSize: '0.88rem', color: '#1a2b4a', lineHeight: '1.5', fontStyle: 'italic' }}>"{initialIntent}"</p>
        </div>

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: msg.role === 'user' ? '#1a2b4a' : '#b87333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', fontWeight: '700', color: '#fff' }}>
              {msg.role === 'user' ? 'YOU' : 'LC'}
            </div>
            <div style={{ backgroundColor: msg.role === 'user' ? '#1a2b4a' : '#fff', color: msg.role === 'user' ? '#f7f6f3' : '#1a2b4a', borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', padding: '0.875rem 1.125rem', maxWidth: '85%', fontSize: '0.92rem', lineHeight: '1.65', boxShadow: msg.role === 'assistant' ? '0 1px 8px rgba(26,43,74,0.06)' : 'none', border: msg.role === 'assistant' ? '1px solid rgba(26,43,74,0.06)' : 'none', whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#b87333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', color: '#fff' }}>LC</div>
            <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,43,74,0.06)', borderRadius: '4px 16px 16px 16px', padding: '0.875rem 1.25rem', boxShadow: '0 1px 8px rgba(26,43,74,0.06)' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#b87333', opacity: 0.6, animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ backgroundColor: '#fff', borderTop: '1px solid rgba(26,43,74,0.08)', padding: '1rem 1.5rem', position: 'sticky', bottom: 0 }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Your response..." rows={1}
            style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.92rem', lineHeight: '1.5', color: '#1a2b4a', backgroundColor: '#f7f6f3', border: '1.5px solid rgba(26,43,74,0.12)', borderRadius: '10px', resize: 'none', outline: 'none', fontFamily: "'DM Sans', sans-serif", minHeight: '44px', maxHeight: '160px', overflow: 'auto' }}
            onFocus={e => { e.target.style.borderColor = '#b87333'; }} onBlur={e => { e.target.style.borderColor = 'rgba(26,43,74,0.12)'; }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'; }}
          />
          <button onClick={handleSend} disabled={!input.trim() || isLoading}
            style={{ backgroundColor: input.trim() && !isLoading ? '#1a2b4a' : '#c8d0d8', color: '#fff', border: 'none', borderRadius: '10px', width: '44px', height: '44px', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p style={{ maxWidth: '720px', margin: '0.5rem auto 0', fontSize: '0.7rem', color: '#9ba8b5', textAlign: 'center' }}>Enter to send · Shift+Enter for new line</p>
      </div>
      <style>{`@keyframes pulse { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }`}</style>
    </div>
  );
}

// ============================================================
// ADVISORY BOARD TAB — full inline board flow
// ============================================================
function AdvisoryBoardTab({ prefilledContext, onClearPrefill }) {
  // Board phases: 'input' | 'reformulating' | 'casting' | 'running' | 'complete' | 'continuing'
  const [boardPhase, setBoardPhase] = useState('input');
  const [problem, setProblem] = useState(prefilledContext || '');
  const [isReformulating, setIsReformulating] = useState(false);
  const [mode, setMode] = useState('fast');
  const [personas, setPersonas] = useState(makePersonas(BASE_ARCHETYPES));
  const [lastBoard, setLastBoard] = useState(null);
  const [round1, setRound1] = useState([]);
  const [round2, setRound2] = useState([]);
  const [synthesis, setSynthesis] = useState('');
  const [continueMessages, setContinueMessages] = useState([]);
  const [continueInput, setContinueInput] = useState('');
  const [continueLoading, setContinueLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 5, label: '' });
  const bottomRef = useRef(null);

  // Sync prefilled context when it changes
  useEffect(() => {
    if (prefilledContext) { setProblem(prefilledContext); onClearPrefill && onClearPrefill(); }
  }, [prefilledContext]);

  const getPersona = id => personas.find(p => p.id === id);
  const updatePersona = (i, updates) => setPersonas(prev => prev.map((p, idx) => idx === i ? { ...p, ...updates } : p));

  // ── REFORMULATE via Coach API ─────────────────────────────
  const handleReformulate = async () => {
    if (!problem.trim() || isReformulating) return;
    setIsReformulating(true);
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: problem }],
          reformulate: true,
        }),
      });
      const data = await res.json();
      if (data.message) setProblem(data.message);
    } catch { /* silent — keep original text */ }
    finally { setIsReformulating(false); }
  };

  // ── BOARD API CALLS ───────────────────────────────────────
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
    });
    const data = await res.json();
    return data.opinion || '';
  };

  const callSynthesize = async (r1, r2) => {
    const res = await fetch('/api/board/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem, personas: personas.map(p => ({ id: p.id, title: p.title, realPerson: p.realPerson })), round1: r1, round2: r2 }),
    });
    const data = await res.json();
    return data.synthesis || '';
  };

  // ── RUN BOARD ─────────────────────────────────────────────
  const handleRunBoard = async () => {
    if (!problem.trim()) return;
    setLastBoard(personas.map(p => ({ ...p })));
    setBoardPhase('running');
    setRound1([]); setRound2([]); setSynthesis(''); setContinueMessages([]);

    if (mode === 'fast') {
      setProgress({ current: 0, total: 11, label: 'Running full board session…' });
      const r1Results = await Promise.all(personas.map(p => callSpeak(p, 1).then(opinion => ({ personaId: p.id, opinion })).catch(() => ({ personaId: p.id, opinion: 'Unavailable.' }))));
      setRound1(r1Results);
      setProgress({ current: 5, total: 11, label: 'Board reacting to each other…' });
      const r2Results = await Promise.all(personas.map(p => callSpeak(p, 2, r1Results).then(reaction => ({ personaId: p.id, reaction })).catch(() => ({ personaId: p.id, reaction: 'Unavailable.' }))));
      setRound2(r2Results);
      setProgress({ current: 10, total: 11, label: 'Synthesising…' });
      const syn = await callSynthesize(r1Results, r2Results).catch(() => 'Synthesis unavailable.');
      setSynthesis(syn);
      setProgress({ current: 11, total: 11, label: 'Done' });
      setBoardPhase('complete');
    } else {
      const r1Results = [];
      for (let i = 0; i < personas.length; i++) {
        setProgress({ current: i + 1, total: 11, label: `${personas[i].realPerson || personas[i].title} is speaking…` });
        const opinion = await callSpeak(personas[i], 1).catch(() => 'Unavailable.');
        r1Results.push({ personaId: personas[i].id, opinion });
        setRound1([...r1Results]);
      }
      const r2Results = [];
      for (let i = 0; i < personas.length; i++) {
        setProgress({ current: 6 + i, total: 11, label: `${personas[i].realPerson || personas[i].title} reacts…` });
        const reaction = await callSpeak(personas[i], 2, r1Results).catch(() => 'Unavailable.');
        r2Results.push({ personaId: personas[i].id, reaction });
        setRound2([...r2Results]);
      }
      setProgress({ current: 11, total: 11, label: 'Synthesising…' });
      const syn = await callSynthesize(r1Results, r2Results).catch(() => 'Synthesis unavailable.');
      setSynthesis(syn);
      setBoardPhase('complete');
    }
  };

  // ── CONTINUE ─────────────────────────────────────────────
  const handleContinue = async () => {
    if (!continueInput.trim() || continueLoading) return;
    const question = continueInput.trim();
    setContinueInput(''); setContinueLoading(true); setBoardPhase('continuing');
    const newMessages = [...continueMessages, { role: 'user', text: question }];
    setContinueMessages(newMessages);
    try {
      const res = await fetch('/api/board/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, personas: personas.map(p => ({ id: p.id, title: p.title, realPerson: p.realPerson, subtitle: p.subtitle, tagline: p.tagline, role: p.role })), round1, round2, synthesis, history: continueMessages, question }),
      });
      const data = await res.json();
      const boardResponse = data.responses || [];
      setContinueMessages([...newMessages, ...boardResponse.map(r => ({ role: 'board', personaId: r.personaId, text: r.reply }))]);
    } catch { setContinueMessages(prev => [...prev, { role: 'error', text: 'The board could not respond.' }]); }
    setContinueLoading(false); setBoardPhase('complete');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleReset = () => {
    setBoardPhase('input'); setProblem('');
    setRound1([]); setRound2([]); setSynthesis(''); setContinueMessages([]);
    setPersonas(makePersonas(BASE_ARCHETYPES));
  };

  const isRunning = boardPhase === 'running';
  const showRound1 = round1.length > 0;
  const showRound2 = round2.length > 0;
  const showSynthesis = synthesis !== '';

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: '#f7f6f3', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>

        {/* ── INPUT SECTION ─────────────────────────────── */}
        {(boardPhase === 'input' || boardPhase === 'casting') && (
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontFamily: "'Fraunces', serif", color: '#b87333', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>The challenge</div>
            <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', border: '1px solid rgba(26,43,74,0.08)', boxShadow: '0 4px 20px rgba(26,43,74,0.06)' }}>
              <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={5} disabled={boardPhase === 'casting'}
                placeholder="Describe the leadership challenge you want the Board to examine. Be specific — the richer the context, the sharper the session."
                style={{ width: '100%', padding: '1rem', fontSize: '0.95rem', lineHeight: 1.7, color: '#1a2b4a', background: '#f7f6f3', border: '1.5px solid rgba(26,43,74,0.12)', borderRadius: 10, resize: 'vertical', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#b87333'; }} onBlur={e => { e.target.style.borderColor = 'rgba(26,43,74,0.12)'; }}
              />
              {boardPhase === 'input' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {/* Invite coach to reformulate */}
                  <button onClick={handleReformulate} disabled={!problem.trim() || isReformulating}
                    style={{ background: 'none', border: '1px solid rgba(184,115,51,0.4)', borderRadius: 8, color: '#b87333', fontSize: '0.8rem', cursor: problem.trim() && !isReformulating ? 'pointer' : 'not-allowed', padding: '0.55rem 1rem', fontFamily: "'DM Sans', sans-serif", opacity: problem.trim() && !isReformulating ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {isReformulating ? '✦ Reformulating...' : '✦ I invite the AI-coach to formulate my question'}
                  </button>
                  {/* Activate board */}
                  <button onClick={() => setBoardPhase('casting')} disabled={problem.trim().length <= 20}
                    style={{ backgroundColor: problem.trim().length > 20 ? '#1a2b4a' : '#c8d0d8', color: '#fff', border: 'none', borderRadius: 8, padding: '0.65rem 1.75rem', fontSize: '0.9rem', fontWeight: 600, cursor: problem.trim().length > 20 ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif" }}>
                    Activate your Board →
                  </button>
                </div>
              )}
              {boardPhase === 'casting' && (
                <button onClick={() => setBoardPhase('input')} style={{ background: 'none', border: 'none', color: '#b87333', fontSize: '0.8rem', cursor: 'pointer', padding: '0.4rem 0 0', fontFamily: "'DM Sans', sans-serif", textDecoration: 'underline', marginTop: '0.5rem' }}>Edit challenge</button>
              )}
            </div>
          </section>
        )}

        {/* ── CASTING / PERSONA SELECTION ───────────────── */}
        {boardPhase === 'casting' && (
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontFamily: "'Fraunces', serif", color: '#b87333', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Your board</div>
              {lastBoard && (
                <button onClick={() => setPersonas(lastBoard.map(p => ({ ...p, swapping: false, swapInput: '' })))} style={{ background: 'none', border: '1px solid rgba(26,43,74,0.2)', borderRadius: 6, color: '#6b7b8d', fontSize: '0.75rem', cursor: 'pointer', padding: '0.3rem 0.75rem', fontFamily: "'DM Sans', sans-serif" }}>↩ Use last board</button>
              )}
            </div>
            <p style={{ color: '#6b7b8d', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: 680 }}>Five archetypal advisors have been assembled. You can replace any with a real person — they will speak in that person's documented style and worldview.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {personas.map((p, i) => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(26,43,74,0.08)', boxShadow: '0 2px 10px rgba(26,43,74,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#fff', marginBottom: '0.75rem', flexShrink: 0 }}>{p.avatar}</div>
                  <div style={{ fontFamily: "'Fraunces', serif", color: '#1a2b4a', fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.2rem' }}>{p.realPerson || p.title}</div>
                  {!p.realPerson && <div style={{ color: '#b87333', fontSize: '0.67rem', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>{p.subtitle}</div>}
                  <div style={{ color: '#1a2b4a', fontSize: '0.77rem', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '0.5rem' }}>"{p.tagline}"</div>
                  <div style={{ color: '#6b7b8d', fontSize: '0.72rem', lineHeight: 1.5, marginBottom: '0.75rem', flexGrow: 1 }}>{p.role}</div>
                  {p.swapping ? (
                    <div>
                      <input value={p.swapInput} onChange={e => updatePersona(i, { swapInput: e.target.value })} onKeyDown={e => e.key === 'Enter' && p.swapInput.trim() && updatePersona(i, { realPerson: p.swapInput.trim(), swapping: false })} placeholder="e.g. Elon Musk, Brené Brown…" autoFocus
                        style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.8rem', color: '#1a2b4a', background: '#f7f6f3', border: '1.5px solid #b87333', borderRadius: 6, outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', marginBottom: '0.3rem' }}
                      />
                      <div style={{ color: '#9ba8b5', fontSize: '0.63rem', lineHeight: 1.4, fontStyle: 'italic', marginBottom: '0.4rem' }}>AI simulation — does not represent this person's actual views.</div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => p.swapInput.trim() && updatePersona(i, { realPerson: p.swapInput.trim(), swapping: false })} style={{ background: '#1a2b4a', color: '#fff', border: 'none', borderRadius: 5, padding: '0.3rem 0.75rem', fontSize: '0.73rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Confirm</button>
                        <button onClick={() => updatePersona(i, { swapping: false, swapInput: '' })} style={{ background: 'none', color: '#6b7b8d', border: '1px solid rgba(26,43,74,0.15)', borderRadius: 5, padding: '0.3rem 0.75rem', fontSize: '0.73rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {p.realPerson ? (
                        <>
                          <span style={{ background: 'rgba(184,115,51,0.1)', color: '#b87333', fontSize: '0.62rem', borderRadius: 4, padding: '0.1rem 0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Real person</span>
                          <button onClick={() => updatePersona(i, { swapping: true, swapInput: p.realPerson })} style={{ background: 'none', border: 'none', color: '#b87333', fontSize: '0.72rem', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontFamily: "'DM Sans', sans-serif" }}>Change</button>
                          <button onClick={() => updatePersona(i, { realPerson: null })} style={{ background: 'none', border: 'none', color: '#b87333', fontSize: '0.72rem', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontFamily: "'DM Sans', sans-serif" }}>Reset</button>
                        </>
                      ) : (
                        <button onClick={() => updatePersona(i, { swapping: true })} style={{ background: 'none', border: 'none', color: '#b87333', fontSize: '0.72rem', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontFamily: "'DM Sans', sans-serif" }}>Replace with real person</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mode selector */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontFamily: "'Fraunces', serif", color: '#b87333', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Session mode</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {[{ val: 'fast', icon: '⚡', title: 'Run Board', sub: 'Results appear all at once' }, { val: 'watch', icon: '◎', title: 'Watch it unfold', sub: 'Each advisor speaks in turn' }].map(opt => (
                  <button key={opt.val} onClick={() => setMode(opt.val)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: mode === opt.val ? '#1a2b4a' : '#fff', color: mode === opt.val ? '#f7f6f3' : '#1a2b4a', border: mode === opt.val ? 'none' : '1.5px solid rgba(26,43,74,0.15)', borderRadius: 10, padding: '0.9rem 1.5rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' }}>
                    <span style={{ fontSize: '1.3rem' }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.2 }}>{opt.title}</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: '0.15rem' }}>{opt.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={handleRunBoard} style={{ background: '#1a2b4a', color: '#f7f6f3', border: 'none', borderRadius: 10, padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em' }}>
                {mode === 'fast' ? '⚡ Run Board' : '◎ Watch it unfold'} →
              </button>
            </div>
          </section>
        )}

        {/* ── PROGRESS ──────────────────────────────────── */}
        {isRunning && (
          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', textAlign: 'center', marginBottom: '2rem', border: '1px solid rgba(26,43,74,0.08)' }}>
            <div style={{ color: '#1a2b4a', fontFamily: "'Fraunces', serif", fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>{progress.label}</div>
            <div style={{ height: 4, background: 'rgba(26,43,74,0.1)', borderRadius: 2, overflow: 'hidden', maxWidth: 400, margin: '0 auto' }}>
              <div style={{ height: '100%', background: '#b87333', borderRadius: 2, transition: 'width 0.4s ease', width: `${Math.round((progress.current / progress.total) * 100)}%` }} />
            </div>
            <div style={{ color: '#9ba8b5', fontSize: '0.78rem', marginTop: '0.75rem' }}>{progress.current} / {progress.total}</div>
          </div>
        )}

        {/* ── ROUND 1 ───────────────────────────────────── */}
        {showRound1 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontFamily: "'Fraunces', serif", color: '#b87333', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Round 1 — Initial positions</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {round1.map(({ personaId, opinion }) => {
                const p = getPersona(personaId);
                return (
                  <div key={personaId} style={{ background: '#fff', padding: '1.25rem', border: '1px solid rgba(26,43,74,0.08)', borderTop: `3px solid ${p.color}`, borderRadius: 4, boxShadow: '0 2px 8px rgba(26,43,74,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ width: 26, height: 26, borderRadius: 5, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff', flexShrink: 0 }}>{p.avatar}</span>
                      <span style={{ fontFamily: "'Fraunces', serif", color: '#1a2b4a', fontSize: '0.8rem', fontWeight: 600, flex: 1, lineHeight: 1.2 }}>{p.realPerson || p.title}</span>
                    </div>
                    <p style={{ color: '#3a4a5a', fontSize: '0.83rem', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' }}>{opinion}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── ROUND 2 ───────────────────────────────────── */}
        {showRound2 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontFamily: "'Fraunces', serif", color: '#b87333', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Round 2 — The board reacts</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {round2.map(({ personaId, reaction }) => {
                const p = getPersona(personaId);
                return (
                  <div key={personaId} style={{ background: 'rgba(26,43,74,0.02)', padding: '1.25rem', border: '1px solid rgba(26,43,74,0.08)', borderTop: `3px solid ${p.color}`, borderRadius: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ width: 26, height: 26, borderRadius: 5, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff', flexShrink: 0 }}>{p.avatar}</span>
                      <span style={{ fontFamily: "'Fraunces', serif", color: '#1a2b4a', fontSize: '0.8rem', fontWeight: 600, flex: 1, lineHeight: 1.2 }}>{p.realPerson || p.title}</span>
                      <span style={{ background: 'rgba(184,115,51,0.1)', color: '#b87333', fontSize: '0.58rem', borderRadius: 3, padding: '0.1rem 0.35rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>reacting</span>
                    </div>
                    <p style={{ color: '#3a4a5a', fontSize: '0.83rem', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' }}>{reaction}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── SYNTHESIS ─────────────────────────────────── */}
        {showSynthesis && (
          <div style={{ background: '#1a2b4a', borderRadius: 16, padding: '2.5rem', marginBottom: '2rem' }}>
            <div style={{ fontFamily: "'Fraunces', serif", color: '#b87333', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Board Synthesis</div>
            <div style={{ fontSize: '0.95rem', lineHeight: 1.85, color: '#f7f6f3', whiteSpace: 'pre-line', marginBottom: '2rem' }}>{synthesis}</div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigator.clipboard?.writeText(`Board of Advisors — Ledge\n\nChallenge:\n${problem}\n\nSynthesis:\n${synthesis}`)}
                style={{ background: '#b87333', color: '#fff', border: 'none', borderRadius: 8, padding: '0.65rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Copy synthesis
              </button>
              <button onClick={handleReset} style={{ background: 'rgba(247,246,243,0.1)', color: '#f7f6f3', border: '1px solid rgba(247,246,243,0.2)', borderRadius: 8, padding: '0.65rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>New session</button>
            </div>
          </div>
        )}

        {/* ── CONTINUE CONVERSATION ─────────────────────── */}
        {(boardPhase === 'complete' || boardPhase === 'continuing') && showSynthesis && (
          <section style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(26,43,74,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", color: '#b87333', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Continue the conversation</div>
                <p style={{ color: '#6b7b8d', fontSize: '0.83rem', margin: 0, lineHeight: 1.5 }}>Ask the board a follow-up question. They will respond individually.</p>
              </div>
              <div style={{ background: 'rgba(184,115,51,0.1)', color: '#b87333', fontSize: '0.75rem', fontWeight: 600, borderRadius: 6, padding: '0.3rem 0.75rem', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>€0.99 / round</div>
            </div>

            {continueMessages.map((msg, i) => {
              if (msg.role === 'user') return (
                <div key={i} style={{ background: '#fff', border: '1px solid rgba(26,43,74,0.1)', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#b87333', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>You</span>
                  <p style={{ color: '#1a2b4a', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{msg.text}</p>
                </div>
              );
              if (msg.role === 'board') {
                const p = getPersona(msg.personaId);
                return (
                  <div key={i} style={{ background: '#fff', borderLeft: `3px solid ${p?.color || '#1a2b4a'}`, padding: '0.9rem 1rem', borderRadius: '0 8px 8px 0', marginBottom: '0.6rem', border: '1px solid rgba(26,43,74,0.06)' }}>
                    <div style={{ fontFamily: "'Fraunces', serif", color: '#1a2b4a', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>{p?.realPerson || p?.title || msg.personaId}</div>
                    <p style={{ color: '#3a4a5a', fontSize: '0.83rem', lineHeight: 1.7, margin: 0 }}>{msg.text}</p>
                  </div>
                );
              }
              return null;
            })}

            <div ref={bottomRef} />

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginTop: '1.25rem' }}>
              <textarea value={continueInput} onChange={e => setContinueInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleContinue())}
                placeholder="Ask the board a follow-up…" rows={3} disabled={continueLoading}
                style={{ flex: 1, padding: '0.85rem 1rem', fontSize: '0.9rem', lineHeight: 1.6, color: '#1a2b4a', background: '#fff', border: '1.5px solid rgba(26,43,74,0.15)', borderRadius: 8, resize: 'none', outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
              />
              <button onClick={handleContinue} disabled={continueLoading || !continueInput.trim()}
                style={{ background: continueLoading || !continueInput.trim() ? '#c8d0d8' : '#1a2b4a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', fontSize: '0.9rem', fontWeight: 600, cursor: continueLoading || !continueInput.trim() ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {continueLoading ? '…' : 'Ask →'}
              </button>
            </div>
            <div style={{ color: '#9ba8b5', fontSize: '0.68rem', marginTop: '0.5rem' }}>Each follow-up round is billed separately. ⌘+Enter to send.</div>
          </section>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE — tab container
// ============================================================
export default function CoachPage() {
  const [activeTab, setActiveTab] = useState('coach'); // 'coach' | 'board'

  // ── Coach state ───────────────────────────────────────────
  const [phase, setPhase] = useState('intent');
  const [intent, setIntent] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID());
  const [mode, setMode] = useState('clarify');
  const [modeLabel, setModeLabel] = useState('Clarify');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [leaderEmail, setLeaderEmail] = useState(null);
  const [profileInjection, setProfileInjection] = useState(null);

  // Profile saving
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);

  // Board-ready signal from Coach
  const [boardReadyData, setBoardReadyData] = useState(null); // { reason: string }
  const [boardPrefilledContext, setBoardPrefilledContext] = useState(null);

  // ── Load profile ──────────────────────────────────────────
  const handleStart = useCallback(async (intentText, emailInput) => {
    setIntent(intentText);
    let injection = null;
    if (emailInput) {
      try {
        const res = await fetch(`/api/coach/profile?email=${encodeURIComponent(emailInput)}`);
        const data = await res.json();
        if (data.profile) { setLeaderEmail(emailInput); injection = data.profileInjection || null; setProfileInjection(injection); if (data.profile.preferred_mode) setMode(data.profile.preferred_mode); }
      } catch { /* silent */ }
    }
    setIsLoading(true);
    const firstMessages = [{ role: 'user', content: intentText }];
    setMessages(firstMessages);
    setPhase('chat');
    try {
      const res = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: firstMessages, sessionId, profileInjection: injection }) });
      const data = await res.json();
      if (data.mode) setMode(data.mode);
      if (data.modeLabel) setModeLabel(data.modeLabel);
      if (data.board_ready && data.board_reason) setBoardReadyData({ reason: data.board_reason });
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Something went wrong.' }]);
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Connection issue. Please try again.' }]); }
    finally { setIsLoading(false); }
  }, [sessionId]);

  const handleSendMessage = useCallback(async (text) => {
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);
    try {
      const res = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: newMessages, sessionId, mode, profileInjection }) });
      const data = await res.json();
      if (data.mode && data.mode !== mode) { setMode(data.mode); setModeLabel(data.modeLabel || data.mode); }
      if (data.board_ready && data.board_reason && !boardReadyData) setBoardReadyData({ reason: data.board_reason });
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Something went wrong.' }]);
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Connection issue. Please try again.' }]); }
    finally { setIsLoading(false); }
  }, [messages, sessionId, mode, profileInjection, boardReadyData]);

  const handleSaveWithEmail = useCallback(async (email) => {
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/coach/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, messages, sessionId, mode }) });
      const data = await res.json();
      if (data.success) { setLeaderEmail(email); setIsNewProfile(data.isNewProfile); setProfileSaved(true); setShowEmailGate(false); }
    } catch { /* silent */ }
    finally { setIsSavingProfile(false); }
  }, [messages, sessionId, mode]);

  // Activate Board from Coach: build context summary + switch tab
  const handleActivateBoardFromCoach = useCallback(() => {
    const contextLines = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');
    const summary = `Context from coaching session:\n\n${contextLines}`;
    setBoardPrefilledContext(summary);
    setActiveTab('board');
    setBoardReadyData(null);
  }, [messages]);

  const handleReset = () => {
    setPhase('intent'); setIntent(''); setMessages([]);
    setMode('clarify'); setModeLabel('Clarify');
    setLeaderEmail(null); setProfileInjection(null);
    setProfileSaved(false); setShowEmailGate(false);
    setBoardReadyData(null);
  };

  // ── RENDER ────────────────────────────────────────────────

  // Intent capture has no tab bar — full screen
  if (phase === 'intent') {
    return <IntentCapture savedEmail={leaderEmail} onStart={handleStart} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f6f3', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── GLOBAL HEADER WITH TABS ─────────────────────── */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid rgba(26,43,74,0.08)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '56px' }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.15rem', fontWeight: '700', color: '#1a2b4a', letterSpacing: '-0.02em' }}>LEDGE</span>
          </a>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', border: '1px solid rgba(26,43,74,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
            <button onClick={() => setActiveTab('coach')}
              style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', fontWeight: activeTab === 'coach' ? 700 : 400, color: activeTab === 'coach' ? '#fff' : '#6b7b8d', backgroundColor: activeTab === 'coach' ? '#1a2b4a' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' }}>
              AI Coach
            </button>
            <button onClick={() => setActiveTab('board')}
              style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', fontWeight: activeTab === 'board' ? 700 : 400, color: activeTab === 'board' ? '#fff' : '#6b7b8d', backgroundColor: activeTab === 'board' ? '#b87333' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              Advisory Board
              {boardReadyData && (
                <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#b87333', border: '1.5px solid #fff', display: 'inline-block' }} />
              )}
            </button>
          </div>

          <div style={{ width: 80 }} />
        </div>
      </header>

      {/* ── TAB CONTENT ─────────────────────────────────── */}
      <div style={{ display: activeTab === 'coach' ? 'block' : 'none' }}>
        <CoachChatInterface
          initialIntent={intent} sessionId={sessionId}
          mode={mode} modeLabel={modeLabel}
          messages={messages} onSendMessage={handleSendMessage}
          isLoading={isLoading} onReset={handleReset}
          leaderEmail={leaderEmail}
          onRequestSaveProfile={() => setShowEmailGate(true)}
          profileSaved={profileSaved} isNewProfile={isNewProfile}
          onDismissProfileBanner={() => setProfileSaved(false)}
          showEmailGate={showEmailGate}
          onSaveWithEmail={handleSaveWithEmail}
          onDismissEmailGate={() => setShowEmailGate(false)}
          isSavingProfile={isSavingProfile}
          boardReadyData={boardReadyData}
          onActivateBoard={handleActivateBoardFromCoach}
          onDismissBoardBanner={() => setBoardReadyData(null)}
        />
      </div>

      <div style={{ display: activeTab === 'board' ? 'block' : 'none' }}>
        <AdvisoryBoardTab
          prefilledContext={boardPrefilledContext}
          onClearPrefill={() => setBoardPrefilledContext(null)}
        />
      </div>

    </div>
  );
}
