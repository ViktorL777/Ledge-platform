'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// ============================================================
// LEDGE AI COACH — page.js v2
// Single entry point: intent capture → auto-routing
// Mode shown discreetly in header, never chosen explicitly
// STOIC PULSE invisible — eight lenses, never named
// ============================================================

const MODE_META = {
  clarify: {
    label: 'Clarify',
    hint: 'Finding the real question',
    color: '#1a2b4a',
  },
  analyze: {
    label: 'Analyze',
    hint: 'Mapping the full picture',
    color: '#1a2b4a',
  },
  change_readiness: {
    label: 'Change Readiness',
    hint: 'Assessing when to act',
    color: '#1a2b4a',
  },
};

// ============================================================
// INTENT CAPTURE SCREEN (replaces mode picker)
// ============================================================
function IntentCapture({ onStart }) {
  const [intent, setIntent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = intent.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    onStart(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f7f6f3',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Fraunces', serif",
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1a2b4a',
            letterSpacing: '-0.02em',
          }}>
            LEDGE
          </span>
          <span style={{
            display: 'block',
            fontSize: '0.7rem',
            color: '#b87333',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginTop: '2px',
          }}>
            AI Coach
          </span>
        </a>
      </div>

      {/* Main card */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(26,43,74,0.08)',
        border: '1px solid rgba(26,43,74,0.06)',
      }}>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '1.7rem',
          fontWeight: '600',
          color: '#1a2b4a',
          marginBottom: '0.75rem',
          lineHeight: '1.3',
          letterSpacing: '-0.02em',
        }}>
          By the end of this conversation, what do you want to have — that you don't have right now?
        </h1>

        <p style={{
          fontSize: '0.9rem',
          color: '#6b7b8d',
          marginBottom: '2rem',
          lineHeight: '1.6',
        }}>
          A clarity you're missing. A decision you can't make yet. A map of something complex. Name it.
        </p>

        <textarea
          ref={textareaRef}
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. I want to understand why I keep avoiding this conversation with my board..."
          rows={4}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            color: '#1a2b4a',
            backgroundColor: '#f7f6f3',
            border: '1.5px solid rgba(26,43,74,0.12)',
            borderRadius: '10px',
            resize: 'vertical',
            outline: 'none',
            fontFamily: "'DM Sans', sans-serif",
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#b87333'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(26,43,74,0.12)'; }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#9ba8b5' }}>⌘ + Enter to begin</span>
          <button
            onClick={handleSubmit}
            disabled={!intent.trim() || isSubmitting}
            style={{
              backgroundColor: intent.trim() ? '#1a2b4a' : '#c8d0d8',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.75rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: intent.trim() ? 'pointer' : 'not-allowed',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background-color 0.2s',
              letterSpacing: '0.01em',
            }}
          >
            {isSubmitting ? 'Starting...' : 'Begin session'}
          </button>
        </div>
      </div>

      <p style={{
        marginTop: '2rem',
        fontSize: '0.75rem',
        color: '#9ba8b5',
        textAlign: 'center',
        maxWidth: '400px',
        lineHeight: '1.5',
      }}>
        Your conversation is private and not stored to a profile by default. No login required.
      </p>
    </div>
  );
}

