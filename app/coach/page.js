'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// ============================================================
// LEDGE AI COACH — page.js v3
// + Email-gate modal (session end → save profile)
// + Profile indicator (returning leaders)
// + Settings link
// ============================================================

const MODE_META = {
  clarify: { label: 'Clarify', hint: 'Finding the real question' },
  analyze: { label: 'Analyze', hint: 'Mapping the full picture' },
  change_readiness: { label: 'Change Readiness', hint: 'Assessing when to act' },
};

// ============================================================
// EMAIL GATE MODAL
// Appears when user clicks "Save my profile" after session
// ============================================================
function EmailGateModal({ onSave, onDismiss, isSaving }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    onSave(trimmed);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(26,43,74,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '16px',
        padding: '2.5rem', maxWidth: '460px', width: '100%',
        boxShadow: '0 20px 60px rgba(26,43,74,0.2)',
      }}>
        <h2 style={{
          fontFamily: "'Fraunces', serif", fontSize: '1.4rem',
          fontWeight: '600', color: '#1a2b4a', marginBottom: '0.75rem',
          letterSpacing: '-0.02em', lineHeight: '1.3',
        }}>
          Save your coaching profile
        </h2>
        <p style={{
          fontSize: '0.88rem', color: '#6b7b8d', lineHeight: '1.65',
          marginBottom: '1.75rem',
        }}>
          The Coach will remember your patterns, challenges, and commitments across sessions — so the next conversation starts exactly where this one left off.
        </p>

        <input
          ref={inputRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="your@email.com"
          style={{
            width: '100%', padding: '0.85rem 1rem',
            fontSize: '0.95rem', color: '#1a2b4a',
            backgroundColor: '#f7f6f3',
            border: error ? '1.5px solid #e05a5a' : '1.5px solid rgba(26,43,74,0.12)',
            borderRadius: '10px', outline: 'none',
            fontFamily: "'DM Sans', sans-serif",
            boxSizing: 'border-box', marginBottom: '0.5rem',
          }}
          onFocus={(e) => { if (!error) e.target.style.borderColor = '#b87333'; }}
          onBlur={(e) => { if (!error) e.target.style.borderColor = 'rgba(26,43,74,0.12)'; }}
        />
        {error && (
          <p style={{ fontSize: '0.78rem', color: '#e05a5a', marginBottom: '0.5rem' }}>{error}</p>
        )}

        <p style={{ fontSize: '0.72rem', color: '#9ba8b5', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Your data is encrypted and never sold. You can delete everything from Settings at any time.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            style={{
              flex: 1, backgroundColor: '#1a2b4a', color: '#fff',
              border: 'none', borderRadius: '8px',
              padding: '0.75rem 1rem', fontSize: '0.9rem',
              fontWeight: '600', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isSaving ? 'Saving...' : 'Save profile'}
          </button>
          <button
            onClick={onDismiss}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(26,43,74,0.15)',
              borderRadius: '8px', padding: '0.75rem 1rem',
              fontSize: '0.9rem', color: '#6b7b8d',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROFILE SAVED CONFIRMATION
// ============================================================
function ProfileSavedBanner({ isNew, onDismiss }) {
  return (
    <div style={{
      backgroundColor: 'rgba(184,115,51,0.08)',
      border: '1px solid rgba(184,115,51,0.25)',
      borderRadius: '10px', padding: '0.875rem 1.25rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '1rem',
    }}>
      <div>
        <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#b87333', marginBottom: '0.2rem' }}>
          {isNew ? 'Profile created' : 'Profile updated'}
        </p>
        <p style={{ fontSize: '0.78rem', color: '#6b7b8d' }}>
          {isNew
            ? 'The Coach will remember your patterns in future sessions.'
            : 'Your coaching profile has been updated with insights from this session.'}
        </p>
      </div>
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#9ba8b5', fontSize: '1.1rem', padding: '0 0.25rem',
      }}>×</button>
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
    <div style={{
      minHeight: '100vh', backgroundColor: '#f7f6f3',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: '700', color: '#1a2b4a', letterSpacing: '-0.02em' }}>LEDGE</span>
          <span style={{ display: 'block', fontSize: '0.7rem', color: '#b87333', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '2px' }}>AI Coach</span>
        </a>
      </div>

      <div style={{
        backgroundColor: '#fff', borderRadius: '16px', padding: '3rem',
        maxWidth: '600px', width: '100%',
        boxShadow: '0 4px 24px rgba(26,43,74,0.08)',
        border: '1px solid rgba(26,43,74,0.06)',
      }}>
        <h1 style={{
          fontFamily: "'Fraunces', serif", fontSize: '1.7rem',
          fontWeight: '600', color: '#1a2b4a', marginBottom: '0.75rem',
          lineHeight: '1.3', letterSpacing: '-0.02em',
        }}>
          By the end of this conversation, what do you want to have — that you don't have right now?
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#6b7b8d', marginBottom: '2rem', lineHeight: '1.6' }}>
          A clarity you're missing. A decision you can't make yet. A map of something complex. Name it.
        </p>

        <textarea
          ref={textareaRef}
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
          placeholder="e.g. I want to understand why I keep avoiding this conversation with my board..."
          rows={4}
          style={{
            width: '100%', padding: '1rem', fontSize: '0.95rem',
            lineHeight: '1.6', color: '#1a2b4a', backgroundColor: '#f7f6f3',
            border: '1.5px solid rgba(26,43,74,0.12)', borderRadius: '10px',
            resize: 'vertical', outline: 'none',
            fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#b87333'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(26,43,74,0.12)'; }}
        />

        {/* Returning leader email field */}
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ba8b5', marginBottom: '0.4rem' }}>
            Returning? Enter your email to load your coaching profile.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com (optional)"
            style={{
              width: '100%', padding: '0.65rem 0.9rem',
              fontSize: '0.85rem', color: '#1a2b4a',
              backgroundColor: '#f7f6f3',
              border: '1.5px solid rgba(26,43,74,0.10)',
              borderRadius: '8px', outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#b87333'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(26,43,74,0.10)'; }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#9ba8b5' }}>⌘ + Enter to begin</span>
          <button
            onClick={handleSubmit}
            disabled={!intent.trim() || isSubmitting}
            style={{
              backgroundColor: intent.trim() ? '#1a2b4a' : '#c8d0d8',
              color: '#fff', border: 'none', borderRadius: '8px',
              padding: '0.75rem 1.75rem', fontSize: '0.9rem', fontWeight: '600',
              cursor: intent.trim() ? 'pointer' : 'not-allowed',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isSubmitting ? 'Starting...' : 'Begin session'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem' }}>
        <a href="/settings/coach" style={{ fontSize: '0.75rem', color: '#9ba8b5', textDecoration: 'none' }}>
          Settings & Privacy
        </a>
      </div>
    </div>
  );
}

// ============================================================
// CHAT INTERFACE
// ============================================================
function ChatInterface({
  initialIntent, sessionId, mode, modeLabel, messages,
  onSendMessage, isLoading, onReset, leaderEmail,
  onRequestSaveProfile, profileSaved, isNewProfile,
  onDismissProfileBanner, showEmailGate, onSaveWithEmail,
  onDismissEmailGate, isSavingProfile,
}) {
  const [input, setInput] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: lastUserMsg?.content || initialIntent, mode }),
      });
      const data = await res.json();
      setInsights(data.articles || []);
    } catch { setInsights([]); }
    finally { setLoadingInsights(false); }
  };

  const modeMeta = MODE_META[mode] || MODE_META.clarify;
  const sessionLongEnough = messages.length >= 4;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f6f3', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>

      {showEmailGate && (
        <EmailGateModal onSave={onSaveWithEmail} onDismiss={onDismissEmailGate} isSaving={isSavingProfile} />
      )}

      {/* Header */}
      <header style={{
        backgroundColor: '#fff', borderBottom: '1px solid rgba(26,43,74,0.08)',
        padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '1.15rem', fontWeight: '700', color: '#1a2b4a', letterSpacing: '-0.02em' }}>LEDGE</span>
          </a>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            backgroundColor: 'rgba(184,115,51,0.08)',
            border: '1px solid rgba(184,115,51,0.2)',
            borderRadius: '20px', padding: '0.2rem 0.7rem',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#b87333', display: 'block' }} />
            <span style={{ fontSize: '0.72rem', color: '#b87333', fontWeight: '600', letterSpacing: '0.05em' }}>{modeLabel}</span>
            <span style={{ fontSize: '0.68rem', color: '#9ba8b5' }}>— {modeMeta.hint}</span>
          </div>
          {leaderEmail && (
            <span style={{ fontSize: '0.72rem', color: '#9ba8b5' }}>↩ Profile loaded</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={loadInsights} style={{
            backgroundColor: 'transparent', border: '1px solid rgba(26,43,74,0.15)',
            borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.75rem',
            color: '#6b7b8d', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            <span>📎</span><span>Related insights</span>
          </button>

          {/* Save profile button — appears after enough messages */}
          {sessionLongEnough && !leaderEmail && !profileSaved && (
            <button
              onClick={onRequestSaveProfile}
              style={{
                backgroundColor: 'rgba(184,115,51,0.1)',
                border: '1px solid rgba(184,115,51,0.3)',
                borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.75rem',
                color: '#b87333', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: '600',
              }}
            >
              Save profile
            </button>
          )}

          <button onClick={onReset} style={{
            backgroundColor: 'transparent', border: 'none',
            color: '#9ba8b5', cursor: 'pointer', fontSize: '0.8rem',
            padding: '0.4rem 0.6rem', fontFamily: "'DM Sans', sans-serif",
          }}>
            New session
          </button>
        </div>
      </header>

      {/* Insights panel */}
      {showInsights && (
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid rgba(26,43,74,0.08)', padding: '1rem 1.5rem' }}>
          <h3 style={{ fontSize: '0.8rem', color: '#6b7b8d', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Related Insights from Ledge
          </h3>
          {loadingInsights ? (
            <p style={{ fontSize: '0.85rem', color: '#9ba8b5' }}>Loading...</p>
          ) : insights?.length > 0 ? (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {insights.map((a, i) => (
                <a key={i} href={a.url || a.original_url || '#'} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', backgroundColor: '#f7f6f3', border: '1px solid rgba(26,43,74,0.08)', borderRadius: '8px', padding: '0.7rem 1rem', maxWidth: '280px', textDecoration: 'none' }}>
                  <p style={{ fontSize: '0.78rem', color: '#b87333', fontWeight: '600', marginBottom: '0.25rem' }}>{a.primary_dimension || 'Leadership'}</p>
                  <p style={{ fontSize: '0.85rem', color: '#1a2b4a', lineHeight: '1.4', fontWeight: '500' }}>{a.title}</p>
                </a>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#9ba8b5' }}>No related articles found.</p>
          )}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 1.5rem', maxWidth: '720px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

        {profileSaved && (
          <ProfileSavedBanner isNew={isNewProfile} onDismiss={onDismissProfileBanner} />
        )}

        {/* Session goal */}
        <div style={{ backgroundColor: 'rgba(26,43,74,0.04)', border: '1px solid rgba(26,43,74,0.08)', borderRadius: '10px', padding: '0.875rem 1.25rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.72rem', color: '#9ba8b5', marginBottom: '0.3rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Session goal</p>
          <p style={{ fontSize: '0.88rem', color: '#1a2b4a', lineHeight: '1.5', fontStyle: 'italic' }}>"{initialIntent}"</p>
        </div>

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: msg.role === 'user' ? '#1a2b4a' : '#b87333',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontSize: '0.7rem', fontWeight: '700', color: '#fff',
            }}>
              {msg.role === 'user' ? 'YOU' : 'LC'}
            </div>
            <div style={{
              backgroundColor: msg.role === 'user' ? '#1a2b4a' : '#fff',
              color: msg.role === 'user' ? '#f7f6f3' : '#1a2b4a',
              borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              padding: '0.875rem 1.125rem', maxWidth: '85%',
              fontSize: '0.92rem', lineHeight: '1.65',
              boxShadow: msg.role === 'assistant' ? '0 1px 8px rgba(26,43,74,0.06)' : 'none',
              border: msg.role === 'assistant' ? '1px solid rgba(26,43,74,0.06)' : 'none',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#b87333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', color: '#fff' }}>LC</div>
            <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,43,74,0.06)', borderRadius: '4px 16px 16px 16px', padding: '0.875rem 1.25rem', boxShadow: '0 1px 8px rgba(26,43,74,0.06)' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#b87333', opacity: 0.6, animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ backgroundColor: '#fff', borderTop: '1px solid rgba(26,43,74,0.08)', padding: '1rem 1.5rem', position: 'sticky', bottom: 0 }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Your response..."
            rows={1}
            style={{
              flex: 1, padding: '0.75rem 1rem', fontSize: '0.92rem',
              lineHeight: '1.5', color: '#1a2b4a', backgroundColor: '#f7f6f3',
              border: '1.5px solid rgba(26,43,74,0.12)', borderRadius: '10px',
              resize: 'none', outline: 'none', fontFamily: "'DM Sans', sans-serif",
              minHeight: '44px', maxHeight: '160px', overflow: 'auto',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#b87333'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(26,43,74,0.12)'; }}
            onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'; }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              backgroundColor: input.trim() && !isLoading ? '#1a2b4a' : '#c8d0d8',
              color: '#fff', border: 'none', borderRadius: '10px',
              width: '44px', height: '44px', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
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
// MAIN PAGE
// ============================================================
export default function CoachPage() {
  const [phase, setPhase] = useState('intent');
  const [intent, setIntent] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID());
  const [mode, setMode] = useState('clarify');
  const [modeLabel, setModeLabel] = useState('Clarify');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [leaderEmail, setLeaderEmail] = useState(null);
  const [profileInjection, setProfileInjection] = useState(null);

  // Profile saving state
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);

  // Load profile if email provided at start
  const loadProfile = useCallback(async (email) => {
    try {
      const res = await fetch(`/api/coach/profile?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.profile) {
        setLeaderEmail(email);
        setProfileInjection(data.profileInjection || null);
        if (data.profile.preferred_mode) setMode(data.profile.preferred_mode);
      }
    } catch {
      // Silent fail — anonymous session continues
    }
  }, []);

  const handleStart = useCallback(async (intentText, emailInput) => {
    setIntent(intentText);

    let injection = null;
    if (emailInput) {
      try {
        const res = await fetch(`/api/coach/profile?email=${encodeURIComponent(emailInput)}`);
        const data = await res.json();
        if (data.profile) {
          setLeaderEmail(emailInput);
          injection = data.profileInjection || null;
          setProfileInjection(injection);
          if (data.profile.preferred_mode) setMode(data.profile.preferred_mode);
        }
      } catch { /* silent */ }
    }

    setIsLoading(true);
    const firstMessages = [{ role: 'user', content: intentText }];
    setMessages(firstMessages);
    setPhase('chat');

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: firstMessages,
          sessionId,
          profileInjection: injection,
        }),
      });
      const data = await res.json();
      if (data.mode) setMode(data.mode);
      if (data.modeLabel) setModeLabel(data.modeLabel);
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Something went wrong.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection issue. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const handleSendMessage = useCallback(async (text) => {
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, sessionId, mode, profileInjection }),
      });
      const data = await res.json();
      if (data.mode && data.mode !== mode) { setMode(data.mode); setModeLabel(data.modeLabel || data.mode); }
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Something went wrong.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection issue. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, sessionId, mode, profileInjection]);

  const handleSaveWithEmail = useCallback(async (email) => {
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/coach/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, messages, sessionId, mode }),
      });
      const data = await res.json();
      if (data.success) {
        setLeaderEmail(email);
        setIsNewProfile(data.isNewProfile);
        setProfileSaved(true);
        setShowEmailGate(false);
      }
    } catch { /* silent */ }
    finally { setIsSavingProfile(false); }
  }, [messages, sessionId, mode]);

  const handleReset = () => {
    setPhase('intent'); setIntent(''); setMessages([]);
    setMode('clarify'); setModeLabel('Clarify');
    setLeaderEmail(null); setProfileInjection(null);
    setProfileSaved(false); setShowEmailGate(false);
  };

  if (phase === 'intent') {
    return <IntentCapture savedEmail={leaderEmail} onStart={handleStart} />;
  }

  return (
    <ChatInterface
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
    />
  );
}
