export async function POST(request) {
  const {
    caseTitle,
    userChoice,
    matchedLeader,
    leaderName,
    conversationHistory,
    exchange
  } = await request.json();

  const systemPrompt = `You are conducting a brief leadership reflection interview — think of it as a mentor asking exactly the right question.
Your goal: help the person articulate their own leadership thinking clearly in 2-3 short exchanges.

Rules:
- Keep every response SHORT: 1-2 sentences max, then one focused question.
- Ask only one question at a time. No lists.
- Build on what they said — show you heard them.
- On exchange 3 (or if the conversation has natural closure): synthesize their thinking into one powerful, shareable insight.
- Format the final synthesis EXACTLY like this:
  "My leadership insight from this scenario: [their insight, in first person, in their own spirit]"
- The insight should feel like something they'd genuinely want to share on LinkedIn — personal, specific, non-generic.`;

  let messages;

  if (!conversationHistory || conversationHistory.length === 0) {
    const openingQuestion = matchedLeader
      ? `You just made the same call as ${leaderName}. What was the core principle that drove your thinking?`
      : `You chose a different path than ${leaderName}. What were you protecting with that decision?`;

    messages = [
      {
        role: 'user',
        content: `Start a leadership reflection interview.
Case: "${caseTitle}"
Player chose: "${userChoice}"
Did they match the real leader (${leaderName})? ${matchedLeader ? 'Yes' : 'No'}

Open with: "${openingQuestion}"`
      }
    ];
  } else {
    const isLastExchange = exchange >= 3;

    messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: isLastExchange
          ? `[This is exchange ${exchange}. The conversation should reach its conclusion now. Synthesize what they've shared into a final, shareable leadership insight. Format it exactly as: "My leadership insight from this scenario: [insight]"]`
          : `[This is exchange ${exchange} of 3. Continue the reflection with one follow-up question that goes deeper.]`
      }
    ];
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 180,
        system: systemPrompt,
        messages
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "That's a powerful reflection. What would you tell a junior leader facing a similar situation?";
    const isFinal = text.includes('My leadership insight from this scenario:') || exchange >= 3;

    return Response.json({ response: text, isFinal });
  } catch (error) {
    console.error('Wisdom API error:', error);

    const fallback = exchange >= 3
      ? `My leadership insight from this scenario: Under pressure, the decisions that matter most reveal not what we know — but what we value.`
      : `That's worth sitting with. What would you tell a junior leader facing a similar situation?`;

    return Response.json({ response: fallback, isFinal: exchange >= 3 });
  }
}
