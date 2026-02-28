'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CATEGORY_ICONS = {
  'Military / Geopolitical': '⚔️',
  'Business Turning Point': '📈',
  'Innovation / Tech Bet': '🚀',
  'Crisis Management': '🔥',
  'Organizational / Cultural': '🏛️',
  'Personal Dilemma': '⚖️',
  'Ethical Dilemma': '🧭',
};

export default function ChessPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function loadCases() {
      const { data, error } = await supabase
        .from('chess_cases')
        .select('id, case_number, slug, category, anonymous_title, card_image_concept, decision_quality, mode, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (data) setCases(data);
      setLoading(false);
    }
    loadCases();
  }, []);

  const categories = ['all', ...new Set(cases.map(c => c.category))];
  const filtered = filter === 'all' ? cases : cases.filter(c => c.category === filter);

  return (
    <div className="chess-page">
      {/* Navigation */}
      <nav className="chess-nav">
        <Link href="/" className="chess-nav-logo">Ledge<span className="chess-nav-beta">Beta</span></Link>
        <div className="chess-nav-links">
          <Link href="/">Home</Link>
          <Link href="/chess" className="active">Leadership Chess</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="chess-hero">
        <div className="chess-hero-badge">Interactive Decision Challenge</div>
        <h1 className="chess-hero-title">Leadership Chess</h1>
        <p className="chess-hero-subtitle">What's Your Next Move?</p>
        <p className="chess-hero-desc">
          Step into history's most consequential leadership moments. 
          Read the scenario, make your call, then discover what the real leader decided — 
          and what happened next.
        </p>
        <div className="chess-hero-stats">
          <div className="chess-hero-stat">
            <span className="chess-hero-stat-num">{cases.length}</span>
            <span className="chess-hero-stat-label">Scenarios</span>
          </div>
          <div className="chess-hero-stat">
            <span className="chess-hero-stat-num">~3</span>
            <span className="chess-hero-stat-label">Minutes each</span>
          </div>
          <div className="chess-hero-stat">
            <span className="chess-hero-stat-num">0</span>
            <span className="chess-hero-stat-label">Right answers</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="chess-how">
        <div className="chess-how-steps">
          <div className="chess-how-step">
            <div className="chess-how-num">01</div>
            <h3>Read the situation</h3>
            <p>An anonymous leadership scenario. No names, no hints. Just the stakes.</p>
          </div>
          <div className="chess-how-step">
            <div className="chess-how-num">02</div>
            <h3>Make your call</h3>
            <p>Four options. No perfect answer. What would you do?</p>
          </div>
          <div className="chess-how-step">
            <div className="chess-how-num">03</div>
            <h3>See the reveal</h3>
            <p>Discover who the leader was — and whether you chose the same path.</p>
          </div>
          <div className="chess-how-step">
            <div className="chess-how-num">04</div>
            <h3>Share your result</h3>
            <p>Compare your instincts with other leaders and share your result card.</p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="chess-cases-section">
        <h2 className="chess-section-title">Choose Your Scenario</h2>
        <div className="chess-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`chess-filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'All Scenarios' : cat}
            </button>
          ))}
        </div>

        {/* Cases Grid */}
        {loading ? (
          <div className="chess-loading">
            <div className="chess-loading-icon">♟</div>
            <p>Loading scenarios...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="chess-empty">
            <p>No scenarios available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="chess-cases-grid">
            {filtered.map((c, i) => (
              <Link href={`/chess/${c.slug}`} key={c.id} className="chess-case-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="chess-case-category">
                  <span className="chess-case-cat-icon">{CATEGORY_ICONS[c.category] || '♟'}</span>
                  <span>{c.category}</span>
                </div>
                <h3 className="chess-case-title">{c.anonymous_title}</h3>
                <div className="chess-case-meta">
                  <span className={`chess-case-quality chess-quality-${c.decision_quality}`}>
                    {c.decision_quality === 'good' ? 'Clear outcome' : c.decision_quality === 'bad' ? 'Cautionary tale' : 'Contested'}
                  </span>
                  <span className="chess-case-mode">Quick · ~3 min</span>
                </div>
                <div className="chess-case-cta">
                  Play scenario →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="chess-footer">
        <p>Leadership Chess is part of <Link href="/">Ledge</Link> — leadership intelligence for the age of AI.</p>
        <p className="chess-footer-sub">The leader's identity is hidden until the reveal. No spoilers. No bias. Just your instincts.</p>
      </footer>
    </div>
  );
}
