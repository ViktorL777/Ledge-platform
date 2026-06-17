'use client';
// ============================================================
// LEDGE — Learn (Explain in 5 Minutes + Resource Library)
// app/learn/page.js  ·  v2
//
// Reads learning_modules + learning_resources from Supabase
// (anon, RLS public-read). Browse + filter by dimension/type.
//
// v2 changes:
//  - Handles real DB type 'external_video' (not 'video')
//  - EVERY card is now clickable: external URL opens in a new
//    tab; otherwise it links to the internal reader
//    /learn/resource/[id] (renders body_content).
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DIMENSIONS = [
  'Meaning-Maker', 'Strategist', 'Tech-Savvy', 'Operator',
  'Relationship-Weaver', 'Culture-Architect', 'Self-Awareness', 'Transformator',
];

const DIM_LABEL = {
  'Meaning-Maker': 'Meaning Maker', 'Strategist': 'Strategy',
  'Tech-Savvy': 'New Technologies', 'Operator': 'Operations',
  'Relationship-Weaver': 'Interpersonal', 'Culture-Architect': 'Culture',
  'Self-Awareness': 'Self-Mastery', 'Transformator': 'Change & Transformation',
};

// Maps every resource_type that exists in the DB.
const TYPE_META = {
  article:        { label: 'Article',     icon: '◇' },
  external_video: { label: 'Video',       icon: '▷' },
  video:          { label: 'Video',       icon: '▷' },
  infographic:    { label: 'Infographic', icon: '▦' },
  book:           { label: 'Book',        icon: '❏' },
  external:       { label: 'Link',        icon: '↗' },
};

const C = {
  blue: '#1a2b4a', slate: '#6b7b8d', copper: '#b87333',
  paper: '#f7f6f3', ink: '#222', line: 'rgba(26,43,74,0.10)',
};

