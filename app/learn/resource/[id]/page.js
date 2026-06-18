'use client';
// ============================================================
// LEDGE — Learn Resource Reader
// app/learn/resource/[id]/page.js
//
// Renders a single resource's body_content (articles,
// infographics, and any resource without an external link).
// ============================================================

import { useState, useEffect } from 'react';
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

const DIM_LABEL = {
  'Meaning-Maker': 'Meaning Maker', 'Strategist': 'Strategy',
  'Tech-Savvy': 'New Technologies', 'Operator': 'Operations',
  'Relationship-Weaver': 'Interpersonal', 'Culture-Architect': 'Culture',
  'Self-Awareness': 'Self-Mastery', 'Transformator': 'Change & Transformation',
};

const TYPE_LABEL = {
  article: 'Article', infographic: 'Infographic',
  external_video: 'Video', video: 'Video', book: 'Book', external: 'Resource',
};

export default function ResourceReaderPage() {
  const { id } = useParams();
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('learning_resources').select('*').eq('id', id).single();
        if (cancelled) return;
        if (error) throw error;
        setRes(data);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load this resource.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.ink }}>
      

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {loading && <Centered text="Loading…" />}
        {error && !loading && (
          <Centered text="This resource isn't available." sub={error}>
            <Link href="/learn" style={backBtn}>← Back to Learn</Link>
          </Centered>
        )}
        {!loading && !error && res && (
          <article>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.copper, fontWeight: 700, margin: '0 0 0.75rem' }}>
              {TYPE_LABEL[res.resource_type] || 'Resource'}
              {res.primary_dimension ? ` · ${DIM_LABEL[res.primary_dimension] || res.primary_dimension}` : ''}
            </p>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', fontWeight: 600, lineHeight: 1.15, color: C.blue, margin: '0 0 1rem', letterSpacing: '-0.01em' }}>
              {res.title}
            </h1>
            {res.description && (
              <p style={{ fontSize: '1.1rem', color: C.slate, lineHeight: 1.5, margin: '0 0 2rem' }}>
                {res.description}
              </p>
            )}

            {res.thumbnail_url && (
              <img src={res.thumbnail_url} alt="" style={{ width: '100%', borderRadius: 12, marginBottom: '2rem', display: 'block' }} />
            )}

            {res.body_content ? (
              <div style={{ fontSize: '1.05rem', lineHeight: 1.7, color: C.ink, whiteSpace: 'pre-wrap' }}>
                {res.body_content}
              </div>
            ) : (
              <p style={{ color: C.slate, fontStyle: 'italic' }}>
                The full text for this resource is coming soon.
              </p>
            )}

            {(res.external_url || res.video_url) && (
              <a href={res.video_url || res.external_url} target="_blank" rel="noopener noreferrer"
                style={{ ...backBtn, marginTop: '2rem', backgroundColor: C.copper }}>
                Open original ↗
              </a>
            )}

            <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: `1px solid ${C.line}` }}>
              <Link href="/learn" style={{ color: C.slate, textDecoration: 'none', fontSize: '0.9rem' }}>← Back to all resources</Link>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}

function Centered({ text, sub, children }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: C.slate }}>
      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.3rem', color: C.blue, margin: '0 0 0.4rem' }}>{text}</p>
      {sub && <p style={{ fontSize: '0.9rem', margin: '0 0 1.5rem' }}>{sub}</p>}
      {children}
    </div>
  );
}

const backBtn = { display: 'inline-block', backgroundColor: C.blue, color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '0.7rem 1.3rem', fontSize: '0.9rem', fontWeight: 600 };
