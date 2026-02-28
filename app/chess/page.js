'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ChessPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      const { data, error } = await supabase
        .from('chess_cases')
        .select('id, case_number, slug, anonymous_title, category, situation_quick, decision_point, primary_stoic_dimensions, is_active, mode, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (data) setCases(data);
      setLoading(false);
    }
    fetchCases();
  }, []);

  const dimShort = {
    'Meaning-Maker': 'Meaning',
    'Strategy': 'Strategy',
    'Tech-Savvy': 'Tech',
    'Operator': 'Operations',
    'Relationships': 'Relationships',
    'Culture-Architect': 'Culture',
    'Self-Awareness': 'Self-Mastery',
    'Transformator': 'Transformation'
  };

  function getTeaser(text) {
    if (!text) return '';
    const sentences = text.split('. ');
    return sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '...' : '.');
  }

  return (
    <>
      <section className="chess-hero">
        <h1>Leadership <span>Chess</span></h1>
        <p className="chess-subtitle">
          What&apos;s your next move? Test your judgement against history&apos;s most consequential decisions.
        </p>
      </section>

      <div className="chess-cases-grid">
        {loading ? (
          <div className="chess-loading">Loading dossiers...</div>
        ) : cases.length === 0 ? (
          <div className="chess-loading">No active cases yet. Check back soon.</div>
        ) : (
          cases.map((c) => (
            <Link href={`/chess/${c.slug}`} key={c.id} className="dossier-card">
              <div className="dossier-stripe"></div>
              <div className="dossier-stamp">Classified</div>
              <div className="dossier-head">
                <span className="dossier-num">Case No. {String(c.case_number).padStart(3, '0')}</span>
                <span className="dossier-cat">{c.category}</span>
              </div>
              <div className="dossier-content">
                <h3 className="dossier-title">{c.anonymous_title}</h3>
                <p className="dossier-teaser">{getTeaser(c.situation_quick)}</p>
                {c.primary_stoic_dimensions && (
                  <div className="dossier-dims">
                    {c.primary_stoic_dimensions.map((dim, i) => (
                      <span key={i} className="dim-tag">{dimShort[dim] || dim}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="dossier-foot">
                <span className="dossier-time">~3 min &middot; Quick Mode</span>
                <span className="dossier-cta">Open Dossier &rarr;</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
