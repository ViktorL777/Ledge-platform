'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// ============================================================
// LEDGE AI COACH
// Three independent modes, each with a clear job to do
// STOIC PULSE invisible — eight lenses, never named
// ============================================================

const MODES = [
  {
    id: 'clarify',
    name: 'Clarify',
    tagline: 'Something feels off',
    description: "You can sense it but can't name it yet. This mode asks the right questions until what's really happening becomes impossible to ignore.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="16" y1="4" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="16" y1="24" x2="16" y2="28" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="4" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="24" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    opening: "Something's on your mind. Let's find out what it really is.\n\nWhat's been nagging at you lately — even if you can't quite articulate it yet?",
  },
  {
    id: 'analyze',
    name: 'Analyze',
    tagline: 'Map the connections',
    description: "You know what the problem is. Now see how it ripples through your organization — and where the real leverage point is.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="8" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="24" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="24" cy="24" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="11" y1="15" x2="21" y2="9.5" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="11" y1="17" x2="21" y2="22.5" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="24" y1="11" x2="24" y2="21" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
      </svg>
    ),
    opening: "You have a problem to work with. Let's map where it lives and what it's connected to.\n\nDescribe the core issue you're dealing with.",
  },
  {
    id: 'change_readiness',
    name: 'Change Readiness',
    tagline: 'Is the moment right?',
    description: "There are windows when change is possible — and windows that are already closed. This mode tells you which one you're in.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="4" y1="12" x2="28" y2="12" stroke="currentColor" strokeWidth="1"/>
        <rect x="8" y="16" width="6" height="8" fill="currentColor" opacity="0.3"/>
        <rect x="18" y="16" width="6" height="4" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1"/>
        <line x1="8" y1="8" x2="8" y2="4" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="24" y1="8" x2="24" y2="4" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    opening: "Let's assess your readiness for action.\n\nWhat change are you considering, and what's making you question the timing?",
  },
];

// ============================================================
// TOPOGRAPHIC SVG PATTERN — reused from brand identity
// ============================================================
const TopographicBg = () => (
  <svg
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.04 }}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="topoCoach" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
        <path d="M 100 0 Q 140 40 100 80 Q 60 120 100 160 Q 140 200 100 200" fill="none" stroke="#b87333" strokeWidth="0.8"/>
        <path d="M 0 60 Q 50 40 100 60 Q 150 80 200 60" fill="none" stroke="#b87333" strokeWidth="0.6"/>
        <path d="M 0 120 Q 50 100 100 120 Q 150 140 200 120" fill="none" stroke="#b87333" strokeWidth="0.6"/>
        <path d="M 40 0 Q 20 60 40 120 Q 60 180 40 200" fill="none" stroke="#6b7b8d" strokeWidth="0.5"/>
        <path d="M 160 0 Q 180 60 160 120 Q 140 180 160 200" fill="none" stroke="#6b7b8d" strokeWidth="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#topoCoach)"/>
  </svg>
);