// ============================================================
// CHAT INTERFACE
// ============================================================
function ChatInterface({ initialIntent, sessionId, mode, modeLabel, messages, onSendMessage, isLoading, onReset }) {
  const [input, setInput] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loadInsights = async () => {
    if (loadingInsights || insights) {
      setShowInsights(!showInsights);
      return;
    }
    setLoadingInsights(true);
    setShowInsights(true);
    try {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: lastUserMsg?.content || initialIntent,
          mode,
        }),
      });
      const data = await res.json();
      setInsights(data.articles || []);
    } catch {
      setInsights([]);
    } finally {
      setLoadingInsights(false);
    }
  };

  const modeMeta = MODE_META[mode] || MODE_META.clarify;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f7f6f3',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid rgba(26,43,74,0.08)',
        padding: '0.875rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '1.15rem',
              fontWeight: '700',
              color: '#1a2b4a',
              letterSpacing: '-0.02em',
            }}>LEDGE</span>
          </a>
          {/* Mode badge — discreet */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(184,115,51,0.08)',
            border: '1px solid rgba(184,115,51,0.2)',
            borderRadius: '20px',
            padding: '0.2rem 0.7rem',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#b87333', display: 'block' }} />
            <span style={{ fontSize: '0.72rem', color: '#b87333', fontWeight: '600', letterSpacing: '0.05em' }}>
              {modeLabel}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#9ba8b5' }}>— {modeMeta.hint}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Related Insights — lazy load on click */}
          <button
            onClick={loadInsights}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(26,43,74,0.15)',
              borderRadius: '6px',
              padding: '0.4rem 0.8rem',
              fontSize: '0.75rem',
              color: '#6b7b8d',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>📎</span>
            <span>Related insights</span>
          </button>

          <button
            onClick={onReset}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9ba8b5',
              cursor: 'pointer',
              fontSize: '0.8rem',
              padding: '0.4rem 0.6rem',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            New session
          </button>
        </div>
      </header>

      {/* Related Insights panel */}
      {showInsights && (
        <div style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(26,43,74,0.08)',
          padding: '1rem 1.5rem',
        }}>
          <h3 style={{ fontSize: '0.8rem', color: '#6b7b8d', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Related Insights from Ledge
          </h3>
          {loadingInsights ? (
            <p style={{ fontSize: '0.85rem', color: '#9ba8b5' }}>Loading...</p>
          ) : insights && insights.length > 0 ? (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {insights.map((article, i) => (
                <a
                  key={i}
                  href={article.url || article.original_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    backgroundColor: '#f7f6f3',
                    border: '1px solid rgba(26,43,74,0.08)',
                    borderRadius: '8px',
                    padding: '0.7rem 1rem',
                    maxWidth: '280px',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <p style={{ fontSize: '0.78rem', color: '#b87333', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {article.primary_dimension || article.dimension || 'Leadership'}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#1a2b4a', lineHeight: '1.4', fontWeight: '500' }}>
                    {article.title}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#9ba8b5' }}>No related articles found for this conversation.</p>
          )}
        </div>
      )}

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem 1.5rem',
        maxWidth: '720px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        {/* Intent context — always visible at top */}
        <div style={{
          backgroundColor: 'rgba(26,43,74,0.04)',
          border: '1px solid rgba(26,43,74,0.08)',
          borderRadius: '10px',
          padding: '0.875rem 1.25rem',
          marginBottom: '2rem',
        }}>
          <p style={{ fontSize: '0.72rem', color: '#9ba8b5', marginBottom: '0.3rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Session goal
          </p>
          <p style={{ fontSize: '0.88rem', color: '#1a2b4a', lineHeight: '1.5', fontStyle: 'italic' }}>
            "{initialIntent}"
          </p>
        </div>

        {/* Messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: msg.role === 'user' ? '#1a2b4a' : '#b87333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '0.7rem',
              fontWeight: '700',
              color: '#fff',
              letterSpacing: '0.05em',
            }}>
              {msg.role === 'user' ? 'YOU' : 'LC'}
            </div>

            {/* Bubble */}
            <div style={{
              backgroundColor: msg.role === 'user' ? '#1a2b4a' : '#fff',
              color: msg.role === 'user' ? '#f7f6f3' : '#1a2b4a',
              borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              padding: '0.875rem 1.125rem',
              maxWidth: '85%',
              fontSize: '0.92rem',
              lineHeight: '1.65',
              boxShadow: msg.role === 'assistant' ? '0 1px 8px rgba(26,43,74,0.06)' : 'none',
              border: msg.role === 'assistant' ? '1px solid rgba(26,43,74,0.06)' : 'none',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: '#b87333', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: '700', color: '#fff',
            }}>LC</div>
            <div style={{
              backgroundColor: '#fff',
              border: '1px solid rgba(26,43,74,0.06)',
              borderRadius: '4px 16px 16px 16px',
              padding: '0.875rem 1.25rem',
              boxShadow: '0 1px 8px rgba(26,43,74,0.06)',
            }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    backgroundColor: '#b87333', opacity: 0.6,
                    animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        backgroundColor: '#fff',
        borderTop: '1px solid rgba(26,43,74,0.08)',
        padding: '1rem 1.5rem',
        position: 'sticky',
        bottom: 0,
      }}>
        <div style={{
          maxWidth: '720px',
          margin: '0 auto',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-end',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your response..."
            rows={1}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              fontSize: '0.92rem',
              lineHeight: '1.5',
              color: '#1a2b4a',
              backgroundColor: '#f7f6f3',
              border: '1.5px solid rgba(26,43,74,0.12)',
              borderRadius: '10px',
              resize: 'none',
              outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'border-color 0.2s',
              minHeight: '44px',
              maxHeight: '160px',
              overflow: 'auto',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#b87333'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(26,43,74,0.12)'; }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              backgroundColor: input.trim() && !isLoading ? '#1a2b4a' : '#c8d0d8',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              width: '44px',
              height: '44px',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background-color 0.2s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p style={{ maxWidth: '720px', margin: '0.5rem auto 0', fontSize: '0.7rem', color: '#9ba8b5', textAlign: 'center' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function CoachPage() {
  const [phase, setPhase] = useState('intent'); // 'intent' | 'chat'
  const [intent, setIntent] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
  const [mode, setMode] = useState('clarify');
  const [modeLabel, setModeLabel] = useState('Clarify');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = useCallback(async (intentText) => {
    setIntent(intentText);

    // Send first message to get mode detection + opening response from coach
    setIsLoading(true);

    const firstMessages = [{
      role: 'user',
      content: intentText,
    }];

    setMessages(firstMessages);
    setPhase('chat');

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: firstMessages,
          sessionId,
        }),
      });

      const data = await res.json();

      if (data.mode) setMode(data.mode);
      if (data.modeLabel) setModeLabel(data.modeLabel);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || 'Something went wrong. Please try again.',
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try again in a moment.',
      }]);
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
        body: JSON.stringify({
          messages: newMessages,
          sessionId,
          mode,
        }),
      });

      const data = await res.json();

      // Update mode if it shifted
      if (data.mode && data.mode !== mode) {
        setMode(data.mode);
        setModeLabel(data.modeLabel || data.mode);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || 'Something went wrong. Please try again.',
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, sessionId, mode]);

  const handleReset = useCallback(() => {
    setPhase('intent');
    setIntent('');
    setMessages([]);
    setMode('clarify');
    setModeLabel('Clarify');
  }, []);

  if (phase === 'intent') {
    return <IntentCapture onStart={handleStart} />;
  }

  return (
    <ChatInterface
      initialIntent={intent}
      sessionId={sessionId}
      mode={mode}
      modeLabel={modeLabel}
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      onReset={handleReset}
    />
  );
}
