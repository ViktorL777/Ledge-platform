// ============================================
// LEDGE — Board of Advisors: Persona Speak
// app/api/board/speak/route.js
// Called once per persona, for both Round 1 and Round 2
// ============================================

export async function POST(request) {
  const { problem, persona, round, allPersonas, round1Opinions } = await request.json()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Missing API key' }, { status: 500 })
  }

  // ── IDENTITY BLOCK ────────────────────────────────────────────────
  const personaIdentity = persona.realPerson
    ? `You are ${persona.realPerson}. Speak authentically in their known communication style, values, reasoning patterns, and worldview — as documented in their public work, interviews, and writing. This is a simulated board session. Your responses are AI-generated based on publicly known information about this person and do not represent their actual views.`
    : `You embody the archetype of "${persona.title}" (intellectually inspired by thinkers like ${persona.subtitle.replace('After ', '')}). Your defining stance: "${persona.tagline}". Your role in this board: ${persona.role}. Speak from this archetype's perspective with full conviction — this is the value you bring to the board.`

  let systemPrompt, userMessage

  // ── ROUND 1: Initial position ─────────────────────────────────────
  if (round === 1) {
    systemPrompt = `${personaIdentity}

You are participating in a Board of Advisors session examining a leadership challenge. You are one of five advisors, each bringing a distinct perspective. The goal is productive tension — not agreement.

YOUR ROLE IN THIS ROUND:
Give your initial, unfiltered take on the challenge from your specific vantage point. Be direct. Be substantive. Stay sharp.

RULES:
- Speak in first person
- Do NOT summarize or restate the problem — engage with it
- Stay true to your archetype or identity — that is your value here
- 3 short, dense paragraphs maximum
- No headers, no bullet points, no lists — flowing prose only
- No diplomatic hedging. Say what you actually think.`

    userMessage = `The leadership challenge under examination:

"${problem}"

Give your initial position.`
  } else {
    // ── ROUND 2: Reactions ──────────────────────────────────────────
    const othersText = (round1Opinions || [])
      .filter(o => o.personaId !== persona.id)
      .map(o => {
        const other = (allPersonas || []).find(p => p.id === o.personaId)
        const name = other?.realPerson || other?.title || o.personaId
        return `─── ${name} ───\n${o.opinion}`
      })
      .join('\n\n')

    systemPrompt = `${personaIdentity}

You are in the second round of a Board of Advisors session. Your fellow advisors have offered their initial perspectives. Now you react.

YOUR ROLE IN THIS ROUND:
Push back where you disagree. Agree specifically where you agree. Surface what the room is missing — the angle no one has yet named. Stay sharply in character.

RULES:
- Reference specific things other advisors said — don't react in the abstract
- 2-3 paragraphs maximum
- Stay in character — your perspective is the value you bring
- No headers, no lists — flowing prose only
- Do NOT simply summarise what others said — react to it`

    userMessage = `The leadership challenge:
"${problem}"

Your fellow advisors said:

${othersText}

Now react. Push back. Agree selectively. Name what's missing.`
  }

  // ── ANTHROPIC API CALL ────────────────────────────────────────────
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL,
      max_tokens: 700,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return Response.json({ error: 'Anthropic API error', detail: err }, { status: 500 })
  }

  const data = await response.json()
  const opinion = data.content?.[0]?.text || ''

  return Response.json({ opinion })
}