// ============================================================
// MODE PICKER
// ============================================================
function ModePicker({ onSelect }) {
  const [hoveredMode, setHoveredMode] = useState(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a2b4a',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <TopographicBg />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '900px',
        margin: '0 auto',
        padding: '80px 24px 60px',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '64px' }}>
          <a href="/" style={{ 
            color: '#b87333', 
            textDecoration: 'none', 
            fontSize: '13px',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '40px',
          }}>
            ← Ledge
          </a>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
            <span style={{ 
              color: '#b87333', 
              fontSize: '11px', 
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: '500',
            }}>
              AI Coach
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: '300',
            color: '#f7f6f3',
            margin: '0 0 20px 0',
            lineHeight: '1.15',
            letterSpacing: '-0.01em',
          }}>
            What kind of clarity<br />do you need today?
          </h1>

          <p style={{
            color: '#6b7b8d',
            fontSize: '16px',
            margin: 0,
            maxWidth: '480px',
            lineHeight: '1.6',
          }}>
            Choose your mode. Each one has a different job. You can always switch.
          </p>
        </div>

        {/* Mode cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}>
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSelect(mode)}
              onMouseEnter={() => setHoveredMode(mode.id)}
              onMouseLeave={() => setHoveredMode(null)}
              style={{
                background: hoveredMode === mode.id
                  ? 'rgba(184, 115, 51, 0.08)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${hoveredMode === mode.id ? '#b87333' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '4px',
                padding: '32px 28px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                transform: hoveredMode === mode.id ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              <div style={{ 
                color: hoveredMode === mode.id ? '#b87333' : '#6b7b8d',
                marginBottom: '20px',
                transition: 'color 0.2s ease',
              }}>
                {mode.icon}
              </div>

              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#b87333',
                marginBottom: '6px',
                fontWeight: '500',
              }}>
                {mode.tagline}
              </div>

              <h3 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '24px',
                fontWeight: '300',
                color: '#f7f6f3',
                margin: '0 0 14px 0',
                letterSpacing: '-0.01em',
              }}>
                {mode.name}
              </h3>

              <p style={{
                color: '#6b7b8d',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: 0,
              }}>
                {mode.description}
              </p>
            </button>
          ))}
        </div>

        <p style={{
          color: 'rgba(107, 123, 141, 0.5)',
          fontSize: '12px',
          marginTop: '40px',
          textAlign: 'center',
        }}>
          Conversations are not stored to your account. Sessions reset on page refresh.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// CHAT INTERFACE
// ============================================================
function ChatInterface({
  mode,
  messages,
  input,
  setInput,
  isLoading,
  onSend,
  onKeyDown,
  onBack,
  onInsights,
  messagesEndRef,
  inputRef,
}) {
  return (
    <div style={{
      height: '100vh',
      background: '#1a2b4a',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <TopographicBg />

      {/* Top bar */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7b8d',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: "'DM Sans', sans-serif",
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              letterSpacing: '0.02em',
            }}
          >
            ← Back
          </button>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#b87333',
              display: 'inline-block',
            }} />
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '15px',
              fontWeight: '300',
              color: '#f7f6f3',
              letterSpacing: '-0.01em',
            }}>
              {mode.name}
            </span>
            <span style={{
              color: '#6b7b8d',
              fontSize: '12px',
            }}>
              — {mode.tagline}
            </span>
          </div>
        </div>

        <button
          onClick={onInsights}
          style={{
            background: 'none',
            border: '1px solid rgba(184, 115, 51, 0.3)',
            borderRadius: '3px',
            color: '#b87333',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: "'DM Sans', sans-serif",
            padding: '5px 12px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(184, 115, 51, 0.1)';
            e.currentTarget.style.borderColor = '#b87333';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.borderColor = 'rgba(184, 115, 51, 0.3)';
          }}
        >
          Related Insights
        </button>
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative',
        zIndex: 2,
        padding: '40px 24px',
        scrollBehavior: 'smooth',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {isLoading && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
                padding: '4px 0',
              }}>
                {[0, 1, 2].map(j => (
                  <div
                    key={j}
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#b87333',
                      animation: 'coachPulse 1.2s ease-in-out infinite',
                      animationDelay: `${j * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 24px',
        flexShrink: 0,
        background: 'rgba(26, 43, 74, 0.95)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your response..."
              rows={1}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                padding: '12px 16px',
                color: '#f7f6f3',
                fontSize: '15px',
                fontFamily: "'DM Sans', sans-serif",
                resize: 'none',
                outline: 'none',
                lineHeight: '1.5',
                minHeight: '46px',
                maxHeight: '140px',
                overflowY: 'auto',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(184, 115, 51, 0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
              }}
            />
            <button
              onClick={onSend}
              disabled={!input.trim() || isLoading}
              style={{
                width: '46px',
                height: '46px',
                background: input.trim() && !isLoading ? '#b87333' : 'rgba(184, 115, 51, 0.2)',
                border: 'none',
                borderRadius: '4px',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 8L2 2l3 6-3 6 12-6z" fill={input.trim() && !isLoading ? '#f7f6f3' : 'rgba(247,246,243,0.4)'}/>
              </svg>
            </button>
          </div>
          <p style={{
            color: 'rgba(107, 123, 141, 0.5)',
            fontSize: '11px',
            margin: '8px 0 0 0',
            letterSpacing: '0.02em',
          }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      <style>{`
        @keyframes coachPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(184, 115, 51, 0.2); border-radius: 2px; }
        ::placeholder { color: rgba(107, 123, 141, 0.5); }
      `}</style>
    </div>
  );
}

// ============================================================
// MESSAGE BUBBLE
// ============================================================
function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const text = message.content || '';

  return (
    <div style={{
      marginBottom: '28px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
    }}>
      {!isUser && (
        <div style={{
          fontSize: '10px',
          color: '#b87333',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '8px',
          fontWeight: '500',
        }}>
          Coach
        </div>
      )}
      <div style={{
        maxWidth: isUser ? '80%' : '100%',
        background: isUser
          ? 'rgba(184, 115, 51, 0.12)'
          : 'transparent',
        border: isUser
          ? '1px solid rgba(184, 115, 51, 0.2)'
          : 'none',
        borderRadius: isUser ? '4px' : '0',
        padding: isUser ? '12px 16px' : '0',
        borderLeft: !isUser ? '2px solid rgba(184, 115, 51, 0.3)' : 'none',
        paddingLeft: !isUser ? '16px' : isUser ? '16px' : '0',
      }}>
        {text.split('\n').map((line, i) => (
          line ? (
            <p key={i} style={{
              color: isUser ? 'rgba(247, 246, 243, 0.8)' : '#f7f6f3',
              fontSize: '15px',
              lineHeight: '1.65',
              margin: '0 0 8px 0',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {line}
            </p>
          ) : <br key={i} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// RELATED INSIGHTS PANEL (lazy-loaded on button click)
// ============================================================
function InsightsPanel({ isOpen, onClose, sessionId, mode }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (isOpen && !fetched) {
      setLoading(true);
      setFetched(true);
      fetch(`/api/insights?mode=${mode}&session_id=${sessionId}`)
        .then(r => r.json())
        .then(data => {
          setInsights(data.articles || []);
          setLoading(false);
        })
        .catch(() => {
          setInsights([]);
          setLoading(false);
        });
    }
  }, [isOpen, fetched, mode, sessionId]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: '340px',
      background: 'rgba(15, 25, 45, 0.98)',
      borderLeft: '1px solid rgba(184, 115, 51, 0.2)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontSize: '10px',
            color: '#b87333',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>Related Insights</div>
          <div style={{
            fontFamily: "'Fraunces', serif",
            fontSize: '16px',
            color: '#f7f6f3',
            fontWeight: '300',
          }}>From the Ledge feed</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7b8d',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {loading && (
          <div style={{ color: '#6b7b8d', fontSize: '13px', textAlign: 'center', paddingTop: '32px' }}>
            Finding relevant articles...
          </div>
        )}
        {!loading && insights.length === 0 && (
          <div style={{ color: '#6b7b8d', fontSize: '13px', textAlign: 'center', paddingTop: '32px' }}>
            Continue the conversation to surface relevant insights.
          </div>
        )}
        {insights.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '14px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              textDecoration: 'none',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <div style={{
              fontSize: '10px',
              color: '#b87333',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '5px',
            }}>
              {article.primary_dimension || article.dimension}
            </div>
            <div style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '14px',
              fontWeight: '300',
              color: '#f7f6f3',
              lineHeight: '1.4',
              marginBottom: '6px',
            }}>
              {article.title}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7b8d',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {article.leadership_angle || article.lead}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function CoachPage() {
  const [selectedMode, setSelectedMode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  );
  const [showInsights, setShowInsights] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSelectMode = useCallback((mode) => {
    setSelectedMode(mode);
    setShowInsights(false);
    setMessages([{
      role: 'assistant',
      content: mode.opening,
      isOpening: true,
    }]);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selectedMode.id,
          messages: newMessages,
          session_id: sessionId,
        }),
      });

      if (!res.ok) throw new Error('Network response was not ok');

      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (err) {
      console.error('Coach error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, isLoading, messages, selectedMode, sessionId]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  if (!selectedMode) {
    return <ModePicker onSelect={handleSelectMode} />;
  }

  return (
    <div style={{ position: 'relative' }}>
      <ChatInterface
        mode={selectedMode}
        messages={messages}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        onSend={sendMessage}
        onKeyDown={handleKeyDown}
        onBack={() => setSelectedMode(null)}
        onInsights={() => setShowInsights(true)}
        showInsights={showInsights}
        onCloseInsights={() => setShowInsights(false)}
        messagesEndRef={messagesEndRef}
        inputRef={inputRef}
      />
      <InsightsPanel
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
        sessionId={sessionId}
        mode={selectedMode.id}
      />
    </div>
  );
}
