// ============================================
// LEDGE — Board of Advisors: Synthesis
// app/api/board/synthesize/route.js
// Called once after both rounds are complete
// ============================================

export async function POST(request) {
  const { problem, personas, round1, round2 } = await request.json()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Missing API key' }, { status: 500 })
  }

  // ── BUILD TRANSCRIPT ──────────────────────────────────────────────
  const transcript = personas
    .map(p => {
      const name = p.realPerson || p.title
      const r1 = (round1 || []).find(r => r.personaId === p.id)
      const r2 = (round2 || []).find(r => r.personaId === p.id)
      return `═══ ${name} ═══

Round 1 — Initial position:
${r1?.opinion || '[no response recorded]'}

Round 2 — Reaction:
${r2?.reaction || '[no response recorded]'}`
    })
    .join('\n\n')

  const systemPrompt = `You are the synthesis voice for a Board of Advisors session on the Ledge leadership intelligence platform. You have observed the full board discussion. Your job is to distill it into a clear, high-value synthesis that the leader can act on.

THE SYNTHESIS MUST DO FOUR THINGS:
1. Name the dominant fault line — where did the board genuinely disagree, and why does that disagreement matter for this specific challenge?
2. Identify 2-3 cross-cutting insights — what emerged from the collective discussion that no single advisor could have produced alone?
3. Name the blind spot — what did the entire board collectively miss or avoid? Be specific and honest.
4. End with one sharp question — a single, precise question the leader should sit with before deciding.

TONE AND FORMAT:
- 4-6 paragraphs, no headers, no bullet points
- Flowing authoritative prose — the final word in a high-stakes boardroom
- Write as a wise, detached observer — not as a participant or a cheerleader
- Intellectually honest: name tensions and gaps, not just highlights
- Do NOT praise the board or the session — get straight to the synthesis
- The last sentence should be the question, set apart naturally as its own paragraph`

  const userMessage = `The leadership challenge examined by the board:
"${problem}"

Full board session transcript:

${transcript}

Now synthesise.`

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
      max_tokens: 900,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return Response.json({ error: 'Anthropic API error', detail: err }, { status: 500 })
  }

  const data = await response.json()
  const synthesis = data.content?.[0]?.text || ''

  return Response.json({ synthesis })
}
