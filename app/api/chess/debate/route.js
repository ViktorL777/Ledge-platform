import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(request) {
  const {
    caseTitle,
    decisionPoint,
    userChoice,
    userArgument,
    firstArgument,
    firstResponse,
    round
  } = await request.json();

  const systemPrompt = `You are a sharp, intellectually honest debate partner in a leadership decision simulation.
Your role: challenge the player's reasoning — not to "win" but to sharpen their thinking.
Rules:
- Be direct and respectful. No flattery, no softening.
- 2-3 sentences MAXIMUM per response.
- Never reveal the historical leader's identity or what they actually decided.
- Acknowledge merit honestly if the player's argument has genuine force.
- On round 1: end with a probing follow-up question.
- On round 2: conclude by inviting them to see what actually happened.`;

  let userMessage;

  if (round === 1) {
    userMessage = `Leadership scenario: "${caseTitle}"
Decision point: "${decisionPoint}"
Player chose: "${userChoice}"
The actual historical decision was different from this choice.
Player's argument: "${userArgument}"

Challenge their reasoning in 2-3 sentences. Then ask one probing follow-up question that makes them think deeper.`;
  } else {
    userMessage = `Leadership scenario: "${caseTitle}"
Player's original choice: "${userChoice}"

Round 1 — Player argued: "${firstArgument}"
Round 1 — Your counter: "${firstResponse}"
Round 2 — Player responds: "${userArgument}"

Acknowledge their point honestly (if it has genuine merit, say so directly). Then conclude with something like: "You've made your case. Ready to see what the real leader decided — and what happened next?"`;
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    return Response.json({ response: response.content[0].text });
  } catch (error) {
    console.error('Debate API error:', error);
    return Response.json(
      { response: "Interesting perspective. Every decision carries trade-offs the historical record only partially captures. Are you ready to see what actually happened?" },
      { status: 200 }
    );
  }
}
