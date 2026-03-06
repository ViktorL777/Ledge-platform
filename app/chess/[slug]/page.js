'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ChessGamePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Core game state
  const [caseData, setCaseData] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [stats, setStats] = useState(null);
  const [startTime] = useState(Date.now());

  // Debate state
  const [debateText, setDebateText] = useState('');
  const [debateResponse, setDebateResponse] = useState('');
  const [debateRound, setDebateRound] = useState(1);
  const [debateLoading, setDebateLoading] = useState(false);
  const [debateSecondText, setDebateSecondText] = useState('');
  const [showSecondRound, setShowSecondRound] = useState(false);
  const [secondRoundDone, setSecondRoundDone] = useState(false);

  // Wisdom state
  const [wisdomOpen, setWisdomOpen] = useState(false);
  const [wisdomMessages, setWisdomMessages] = useState([]);
  const [wisdomInput, setWisdomInput] = useState('');
  const [wisdomLoading, setWisdomLoading] = useState(false);
  const [wisdomExchanges, setWisdomExchanges] = useState(0);
  const [wisdomDone, setWisdomDone] = useState(false);
  const [wisdomInsight, setWisdomInsight] = useState('');
  const [insightCopied, setInsightCopied] = useState(false);

  // Challenge state
  const [challengeLink, setChallengeLink] = useState('');
  const [challengerData, setChallengerData] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    // Check if this is a challenge play
    const challengeParam = searchParams.get('challenge');
    if (challengeParam) {
      try {
        const decoded = JSON.parse(atob(challengeParam));
        setChallengerData(decoded);
      } catch (e) {
        // Invalid token — ignore
      }
    }

    async function fetchCase() {
      const { data: cData } = await supabase
        .from('chess_cases')
        .select('*')
        .eq('slug', params.slug)
        .eq('is_active', true)
        .single();

      if (!cData) { setLoading(false); return; }
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
  }, [params.slug, searchParams]);

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

      const samePercent = Math.round((same / total) * 100);

      setStats({
        totalPlayers: total,
        sameChoicePercent: samePercent,
        actualChoicePercent: Math.round((actualCount / total) * 100)
      });

      // Generate challenge link
      const token = btoa(JSON.stringify({
        choice: selectedOption.option_label,
        matched: selectedOption.is_actual_decision,
        percent: samePercent
      }));
      setChallengeLink(`https://ledge.news/chess/${params.slug}?challenge=${token}`);

    } catch (e) {
      console.error('Error saving response:', e);
      setStats({ totalPlayers: 1, sameChoicePercent: 100, actualChoicePercent: 0 });
      const token = btoa(JSON.stringify({
        choice: selectedOption.option_label,
        matched: selectedOption.is_actual_decision,
        percent: 100
      }));
      setChallengeLink(`https://ledge.news/chess/${params.slug}?challenge=${token}`);
    }

    setStep(3);
  }

  async function submitDebate() {
    if (!debateText.trim() || debateLoading) return;
    setDebateLoading(true);

    try {
      const res = await fetch('/api/chess/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseTitle: caseData.anonymous_title,
          decisionPoint: caseData.decision_point,
          userChoice: selectedOption.option_text,
          userArgument: debateText,
          round: 1
        })
      });
      const data = await res.json();
      setDebateResponse(data.response);
      setShowSecondRound(true);
    } catch (e) {
      setDebateResponse("Interesting perspective. Every decision carries trade-offs the historical record only partially captures. Are you ready to see what actually happened?");
      setShowSecondRound(true);
    }
    setDebateLoading(false);
  }

  async function submitSecondRound() {
    if (!debateSecondText.trim() || debateLoading) return;
    setDebateLoading(true);

    try {
      const res = await fetch('/api/chess/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseTitle: caseData.anonymous_title,
          decisionPoint: caseData.decision_point,
          userChoice: selectedOption.option_text,
          userArgument: debateSecondText,
          firstArgument: debateText,
          firstResponse: debateResponse,
          round: 2
        })
      });
      const data = await res.json();
      setDebateResponse(data.response);
      setShowSecondRound(false);
      setSecondRoundDone(true);
      setDebateRound(2);
    } catch (e) {
      setDebateResponse("You've made your case well. The historical record will now have the final word.");
      setShowSecondRound(false);
      setSecondRoundDone(true);
      setDebateRound(2);
    }
    setDebateLoading(false);
  }

  async function startWisdom() {
    setWisdomOpen(true);
    setWisdomLoading(true);

    try {
      const res = await fetch('/api/chess/wisdom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseTitle: caseData.anonymous_title,
          userChoice: selectedOption.option_text,
          matchedLeader: selectedOption.is_actual_decision,
          leaderName: caseData.leader_name,
          conversationHistory: [],
          exchange: 0
        })
      });
      const data = await res.json();
      setWisdomMessages([{ role: 'assistant', content: data.response }]);
      setWisdomExchanges(1);
    } catch (e) {
      const fallback = selectedOption.is_actual_decision
        ? `You made the same call as the real leader. What was the core principle driving your thinking?`
        : `You chose a different path. What were you protecting with that decision?`;
      setWisdomMessages([{ role: 'assistant', content: fallback }]);
      setWisdomExchanges(1);
    }
    setWisdomLoading(false);
  }

  async function sendWisdomMessage() {
    if (!wisdomInput.trim() || wisdomLoading || wisdomDone) return;

    const userMsg = { role: 'user', content: wisdomInput };
    const newHistory = [...wisdomMessages, userMsg];
    setWisdomMessages(newHistory);
    setWisdomInput('');
    setWisdomLoading(true);

    const newExchanges = wisdomExchanges + 1;
    setWisdomExchanges(newExchanges);

    try {
      const res = await fetch('/api/chess/wisdom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseTitle: caseData.anonymous_title,
          userChoice: selectedOption.option_text,
          matchedLeader: selectedOption.is_actual_decision,
          leaderName: caseData.leader_name,
          conversationHistory: newHistory,
          exchange: newExchanges
        })
      });
      const data = await res.json();
      const assistantMsg = { role: 'assistant', content: data.response };
      setWisdomMessages([...newHistory, assistantMsg]);

      if (newExchanges >= 3 || data.isFinal) {
        setWisdomDone(true);
        setWisdomInsight(data.response);
      }
    } catch (e) {
      setWisdomMessages([...newHistory, {
        role: 'assistant',
        content: "That's a powerful reflection. What would you tell a junior leader facing a similar situation?"
      }]);
    }
    setWisdomLoading(false);
  }

  function copyChallenge() {
    navigator.clipboard.writeText(challengeLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  }

  function copyInsight() {
    navigator.clipboard.writeText(wisdomInsight);
    setInsightCopied(true);
    setTimeout(() => setInsightCopied(false), 2500);
  }

  // Progress bar — step 4 (debate) is optional, so we map manually
  const progressMap = { 1: 15, 2: 35, 3: 55, 4: 68, 5: 82, 6: 100 };
  const progress = progressMap[step] || 15;

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
  const decisionMatches = selectedOption?.is_actual_decision;

  return (
    <div className="chess-game-wrap">
      <button className="chess-game-close" onClick={() => router.push('/chess')}>&#10005;</button>

      <div className="chess-game-box">
        <div className="game-progress">
          <div className="game-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="game-header">
          <span className="game-header-case">Case No. {String(caseData.case_number).padStart(3, '0')}</span>
          {challengerData && (
            <span className="game-header-challenge">⚔ Challenge Match</span>
          )}
        </div>

        {/* STEP 1: SITUATION */}
        {step === 1 && (
          <div className="game-screen">
            {challengerData && (
              <div className="challenge-banner">
                ⚔ A colleague challenged you. Same scenario — different mind.
              </div>
            )}
            <span className="situation-era">{caseData.leader_period}</span>
            <h2 className="situation-title">{caseData.anonymous_title}</h2>
            <div className="situation-text">
              {caseData.situation_quick.split('\n').map((p, i) => p && <p key={i}>{p}</p>)}
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
              {decisionMatches
                ? 'Your instinct matches the real decision.'
                : 'Your choice reveals how you lead under pressure.'}
            </h2>
            <p className="analysis-text">{selectedOption.quick_analysis}</p>
            <div className="analysis-insight">
              <div className="analysis-insight-label">Leadership Insight</div>
              <p className="analysis-insight-text">
                {decisionMatches
                  ? "You saw the same path as the real leader. Matching the decision is only half the picture — what matters is understanding why it worked and what it cost."
                  : "A different path isn't a wrong path. The question isn't what the historical leader chose — it's what your choice reveals about your leadership instincts and blind spots."}
              </p>
            </div>

            {decisionMatches ? (
              <button className="game-btn game-btn-primary" onClick={() => setStep(5)}>
                Reveal the Real Decision &rarr;
              </button>
            ) : (
              <div className="debate-offer">
                <p className="debate-offer-text">Still think you made the right call?</p>
                <button className="game-btn game-btn-primary" onClick={() => setStep(4)}>
                  Argue My Case &rarr;
                </button>
                <button className="game-btn game-btn-ghost" onClick={() => setStep(5)}>
                  Just show me what happened
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: DEBATE */}
        {step === 4 && selectedOption && (
          <div className="game-screen">
            <span className="situation-era">Make Your Case</span>
            <h2 className="situation-title">Defend your decision.</h2>

            <div className="debate-context">
              <span className="debate-context-label">You chose:</span>
              <p className="debate-context-text">&ldquo;{selectedOption.option_text}&rdquo;</p>
            </div>

            {/* Round 1 input */}
            {!debateResponse && (
              <>
                <textarea
                  className="debate-textarea"
                  placeholder="Why was this the right call? What were you protecting? What context might the historical record have missed?"
                  value={debateText}
                  onChange={(e) => setDebateText(e.target.value)}
                  rows={4}
                />
                <button
                  className="game-btn game-btn-primary"
                  disabled={!debateText.trim() || debateLoading}
                  onClick={submitDebate}
                >
                  {debateLoading ? 'Thinking...' : 'Submit My Argument \u2192'}
                </button>
              </>
            )}

            {/* AI response */}
            {debateResponse && (
              <div className="debate-response">
                <div className="debate-response-label">Counter-argument:</div>
                <p className="debate-response-text">{debateResponse}</p>
              </div>
            )}

            {/* Round 2 */}
            {showSecondRound && !secondRoundDone && (
              <>
                <textarea
                  className="debate-textarea"
                  placeholder="One more point..."
                  value={debateSecondText}
                  onChange={(e) => setDebateSecondText(e.target.value)}
                  rows={3}
                />
                <div className="debate-round2-buttons">
                  <button
                    className="game-btn game-btn-primary"
                    disabled={!debateSecondText.trim() || debateLoading}
                    onClick={submitSecondRound}
                  >
                    {debateLoading ? 'Thinking...' : 'One More Point \u2192'}
                  </button>
                  <button
                    className="game-btn game-btn-ghost"
                    onClick={() => setStep(5)}
                  >
                    I&rsquo;ve made my case &rarr;
                  </button>
                </div>
              </>
            )}

            {/* After debate is done — proceed to reveal */}
            {debateResponse && (secondRoundDone || (!showSecondRound && debateResponse)) && !showSecondRound && (
              <button className="game-btn game-btn-primary" onClick={() => setStep(5)}>
                See What Actually Happened &rarr;
              </button>
            )}
          </div>
        )}

        {/* STEP 5: REVEAL */}
        {step === 5 && (
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
            <button className="game-btn game-btn-primary" onClick={() => setStep(6)}>
              See Your Result Card &rarr;
            </button>
          </div>
        )}

        {/* STEP 6: SHARE + CHALLENGE + WISDOM */}
        {step === 6 && (
          <div className="game-screen">
            <span className="situation-era">Your Result</span>

            {/* Share card */}
            <div className="share-card-preview">
              <div className="share-card-logo">&#9823; Ledge &middot; Leadership Chess</div>
              <div className="share-card-text">
                I played Leadership Chess.
                <br />
                <span style={{ color: '#d4935a' }}>
                  {decisionMatches
                    ? `My approach aligned with ${caseData.leader_name}'s actual decision.`
                    : `I chose a different path than ${caseData.leader_name}.`}
                </span>
                {debateResponse && (
                  <>
                    <br />
                    <span style={{ fontSize: '0.85em', opacity: 0.8 }}>
                      I argued my case with the AI — and stood my ground.
                    </span>
                  </>
                )}
              </div>
              {stats && (
                <div className="share-stat">
                  <strong>{stats.sameChoicePercent}%</strong> of players made the same call.
                </div>
              )}
            </div>

            {/* Challenge comparison — shown if this was a challenge play */}
            {challengerData && selectedOption && (
              <div className="challenge-comparison">
                <div className="challenge-comparison-label">Challenge Result</div>
                <div className="challenge-comparison-row">
                  <div className="challenge-comparison-item">
                    <div className="challenge-comparison-who">You</div>
                    <div className="challenge-comparison-choice">Option {selectedOption.option_label}</div>
                    <div className={`challenge-comparison-match ${decisionMatches ? 'matched' : 'differed'}`}>
                      {decisionMatches ? '✓ Matched the leader' : '≠ Different path'}
                    </div>
                  </div>
                  <div className="challenge-comparison-vs">VS</div>
                  <div className="challenge-comparison-item">
                    <div className="challenge-comparison-who">Challenger</div>
                    <div className="challenge-comparison-choice">Option {challengerData.choice}</div>
                    <div className={`challenge-comparison-match ${challengerData.matched ? 'matched' : 'differed'}`}>
                      {challengerData.matched ? '✓ Matched the leader' : '≠ Different path'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Standard share buttons */}
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

            {/* Challenge a friend */}
            <div className="challenge-section">
              <div className="challenge-section-label">⚔ Challenge a Friend</div>
              <p className="challenge-section-text">
                Send them the same scenario. See if they make the same call — or a better one.
              </p>
              <button className="share-btn share-btn-challenge" onClick={copyChallenge}>
                {linkCopied ? '✓ Link Copied!' : 'Copy Challenge Link'}
              </button>
            </div>

            {/* Share your wisdom */}
            {!wisdomOpen && (
              <div className="wisdom-offer">
                <div className="wisdom-offer-label">Share Your Wisdom</div>
                <p className="wisdom-offer-text">
                  {decisionMatches
                    ? "You made the same call as the real leader. How did you think about it?"
                    : "You chose differently. What principle were you following?"}
                </p>
                <button className="share-btn share-btn-wisdom" onClick={startWisdom}>
                  Reflect with the AI &rarr;
                </button>
              </div>
            )}

            {wisdomOpen && (
              <div className="wisdom-chat">
                <div className="wisdom-chat-label">Leadership Reflection</div>
                <div className="wisdom-messages">
                  {wisdomMessages.map((msg, i) => (
                    <div key={i} className={`wisdom-message wisdom-message-${msg.role}`}>
                      {msg.content}
                    </div>
                  ))}
                  {wisdomLoading && (
                    <div className="wisdom-message wisdom-message-assistant wisdom-thinking">
                      Thinking...
                    </div>
                  )}
                </div>

{wisdomDone && wisdomInsight && (
  <div className="wisdom-insight">
    <div className="wisdom-insight-label">Your Leadership Insight</div>
    <p className="wisdom-insight-text">{wisdomInsight}</p>
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      <button className="share-btn share-btn-wisdom" onClick={copyInsight}>
        {insightCopied ? '✓ Copied!' : 'Copy Your Insight'}
      </button>
      <button
        className="share-btn share-btn-linkedin"
        onClick={() => {
          navigator.clipboard.writeText(wisdomInsight);
          const url = encodeURIComponent(`https://ledge.news/chess/${caseData.slug}`);
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        }}
      >
        Share on LinkedIn
      </button>
    </div>
  </div>
)}

                {wisdomDone && wisdomInsight && (
                  <div className="wisdom-insight">
                    <div className="wisdom-insight-label">Your Leadership Insight</div>
                    <p className="wisdom-insight-text">{wisdomInsight}</p>
                    <button className="share-btn share-btn-wisdom" onClick={copyInsight}>
                      {insightCopied ? '✓ Copied!' : 'Copy Your Insight'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="game-footer-action">
              <button
                className="game-btn game-btn-primary"
                onClick={() => router.push('/chess')}
              >
                Play Another Case &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
