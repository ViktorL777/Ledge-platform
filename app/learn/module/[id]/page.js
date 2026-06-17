'use client';
// ============================================================
// LEDGE — Learn Module Reader (microlearning nugget player)
// app/learn/module/[id]/page.js
//
// Reads one module + its nuggets (ordered) from Supabase.
// Card-based reader: progress bar, prev/next, keyboard arrows.
// Each nugget: key takeaway → body → reflection question.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const C = {
  blue: '#1a2b4a', slate: '#6b7b8d', copper: '#b87333',
  paper: '#f7f6f3', ink: '#222', line: 'rgba(26,43,74,0.10)',
};

const NUGGET_KICKER = {
  concept: 'Concept', example: 'Example', reflection: 'Reflection',
  decision: 'Decision', summary: 'Summary',
};

export default function ModuleReaderPage() {
  const { id } = useParams();
  const [mod, setMod] = useState(null);
  const [nuggets, setNuggets] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [m, n] = await Promise.all([
          supabase.from('learning_modules').select('*').eq('id', id).single(),
          supabase.from('learning_nuggets').select('*').eq('module_id', id)
            .order('display_order', { ascending: true }),
        ]);
        if (cancelled) return;
        if (m.error) throw m.error;
        setMod(m.data);
        setNuggets(n.data || []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load this module.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const total = nuggets.length;
  const go = useCallback((delta) => {
    setIdx(i => Math.max(0, Math.min(total - 1, i + delta)));
  }, [total]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const wrap = { minHeight: '100vh', backgroundColor: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.ink };

  if (loading) return <Shell><Centered text="Loading the module…" /></Shell>;
  if (error || !mod) return (
    <Shell>
      <Centered text="This module isn't available." sub={error || 'It may have been unpublished.'}>
        <Link href="/learn" style={backBtn}>← Back to Learn</Link>
      </Centered>
    </Shell>
  );

  const atEnd = idx >= total - 1;
  const nugget = nuggets[idx];

  return (
    <div style={wrap}>
      {/* Top bar */}
      <header style={{ borderBottom: `1px solid ${C.line}`, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/learn" style={{ color: C.slate, textDecoration: 'none', fontSize: '0.85rem' }}>← Learn</Link>
        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, color: C.blue, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {mod.title}
        </span>
      </header>

      {total === 0 ? (
        <Centered text="This module has no lessons yet." sub="Check back soon.">
          <Link href="/learn" style={backBtn}>← Back to Learn</Link>
        </Centered>
      ) : (
        <main style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1.5rem 4rem' }}>
          {/* Progress */}
          <div style={{ display: 'flex', gap: 4, marginBottom: '1.75rem' }}>
            {nuggets.map((_, i) => (
              <span key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= idx ? C.copper : C.line, transition: 'background-color 0.2s' }} />
            ))}
          </div>

          {/* Card */}
          <article style={{ backgroundColor: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, padding: 'clamp(1.5rem, 4vw, 2.5rem)', minHeight: 360, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.copper, fontWeight: 700 }}>
                {NUGGET_KICKER[nugget.nugget_type] || 'Lesson'}
              </span>
              <span style={{ fontSize: '0.72rem', color: C.slate, marginLeft: 'auto' }}>
                {idx + 1} / {total}{nugget.duration_minutes ? ` · ${nugget.duration_minutes} min` : ''}
              </span>
            </div>

            {nugget.key_takeaway && (
              <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(1.3rem, 3.5vw, 1.7rem)', lineHeight: 1.25, color: C.blue, fontWeight: 600, margin: '0 0 1.25rem' }}>
                {nugget.key_takeaway}
              </p>
            )}

            {nugget.title && !nugget.key_takeaway && (
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.5rem', color: C.blue, margin: '0 0 1rem' }}>{nugget.title}</h2>
            )}

            {nugget.body_content && (
              <div style={{ fontSize: '1rem', lineHeight: 1.65, color: C.ink, whiteSpace: 'pre-wrap', flexGrow: 1 }}>
                {nugget.body_content}
              </div>
            )}

            {nugget.data_point && (
              <p style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(184,115,51,0.07)', borderLeft: `3px solid ${C.copper}`, borderRadius: 6, fontSize: '0.9rem', color: C.blue }}>
                {nugget.data_point}
              </p>
            )}

            {nugget.reflection_question && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: `1px solid ${C.line}` }}>
                <p style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.slate, margin: '0 0 0.5rem' }}>Ask yourself</p>
                <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.1rem', lineHeight: 1.4, color: C.blue, margin: 0, fontStyle: 'italic' }}>
                  {nugget.reflection_question}
                </p>
              </div>
            )}
          </article>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={() => go(-1)} disabled={idx === 0}
              style={{ ...navBtn, opacity: idx === 0 ? 0.35 : 1, cursor: idx === 0 ? 'default' : 'pointer' }}>
              ← Previous
            </button>
            {atEnd ? (
              <Link href="/learn" style={{ ...primaryBtn, marginLeft: 'auto', textDecoration: 'none', textAlign: 'center' }}>
                Finish ✓
              </Link>
            ) : (
              <button onClick={() => go(1)} style={{ ...primaryBtn, marginLeft: 'auto' }}>
                Next →
              </button>
            )}
          </div>
        </main>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────
function Shell({ children }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.ink }}>
      <header style={{ borderBottom: `1px solid ${C.line}`, padding: '1rem 1.5rem' }}>
        <Link href="/learn" style={{ color: C.slate, textDecoration: 'none', fontSize: '0.85rem' }}>← Learn</Link>
      </header>
      {children}
    </div>
  );
}

function Centered({ text, sub, children }) {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1.5rem', color: C.slate }}>
      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.3rem', color: C.blue, margin: '0 0 0.4rem' }}>{text}</p>
      {sub && <p style={{ fontSize: '0.9rem', margin: '0 0 1.5rem' }}>{sub}</p>}
      {children}
    </div>
  );
}

const navBtn = { backgroundColor: 'transparent', border: `1px solid ${C.line}`, borderRadius: 8, padding: '0.7rem 1.1rem', fontSize: '0.9rem', color: C.slate, fontFamily: 'inherit' };
const primaryBtn = { backgroundColor: C.blue, color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.4rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };
const backBtn = { display: 'inline-block', backgroundColor: C.blue, color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontSize: '0.88rem', fontWeight: 600 };
