'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Steps: situation → decision → analysis → reveal → share
const STEPS = ['situation', 'decision', 'analysis', 'reveal', 'share'];

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now();
}

export default function ChessGamePage() {
  const params = useParams();
  const slug = params.slug;

  const [caseData, setCaseData] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [stats, setStats] = useState(null);
  const [startTime] = useState(Date.now());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load case data
  useEffect(() => {
    async function loadCase() {
      try {
        const { data: cData, error: cErr } = await supabase
          .from('chess_cases')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (cErr || !cData) {
          setError('Scenario not found.');
          setLoading(false);
          return;
        }

        const { data: oData } = await supabase
          .from('chess_options')
          .select('*')
          .eq('case_id', cData.id)
          .order('display_order', { ascending: true });

        setCaseData(cData);
        setOptions(oData || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load scenario.');
        setLoading(false);
      }
    }
    loadCase();
  }, [slug]);

  // Save response
  const saveResponse = useCallback(async (option) => {
    if (!caseData || saving) return;
    setSaving(true);
    try {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const sessionId = generateSessionId();

      await supabase.from('chess_responses').insert({
        case_id: caseData.id,
        selected_option_id: option.id,
        mode: 'quick',
        session_id: sessionId,
        time_spent_seconds: timeSpent,
      });

      // Fetch stats
      const { data: allResponses } = await supabase
        .from('chess_responses')
        .select('selected_option_id')
        .eq('case_id', caseData.id);

      if (allResponses && allResponses.length > 0) {
        const total = allResponses.length;
        const optionCounts = {};
        allResponses.forEach(r => {
          optionCounts[r.selected_option_id] = (optionCounts[r.selected_option_id] || 0) + 1;
        });
        
        const statsMap = {};
        options.forEach(o => {
          statsMap[o.id] = Math.round(((optionCounts[o.id] || 0) / total) * 100);
        });
        setStats({ total, percentages: statsMap });
      }
    } catch (err) {
      console.error('Failed to save response:', err);
    }
    setSaving(false);
  }, [caseData, options, saving, startTime]);

  // Handle option selection
  const handleSelect = async (option) => {
    setSelectedOption(option);
    await saveResponse(option);
    setCurrentStep(2); // Go to analysis
  };

  // Navigation
  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      // Don't go back past decision if already submitted
      if (currentStep > 2 || currentStep <= 1) {
        setCurrentStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Share functionality
  const shareResult = () => {
    const actualOption = options.find(o => o.is_actual_decision);
    const matchedLeader = selectedOption?.id === actualOption?.id;
    const shareText = matchedLeader
      ? `I chose the same path as ${caseData.leader_name} in the "${caseData.anonymous_title}" leadership challenge on Ledge. What would you decide?`
      : `I chose differently from ${caseData.leader_name} in the "${caseData.anonymous_title}" leadership challenge on Ledge. What would you decide?`;
    
    const shareUrl = `https://ledge.news/chess/${slug}`;
    
    if (navigator.share) {
      navigator.share({ title: 'Leadership Chess — Ledge', text: shareText, url: shareUrl });
    } else {
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(linkedInUrl, '_blank');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://ledge.news/chess/${slug}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="chess-game-page">
        <div className="chess-game-loading">
          <div className="chess-loading-icon">♟</div>
          <p>Loading scenario...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="chess-game-page">
        <div className="chess-game-error">
          <h2>{error}</h2>
          <Link href="/chess" className="chess-btn-primary">← Back to scenarios</Link>
        </div>
      </div>
    );
  }

  const actualOption = options.find(o => o.is_actual_decision);
  const matchedLeader = selectedOption?.id === actualOption?.id;
  const stepName = STEPS[currentStep];

  return (
    <div className="chess-game-page">
      {/* Top bar */}
      <nav className="chess-game-nav">
        <Link href="/chess" className="chess-game-back">← All Scenarios</Link>
        <div className="chess-game-progress">
          {STEPS.map((s, i) => (
            <div key={s} className={`chess-progress-dot ${i <= currentStep ? 'active' : ''} ${i === currentStep ? 'current' : ''}`} />
          ))}
        </div>
        <div className="chess-game-badge">{caseData.category}</div>
      </nav>

      {/* ============ STEP 1: SITUATION ============ */}
      {stepName === 'situation' && (
        <section className="chess-step chess-step-situation">
          <div className="chess-step-label">The Situation</div>
          <h1 className="chess-game-title">{caseData.anonymous_title}</h1>
          <div className="chess-situation-text">
            {caseData.situation_quick.split('\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="chess-step-actions">
            <button className="chess-btn-primary" onClick={goNext}>
              See the decision point →
            </button>
          </div>
        </section>
      )}

      {/* ============ STEP 2: DECISION ============ */}
      {stepName === 'decision' && (
        <section className="chess-step chess-step-decision">
          <div className="chess-step-label">Your Decision</div>
          <h2 className="chess-decision-question">{caseData.decision_point}</h2>
          <div className="chess-options-grid">
            {options.map((opt) => (
              <button
                key={opt.id}
                className={`chess-option-card ${selectedOption?.id === opt.id ? 'selected' : ''}`}
                onClick={() => handleSelect(opt)}
                disabled={saving}
              >
                <span className="chess-option-label">{opt.option_label}</span>
                <span className="chess-option-text">{opt.option_text}</span>
              </button>
            ))}
          </div>
          <div className="chess-step-nav">
            <button className="chess-btn-secondary" onClick={goBack}>← Re-read situation</button>
          </div>
        </section>
      )}

      {/* ============ STEP 3: ANALYSIS ============ */}
      {stepName === 'analysis' && selectedOption && (
        <section className="chess-step chess-step-analysis">
          <div className="chess-step-label">What Your Choice Reveals</div>
          <div className="chess-your-choice">
            <span className="chess-choice-badge">You chose {selectedOption.option_label}</span>
            <p className="chess-choice-text">{selectedOption.option_text}</p>
          </div>
          <div className="chess-analysis-text">
            {selectedOption.quick_analysis.split('\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {stats && (
            <div className="chess-stats-preview">
              <p className="chess-stats-note">
                {stats.percentages[selectedOption.id]}% of players made the same choice
                <span className="chess-stats-total"> · {stats.total} players total</span>
              </p>
            </div>
          )}
          <div className="chess-step-actions">
            <button className="chess-btn-primary chess-btn-reveal" onClick={goNext}>
              Reveal the leader →
            </button>
          </div>
        </section>
      )}

      {/* ============ STEP 4: REVEAL ============ */}
      {stepName === 'reveal' && (
        <section className="chess-step chess-step-reveal">
          <div className="chess-reveal-dramatic">
            {matchedLeader ? (
              <div className="chess-reveal-match">
                <div className="chess-reveal-icon">✦</div>
                <p className="chess-reveal-tag">You chose the same path as</p>
              </div>
            ) : (
              <div className="chess-reveal-differ">
                <div className="chess-reveal-icon">◈</div>
                <p className="chess-reveal-tag">You chose differently from</p>
              </div>
            )}
            <h1 className="chess-reveal-name">{caseData.leader_name}</h1>
            <p className="chess-reveal-period">{caseData.leader_period}</p>
          </div>

          <div className="chess-reveal-story">
            <h3>What actually happened</h3>
            {caseData.reveal_text.split('\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="chess-reveal-analysis">
            <h3>Leadership analysis</h3>
            {caseData.stoic_analysis.split('\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Stats breakdown */}
          {stats && (
            <div className="chess-reveal-stats">
              <h3>How others decided</h3>
              <div className="chess-stats-bars">
                {options.map(opt => (
                  <div key={opt.id} className={`chess-stat-bar ${opt.is_actual_decision ? 'actual' : ''} ${opt.id === selectedOption?.id ? 'yours' : ''}`}>
                    <div className="chess-stat-bar-header">
                      <span className="chess-stat-bar-label">
                        {opt.option_label}
                        {opt.is_actual_decision && <span className="chess-stat-actual-badge">Actual decision</span>}
                        {opt.id === selectedOption?.id && <span className="chess-stat-yours-badge">Your choice</span>}
                      </span>
                      <span className="chess-stat-bar-pct">{stats.percentages[opt.id] || 0}%</span>
                    </div>
                    <div className="chess-stat-bar-track">
                      <div className="chess-stat-bar-fill" style={{ width: `${stats.percentages[opt.id] || 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="chess-stats-total-note">{stats.total} leaders have played this scenario</p>
            </div>
          )}

          <div className="chess-step-actions">
            <button className="chess-btn-primary" onClick={goNext}>
              See your result card →
            </button>
          </div>
        </section>
      )}

      {/* ============ STEP 5: SHARE ============ */}
      {stepName === 'share' && (
        <section className="chess-step chess-step-share">
          {/* Result card */}
          <div className="chess-result-card">
            <div className="chess-result-header">
              <span className="chess-result-logo">Ledge</span>
              <span className="chess-result-type">Leadership Chess</span>
            </div>
            <div className="chess-result-body">
              <p className="chess-result-scenario">"{caseData.anonymous_title}"</p>
              <p className="chess-result-match">
                {matchedLeader 
                  ? `You chose the same path as ${caseData.leader_name}.`
                  : `You chose differently from ${caseData.leader_name}.`
                }
              </p>
              {stats && (
                <p className="chess-result-stat">
                  {stats.percentages[selectedOption?.id] || 0}% of leaders agreed with you.
                </p>
              )}
            </div>
            <div className="chess-result-footer">
              <span>ledge.news/chess</span>
              <span>What's your next move?</span>
            </div>
          </div>

          {/* Share actions */}
          <div className="chess-share-actions">
            <button className="chess-btn-primary chess-btn-share" onClick={shareResult}>
              Share on LinkedIn
            </button>
            <button className="chess-btn-secondary" onClick={copyLink}>
              Copy link
            </button>
          </div>

          {/* Play more */}
          <div className="chess-play-more">
            <h3>Ready for another challenge?</h3>
            <Link href="/chess" className="chess-btn-primary">
              ← More scenarios
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
