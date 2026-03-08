// ============================================
// LEDGE — Board of Advisors: Continue Conversation
// app/api/board/continue/route.js
// Called for each follow-up question after the initial session
// All 5 personas respond to the user's question in context
// ============================================

export async function POST(request) {
  const { problem, personas, round1, round2, synthesis, history, question } = await request.json()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Missing API key' }, { status: 500 })
  }

  // Build transcript summary for context
  const transcriptSummary = personas.map(p => {
    const name = p.realPerson || p.title
    const r1 = (round1 || []).find(r => r.personaId === p.id)
    const r2 = (round2 || []).find(r => r.personaId === p.id)
    return `${name}: "${r1?.opinion?.slice(0, 200) || ''}…" (Round 2: "${r2?.reaction?.slice(0, 150) || ''}…")`
  }).join('\n')

  // Build conversation history string
  const historyText = (history || []).map(m => {
    if (m.role === 'user') return `User: ${m.text}`
    if (m.role === 'board') {
      const p = (personas || []).find(p => p.id === m.personaId)
      return `${p?.realPerson || p?.title || m.personaId}: ${m.text}`
    }
    return ''
  }).filter(Boolean).join('\n\n')

  // Fire all 5 personas in parallel
  const responses = await Promise.all(
    personas.map(async (persona) => {
      const personaIdentity = persona.realPerson
        ? `You are ${persona.realPerson}. Speak authentically in their known communication style, values, and worldview, based on their public work. This is an AI simulation — your responses do not represent this person's actual views.`
        : `You embody the archetype of "${persona.title}" (inspired by ${persona.subtitle?.replace('After ', '') || ''}). Your defining stance: "${persona.tagline}". Stay sharply in character.`

      const system = `${personaIdentity}

You are continuing a Board of Advisors conversation about a leadership challenge. You have already shared your position in an earlier session. Now the leader is asking a follow-up question.

RULES:
- Stay in character — your archetype or identity is your value here
- Be direct and substantive. 2 paragraphs max.
- Reference your earlier position if relevant — show continuity of thinking
- No headers, no bullet points — flowing prose only`

      const userMessage = `Original challenge: "${problem}"

Your earlier position and the board discussion:
${transcriptSummary}

${synthesis ? `Board synthesis: "${synthesis?.slice(0, 300)}…"` : ''}

${historyText ? `Previous conversation:\n${historyText}\n\n` : ''}The leader now asks: "${question}"`

      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5-20250514',
            max_tokens: 500,
            system,
            messages: [{ role: 'user', content: userMessage }],
          }),
        })
        const data = await res.json()
        return { personaId: persona.id, reply: data.content?.[0]?.text || 'Unavailable.' }
      } catch {
        return { personaId: persona.id, reply: 'This advisor could not respond.' }
      }
    })
  )

  return Response.json({ responses })
}
