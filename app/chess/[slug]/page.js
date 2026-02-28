'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ChessGamePage() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [stats, setStats] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    async function fetchCase() {
      const { data: cData } = await supabase
        .from('chess_cases')
        .select('*')
        .eq('slug', params.slug)
        .eq('is_active', true)
        .single();

      if (!cData) {
        setLoading(false);
        return;
      }
      setCaseData(cData);

      const { data: oData } = await supabase
        .from('chess_options')
        .select('*')
        .eq('case_id', cData.id)
        .order('display_order', { ascending: true });

      if (oData) setOptions(oData);
      setLoading(false);
    }
    fetchCase();
  }, [params.slug]);

  async function submitResponse() {
    if (!selectedOption || !caseData) return;

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);

    try {
      await supabase.from('chess_responses').insert({
        case_id: caseData.id,
        selected_option_id: selectedOption.id,
        is_custom: false,
        mode: 'quick',
        session_id: sessionId,
        time_spent_seconds: timeSpent,
        shared: false
      });

      const { data: totalData } = await supabase
        .from('chess_responses')
        .select('id', { count: 'exact' })
        .eq('case_id', caseData.id);

      const { data: sameData } = await supabase
        .from('chess_responses')
        .select('id', { count: 'exact' })
        .eq('case_id', caseData.id)
        .eq('selected_option_id', selectedOption.id);

      const total = totalData?.length || 1;
      const same = sameData?.length || 0;
      const actualOpt = options.find(o => o.is_actual_decision);
      
      let actualCount = 0;
      if (actualOpt) {
        const { data: actualData } = await supabase
          .from('chess_responses')
          .select('id', { count: 'exact' })
          .eq('case_id', caseData.id)
          .eq('selected_option_id', actualOpt.id);
        actualCount = actualData?.length || 0;
      }

      setStats({
        totalPlayers: total,
        sameChoicePercent: Math.round((same / total) * 100),
        actualChoicePercent: Math.round((actualCount / total) * 100)
      });
    } catch (e) {
      console.error('Error saving response:', e);
      setStats({ totalPlayers: 1, sameChoicePercent: 100, actualChoicePercent: 0 });
    }

    setStep(3);
  }

  const progress = step * 20;

  if (loading) {
    return (
      <div className="chess-game-wrap">
        <div className="chess-game-box">
          <div className="chess-loading">Loading dossier...</div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="chess-game-wrap">
        <div className="chess-game-box">
          <div className="chess-loading">
            Case not found.{' '}
            <button onClick={() => router.push('/chess')} className="game-link">Back to cases</button>
          </div>
        </div>
      </div>
    );
  }

  const actualOption = options.find(o => o.is_actual_decision);

  return (
    <div className="chess-game-wrap">
      <button className="chess-game-close" onClick={() => router.push('/chess')}>&#10005;</button>

      <div className="chess-game-box">
        <div className="game-progress">
          <div className="game-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="game-header">
          <span className="game-header-case">Case No. {String(caseData.case_number).padStart(3, '0')}</span>
          <span className="game-header-step">Step {step} of 5</span>
        </div>

        {/* STEP 1: SITUATION */}
        {step === 1 && (
          <div className="game-screen">
            <span className="situation-era">{caseData.leader_period}</span>
            <h2 className="situation-title">{caseData.anonymous_title}</h2>
            <div className="situation-text">
              {caseData.situation_quick.split('\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="situation-question">{caseData.decision_point}</div>
            <button className="game-btn game-btn-primary" onClick={() => setStep(2)}>
              See Your Options &rarr;
            </button>
          </div>
        )}

        {/* STEP 2: DECIDE */}
        {step === 2 && (
          <div className="game-screen">
            <span className="situation-era">Your Decision</span>
            <h2 className="situation-title">Choose your move.</h2>

            {options.map((opt) => (
              <div
                key={opt.id}
                className={`option-card ${selectedOption?.id === opt.id ? 'selected' : ''}`}
                onClick={() => setSelectedOption(opt)}
              >
                <span className="option-letter">{opt.option_label}</span>
                <span className="option-text">{opt.option_text}</span>
              </div>
            ))}

            <button
              className="game-btn game-btn-primary"
              disabled={!selectedOption}
              onClick={submitResponse}
            >
              Lock In Your Decision &rarr;
            </button>
          </div>
        )}

        {/* STEP 3: ANALYSIS */}
        {step === 3 && selectedOption && (
          <div className="game-screen">
            <span className="situation-era">Analysis</span>
            <h2 className="analysis-verdict">
              {selectedOption.is_actual_decision
                ? 'Your instinct matches the real decision.'
                : 'Your choice reveals how you lead under pressure.'}
            </h2>
            <p className="analysis-text">{selectedOption.quick_analysis}</p>
            <div className="analysis-insight">
              <div className="analysis-insight-label">Leadership Insight</div>
              <p className="analysis-insight-text">
                {selectedOption.is_actual_decision
                  ? "You saw the same path as the real leader. But matching the decision is only half the picture — what matters is understanding why it worked and what it cost."
                  : "A different path isn't a wrong path. The question isn't what the historical leader chose — it's what your choice reveals about your leadership instincts and blind spots."}
              </p>
            </div>
            <button className="game-btn game-btn-primary" onClick={() => setStep(4)}>
              Reveal the Real Decision &rarr;
            </button>
          </div>
        )}

        {/* STEP 4: REVEAL */}
        {step === 4 && (
          <div className="game-screen">
            <div className="reveal-leader">
              <div className="reveal-icon">&#127963;</div>
              <h2 className="reveal-name">{caseData.leader_name}</h2>
              <p className="reveal-context">{caseData.leader_period}</p>
            </div>

            <div className="reveal-decision">
              <div className="reveal-decision-label">What Actually Happened</div>
              <p className="reveal-decision-text">{caseData.reveal_text}</p>
            </div>

            {caseData.stoic_analysis && (
              <p className="reveal-outcome">{caseData.stoic_analysis}</p>
            )}

            {stats && (
              <div className="stats-bar">
                <div className="stat-item">
                  <div className="stat-number">{stats.totalPlayers}</div>
                  <div className="stat-label">Players</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{stats.sameChoicePercent}%</div>
                  <div className="stat-label">Chose Like You</div>
                </div>
                {actualOption && (
                  <div className="stat-item">
                    <div className="stat-number">{stats.actualChoicePercent}%</div>
                    <div className="stat-label">Matched the Leader</div>
                  </div>
                )}
              </div>
            )}

            <button className="game-btn game-btn-primary" onClick={() => setStep(5)}>
              See Your Result Card &rarr;
            </button>
          </div>
        )}

        {/* STEP 5: SHARE */}
        {step === 5 && (
          <div className="game-screen">
            <span className="situation-era">Your Result</span>

            <div className="share-card-preview">
              <div className="share-card-logo">&#9823; Ledge &middot; Leadership Chess</div>
              <div className="share-card-text">
                I played Leadership Chess.
                <br />
                <span style={{ color: '#d4935a' }}>
                  {selectedOption?.is_actual_decision
                    ? `My approach aligned with ${caseData.leader_name}'s actual decision.`
                    : `I chose a different path than ${caseData.leader_name}.`}
                </span>
              </div>
              {stats && (
                <div className="share-stat">
                  <strong>{stats.sameChoicePercent}%</strong> of players made the same call.
                </div>
              )}
            </div>

            <div className="share-buttons">
              <button
                className="share-btn share-btn-linkedin"
                onClick={() => {
                  const shareUrl = encodeURIComponent('https://ledge.news/chess/' + caseData.slug);
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank');
                }}
              >
                Share on LinkedIn
              </button>
              <button
                className="share-btn share-btn-copy"
                onClick={() => {
                  navigator.clipboard.writeText(`https://ledge.news/chess/${caseData.slug}`);
                  alert('Link copied!');
                }}
              >
                Copy Link
              </button>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button className="game-btn game-btn-primary" onClick={() => router.push('/chess')} style={{ maxWidth: '300px', margin: '0 auto' }}>
                Play Another Case &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
