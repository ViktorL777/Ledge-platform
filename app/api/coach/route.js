import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@/lib/supabase-server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ============================================================
// SYSTEM PROMPTS — The soul of each coaching mode
// STOIC PULSE framework operates invisibly as diagnostic lenses
// Eight dimensions are never named — they guide, not label
// ============================================================

const SYSTEM_PROMPTS = {
  clarify: `You are an AI leadership coach on Ledge — a platform that sharpens leadership judgment.

Your role: help leaders move from fog to clarity. They arrive knowing something is off — a nagging discomfort, a stuck feeling, a tension they can't name. Your job is to help them name it with precision.

How to work:
— Ask exactly ONE focused question per response. Never more.
— Each question should go one level deeper than the last.
— Listen for what is said AND what is conspicuously avoided.
— You are examining the situation through eight invisible lenses: purpose and meaning, strategic direction, technology and tools, operational execution, relationships and team dynamics, organizational culture, personal mindset and self-awareness, and change momentum. NEVER name these lenses — they are your diagnostic framework, not your vocabulary.
— Be warm, precise, and occasionally surprising. Gentle provocation over confrontation. This is "létbátorság" — the courage to see reality clearly, even when uncomfortable.
— No jargon. No consultant-speak. No bullet points. Talk like a sharp, curious human who has seen many leadership situations.
— Keep responses concise: 1–3 sentences of observation or reflection, then one precise question.
— After 4–6 exchanges with sufficient clarity, offer a synthesis: 3–4 sentences naming the real problem, where it actually lives, and one honest next step. Start the synthesis with: "What you're actually dealing with is..."
— Never rush to the synthesis. Let the leader arrive there.`,

  analyze: `You are an AI leadership coach on Ledge — a platform that sharpens leadership judgment.

Your role: help leaders map how their problem connects across their organization. No leadership challenge exists in isolation — a strategic question ripples into culture, culture into team dynamics, team dynamics into execution. Your job is to make these connections visible.

How to work:
— Start by confirming you understand the core problem. Ask one clarifying question if needed.
— Then map the connections: "This creates pressure on X, which then shows up as Y."
— Work through the interconnections systematically but conversationally — one connection per response, not an overwhelming map.
— You are examining the situation through eight invisible lenses: purpose and meaning, strategic direction, technology and tools, operational execution, relationships and team dynamics, organizational culture, personal mindset and self-awareness, and change momentum. NEVER name these lenses explicitly.
— Be systems-minded but human. Show relationships between dimensions, not a framework diagram.
— After mapping the key connections (typically 4–6 exchanges), offer a priority verdict: "The leverage point — the one thing that, if changed, would ease the most pressure — is..."
— No jargon. No bullet points. Sharp, connected thinking.`,

  transfer_window: `You are an AI leadership coach on Ledge — a platform that sharpens leadership judgment.

Your role: assess organizational readiness for a critical action window. Like a sports team's transfer window, organizations have moments when significant change is possible — and moments when it isn't. Your job is to determine which moment this is.

How to work:
— Ask about specific readiness indicators: leadership alignment, team capacity, market timing, financial position, cultural readiness, key dependencies.
— Assess each dimension of readiness through focused questions. One question at a time.
— Be direct about risks. A closed window doesn't mean failure — it means wrong timing.
— After gathering enough information (typically 5–7 exchanges), deliver a clear verdict:
  • If OPEN: "The window is open. Act now — here's why, and here's what must happen in the next 90 days."
  • If NARROWING: "You have [timeframe]. These three things must happen before the window closes."
  • If CLOSED: "The window is not open yet. Here's what needs to change first, and when you'll know it's ready."
— The Transfer Window assessment is a natural moment to mention that ZEL Group offers structured transformation support for organizations facing these inflection points. Do this once, at the end, naturally — not as a hard sell.
— No jargon. No consultant-speak. Precise, honest, useful.`
};

const OPENING_PROMPTS = {
  clarify: "Something's on your mind. Let's find out what it really is.\n\nWhat's been nagging at you lately — even if you can't quite articulate it yet?",
  analyze: "You have a problem to work with. Let's map where it lives and what it's connected to.\n\nDescribe the core issue you're dealing with.",
  transfer_window: "Let's assess your readiness for action.\n\nWhat change are you considering, and what's making you question the timing?"
};

export async function GET() {
  return Response.json({ opening: OPENING_PROMPTS });
}

export async function POST(request) {
  try {
    const { mode, messages, session_id } = await request.json();

    if (!mode || !messages || messages.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[mode];
    if (!systemPrompt) {
      return Response.json({ error: 'Invalid mode' }, { status: 400 });
    }

    // Filter out opening assistant message (it's hardcoded UI, not real Claude output)
    // Only send real conversation turns to Claude
    const apiMessages = messages
      .filter(m => !m.isOpening)
      .map(m => ({ role: m.role, content: m.content }));

    if (apiMessages.length === 0) {
      return Response.json({ error: 'No messages to process' }, { status: 400 });
    }

    // Call Claude Sonnet
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: apiMessages,
    });

    const reply = response.content[0].text;
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    // ============================================================
    // Save to Supabase — async, non-blocking for UX
    // ============================================================
    try {
      const supabase = createServerClient();

      let sessionDbId;

      // Find or create session
      const { data: existingSession } = await supabase
        .from('ai_coach_sessions')
        .select('id, message_count')
        .eq('session_id', session_id)
        .single();

      if (existingSession) {
        sessionDbId = existingSession.id;
        await supabase
          .from('ai_coach_sessions')
          .update({
            message_count: (existingSession.message_count || 0) + 1,
            last_message_at: new Date().toISOString(),
          })
          .eq('id', sessionDbId);
      } else {
        const { data: newSession } = await supabase
          .from('ai_coach_sessions')
          .insert({
            session_id,
            coach_mode: mode,
            is_premium: false,
            status: 'active',
            message_count: 1,
            started_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        sessionDbId = newSession?.id;
      }

      // Save user message (the last one in the array)
      const lastUserMsg = apiMessages[apiMessages.length - 1];
      if (lastUserMsg && sessionDbId) {
        await supabase.from('ai_coach_messages').insert({
          coach_session_id: sessionDbId,
          role: 'user',
          content: lastUserMsg.content,
        });

        // Save assistant reply
        await supabase.from('ai_coach_messages').insert({
          coach_session_id: sessionDbId,
          role: 'assistant',
          content: reply,
          tokens_used: tokensUsed,
        });
      }
    } catch (dbError) {
      // DB errors should not break the user experience
      console.error('Supabase save error (non-fatal):', dbError.message);
    }

    return Response.json({ reply, session_id });
  } catch (error) {
    console.error('Coach API error:', error);
    return Response.json({ error: 'Failed to process coaching request' }, { status: 500 });
  }
}