export default function LearnPage() {
  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDim, setActiveDim] = useState('all');
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [m, r] = await Promise.all([
          supabase.from('learning_modules')
            .select('*').eq('status', 'published')
            .order('display_order', { ascending: true }),
          supabase.from('learning_resources')
            .select('*').eq('status', 'published')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false }),
        ]);
        if (cancelled) return;
        if (m.error) throw m.error;
        if (r.error) throw r.error;
        setModules(m.data || []);
        setResources(r.data || []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load the library.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const dimMatch = (item) =>
    activeDim === 'all' ||
    item.primary_dimension === activeDim ||
    (item.related_dimensions || []).includes(activeDim);

  const filteredModules = useMemo(
    () => modules.filter(dimMatch),
    [modules, activeDim]
  );
  const filteredResources = useMemo(
    () => resources.filter(r => dimMatch(r) && (activeType === 'all' || r.resource_type === activeType)),
    [resources, activeDim, activeType]
  );

  const typesPresent = useMemo(() => {
    const order = ['article', 'external_video', 'video', 'infographic', 'book', 'external'];
    const s = new Set(resources.map(r => r.resource_type));
    return order.filter(t => s.has(t));
  }, [resources]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.ink }}>
      {/* Top bar */}
      <header style={{ borderBottom: `1px solid ${C.line}`, padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: '1.35rem', color: C.blue, letterSpacing: '-0.01em' }}>L</span>
          <span style={{ width: 14, height: 2, backgroundColor: C.copper, display: 'inline-block', marginBottom: 4 }} />
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: '1.35rem', color: C.blue, letterSpacing: '-0.01em' }}>edge</span>
        </Link>
        <nav style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem' }}>
          <Link href="/news" style={{ color: C.slate, textDecoration: 'none' }}>News</Link>
          <Link href="/chess" style={{ color: C.slate, textDecoration: 'none' }}>Chess</Link>
          <Link href="/learn" style={{ color: C.blue, textDecoration: 'none', fontWeight: 600 }}>Learn</Link>
          <Link href="/coach" style={{ color: C.slate, textDecoration: 'none' }}>Coach</Link>
          <Link href="/measurement" style={{ color: C.slate, textDecoration: 'none' }}>Measurement</Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '3rem 1.5rem 1.5rem' }}>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: C.copper, marginBottom: '0.75rem' }}>
          Explain in 5 Minutes
        </p>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 600, lineHeight: 1.05, color: C.blue, margin: 0, maxWidth: 760, letterSpacing: '-0.02em' }}>
          The right depth, on demand.
        </h1>
        <p style={{ fontSize: '1.05rem', color: C.slate, marginTop: '1rem', maxWidth: 620, lineHeight: 1.5 }}>
          A curated library of leadership ideas — short reads, videos, books, and bite-sized modules, mapped across the eight dimensions.
        </p>
      </section>

      {/* Dimension filters */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0.5rem 1.5rem 0' }}>
        <Chips
          options={[{ k: 'all', label: 'All dimensions' }, ...DIMENSIONS.map(d => ({ k: d, label: DIM_LABEL[d] }))]}
          active={activeDim} onPick={setActiveDim}
        />
      </section>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '1.75rem 1.5rem 4rem' }}>
        {loading && <Notice text="Loading the library…" sub="One moment." />}
        {error && !loading && <Notice text="The library didn't load." sub={error} />}

        {!loading && !error && (
          <>
            {/* Modules */}
            {filteredModules.length > 0 && (
              <>
                <SectionLabel n="Modules" count={filteredModules.length} hint="3–7 nuggets · a few minutes each" />
                <div style={grid}>
                  {filteredModules.map(mod => (
                    <Link key={mod.id} href={`/learn/module/${mod.id}`} style={{ textDecoration: 'none' }}>
                      <article style={moduleCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <span style={dimTag}>{DIM_LABEL[mod.primary_dimension] || mod.primary_dimension}</span>
                          {!mod.is_free && <span style={premiumTag}>Premium</span>}
                        </div>
                        <h3 style={cardTitle}>{mod.title}</h3>
                        <p style={cardDesc}>{mod.description}</p>
                        <div style={cardMeta}>
                          <span>{mod.nugget_count || 0} nuggets</span>
                          <span aria-hidden>·</span>
                          <span>{mod.total_duration_minutes || 0} min</span>
                          <span style={{ marginLeft: 'auto', color: C.copper, fontWeight: 600 }}>Start →</span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* Resources */}
            <div style={{ marginTop: filteredModules.length ? '2.5rem' : 0 }}>
              <SectionLabel n="Resources" count={filteredResources.length} hint="Articles, videos, books & links" />
              {typesPresent.length > 1 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <Chips
                    small
                    options={[{ k: 'all', label: 'All types' }, ...typesPresent.map(t => ({ k: t, label: TYPE_META[t].label }))]}
                    active={activeType} onPick={setActiveType}
                  />
                </div>
              )}
            </div>

            {filteredResources.length === 0 ? (
              <Notice text="Nothing here yet for this filter." sub="Try another dimension or type." />
            ) : (
              <div style={grid}>
                {filteredResources.map(res => {
                  const meta = TYPE_META[res.resource_type] || TYPE_META.external;
                  const externalHref = res.video_url || res.external_url || null;
                  const isExternal = !!externalHref;
                  // Every card has a destination: external link OR internal reader.
                  const href = externalHref || `/learn/resource/${res.id}`;
                  const actionLabel = isExternal ? 'Open ↗' : 'Read →';

                  const inner = (
                    <article style={resourceCard}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <span style={{ color: C.copper, fontSize: '1rem' }} aria-hidden>{meta.icon}</span>
                        <span style={typeLabel}>{meta.label}</span>
                        {!res.is_free && <span style={{ ...premiumTag, marginLeft: 'auto' }}>Premium</span>}
                      </div>
                      <h3 style={{ ...cardTitle, fontSize: '1.05rem' }}>{res.title}</h3>
                      {res.description && <p style={cardDesc}>{res.description}</p>}
                      <div style={cardMeta}>
                        <span style={dimTagSmall}>{DIM_LABEL[res.primary_dimension] || res.primary_dimension}</span>
                        {res.duration_minutes ? <span>· {res.duration_minutes} min</span> : null}
                        <span style={{ marginLeft: 'auto', color: C.copper, fontWeight: 600 }}>{actionLabel}</span>
                      </div>
                    </article>
                  );

                  return isExternal ? (
                    <a key={res.id} href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>
                  ) : (
                    <Link key={res.id} href={href} style={{ textDecoration: 'none' }}>{inner}</Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Chips({ options, active, onPick, small }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {options.map(o => {
        const on = active === o.k;
        return (
          <button key={o.k} onClick={() => onPick(o.k)}
            style={{
              cursor: 'pointer', border: `1px solid ${on ? C.blue : C.line}`,
              backgroundColor: on ? C.blue : 'transparent', color: on ? '#fff' : C.slate,
              borderRadius: 999, padding: small ? '0.3rem 0.75rem' : '0.4rem 0.9rem',
              fontSize: small ? '0.78rem' : '0.82rem', fontFamily: 'inherit',
              fontWeight: on ? 600 : 400, transition: 'all 0.15s',
            }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionLabel({ n, count, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', margin: '0 0 1.1rem', borderBottom: `1px solid ${C.line}`, paddingBottom: '0.6rem' }}>
      <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: C.blue, margin: 0 }}>{n}</h2>
      <span style={{ fontSize: '0.78rem', color: C.copper, fontWeight: 600 }}>{count}</span>
      <span style={{ fontSize: '0.78rem', color: C.slate, marginLeft: 'auto' }}>{hint}</span>
    </div>
  );
}

function Notice({ text, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: C.slate }}>
      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.15rem', color: C.blue, margin: '0 0 0.4rem' }}>{text}</p>
      {sub && <p style={{ fontSize: '0.85rem', margin: 0 }}>{sub}</p>}
    </div>
  );
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' };
const baseCard = {
  backgroundColor: '#fff', border: `1px solid ${C.line}`, borderRadius: 12,
  padding: '1.25rem', height: '100%', boxSizing: 'border-box',
  display: 'flex', flexDirection: 'column', transition: 'border-color 0.15s, transform 0.15s',
};
const moduleCard = { ...baseCard, borderLeft: `3px solid ${C.copper}` };
const resourceCard = { ...baseCard };
const cardTitle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.15rem', fontWeight: 600, color: C.blue, margin: '0 0 0.5rem', lineHeight: 1.2 };
const cardDesc = { fontSize: '0.88rem', color: C.slate, lineHeight: 1.5, margin: '0 0 1rem', flexGrow: 1 };
const cardMeta = { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: C.slate, marginTop: 'auto' };
const dimTag = { fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: C.blue, fontWeight: 600 };
const dimTagSmall = { fontSize: '0.72rem', color: C.slate };
const typeLabel = { fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: C.slate, fontWeight: 600 };
const premiumTag = { fontSize: '0.66rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: C.copper, border: `1px solid ${C.copper}`, borderRadius: 4, padding: '0.1rem 0.4rem', fontWeight: 600 };
