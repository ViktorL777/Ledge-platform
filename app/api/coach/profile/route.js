import { createServerClient } from '@/lib/supabase-server';

// ============================================================
// LEDGE AI COACH — Profile API
// app/api/coach/profile/route.js
//
// GET  ?email=x    → fetch profile (injected at session start)
// POST             → extract + save profile (called at session end)
// DELETE ?email=x  → delete all data (Settings page)
// ============================================================

// ============================================================
// HAIKU EXTRACTION PROMPT
// Runs after session ends. Extracts structured profile from
// conversation history. ~$0.005 per call.
// ============================================================

const EXTRACTION_PROMPT = `You are a silent analyst. You have just observed a coaching conversation between a leadership coach and an executive.

Your job: extract a structured profile of the leader from what you observed. This profile will be used to personalize future coaching sessions — it is never shown to the leader directly.

Analyze the conversation and return a JSON object with exactly these fields. If you cannot determine a value from the conversation, use null. Never invent data.

{
  "communication_style": "one of: Persister | Thinker | Harmonizer | Imaginer | Rebel | Promoter | null",
  "disc_pattern": "one of: D | I | S | C | null",
  "big5_signals": {
    "openness": "high | medium | low | null",
    "conscientiousness": "high | medium | low | null",
    "extraversion": "high | medium | low | null",
    "agreeableness": "high | medium | low | null",
    "neuroticism": "high | medium | low | null"
  },
  "organization_context": "1-2 sentence description of their role, org type, or industry if mentioned. null if not mentioned.",
  "key_challenges": ["array of up to 3 specific challenges that appeared in this conversation"],
  "active_saboteurs": ["array of up to 2 saboteur patterns detected: Hyper-Achiever | Controller | Pleaser | Restless | Avoider | Stickler"],
  "recurring_themes": ["themes that appeared more than once in this conversation"],
  "growth_edges": ["areas where the leader showed openness to growth or challenge"],
  "last_commitment": "The specific action or step the leader committed to at the end of the session, if any. null if none.",
  "preferred_mode": "clarify | analyze | change_readiness — whichever best describes this conversation",
  "profile_summary": "2-3 sentences synthesizing this leader's style, key challenge, and where they are in their development. Written as a briefing for the coach before the next session. Example: 'This leader operates with high conscientiousness and a strong Controller pattern — decisions move slowly when trust in others is required. Current focus: organizational restructuring with board pressure. Key growth edge: naming the fear underneath the control need.'"
}

Return ONLY the JSON object. No preamble, no explanation, no markdown backticks.`;

// ============================================================
// PROFILE INJECTION TEMPLATE
// Prepended to system prompt when a returning leader is identified.
// ~700 tokens — direct injection, not RAG.
// ============================================================

function buildProfileInjection(profile) {
  if (!profile || !profile.profile_summary) return '';

  const parts = [];
  parts.push(`══════════════════════════════════════════════════════`);
  parts.push(`RETURNING LEADER — PROFILE CONTEXT`);
  parts.push(`(Use this to personalize your approach. Never reference this profile explicitly.)`);
  parts.push(`══════════════════════════════════════════════════════`);
  parts.push(``);
  parts.push(`PROFILE SUMMARY: ${profile.profile_summary}`);
  parts.push(``);

  if (profile.communication_style) {
    parts.push(`COMMUNICATION STYLE (PCM): ${profile.communication_style}`);
  }
  if (profile.disc_pattern) {
    parts.push(`BEHAVIORAL PATTERN (DISC): ${profile.disc_pattern}`);
  }
  if (profile.big5_signals && Object.keys(profile.big5_signals).length > 0) {
    const b5 = Object.entries(profile.big5_signals)
      .filter(([, v]) => v && v !== 'null')
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    if (b5) parts.push(`BIG5 SIGNALS: ${b5}`);
  }

  if (profile.active_saboteurs?.length > 0) {
    parts.push(`ACTIVE SABOTEUR PATTERNS: ${profile.active_saboteurs.join(', ')}`);
  }
  if (profile.key_challenges?.length > 0) {
    parts.push(`KEY CHALLENGES: ${profile.key_challenges.join(' | ')}`);
  }
  if (profile.organization_context) {
    parts.push(`ORGANIZATIONAL CONTEXT: ${profile.organization_context}`);
  }
  if (profile.recurring_themes?.length > 0) {
    parts.push(`RECURRING THEMES: ${profile.recurring_themes.join(' | ')}`);
  }
  if (profile.growth_edges?.length > 0) {
    parts.push(`GROWTH EDGES: ${profile.growth_edges.join(' | ')}`);
  }
  if (profile.last_commitment) {
    parts.push(`LAST SESSION COMMITMENT: "${profile.last_commitment}"`);
  }
  if (profile.sessions_count) {
    parts.push(`SESSIONS WITH LEDGE COACH: ${profile.sessions_count}`);
  }
  if (profile.preferred_mode) {
    parts.push(`PREFERRED MODE: ${profile.preferred_mode}`);
  }

  parts.push(`══════════════════════════════════════════════════════`);
  parts.push(``);

  return parts.join('\n');
}

// ============================================================
// ANTHROPIC HAIKU CALL — native fetch
// ============================================================

async function callHaiku(systemPrompt, conversationText) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_HAIKU_MODEL || 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: 'user', content: conversationText }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Haiku API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

// ============================================================
// TIME-WEIGHTED PROFILE MERGE
// Recent sessions get higher weight per spec:
// <30 days = 100%, 30-90 days = 60%, >90 days = 30%
// ============================================================

function getTimeWeight(updatedAt) {
  if (!updatedAt) return 0.3;
  const daysSince = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < 30) return 1.0;
  if (daysSince < 90) return 0.6;
  return 0.3;
}

function mergeProfiles(existing, newExtracted) {
  // For array fields: merge and deduplicate, keeping max 3-5 items
  const mergeArrays = (old, fresh, max = 4) => {
    const combined = [...(fresh || []), ...(old || [])];
    return [...new Set(combined)].slice(0, max);
  };

  return {
    communication_style: newExtracted.communication_style || existing.communication_style,
    disc_pattern: newExtracted.disc_pattern || existing.disc_pattern,
    big5_signals: { ...existing.big5_signals, ...newExtracted.big5_signals },
    organization_context: newExtracted.organization_context || existing.organization_context,
    key_challenges: mergeArrays(existing.key_challenges, newExtracted.key_challenges, 5),
    active_saboteurs: mergeArrays(existing.active_saboteurs, newExtracted.active_saboteurs, 3),
    recurring_themes: mergeArrays(existing.recurring_themes, newExtracted.recurring_themes, 5),
    growth_edges: mergeArrays(existing.growth_edges, newExtracted.growth_edges, 4),
    last_commitment: newExtracted.last_commitment || existing.last_commitment,
    preferred_mode: newExtracted.preferred_mode || existing.preferred_mode,
    profile_summary: newExtracted.profile_summary || existing.profile_summary,
  };
}

// ============================================================
// GET — fetch profile for session injection
// ============================================================

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return Response.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('leader_profiles')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !data) {
      return Response.json({ profile: null });
    }

    return Response.json({
      profile: data,
      profileInjection: buildProfileInjection(data),
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================
// POST — extract profile from session + save
// Called by frontend after session ends
// Body: { email, messages, sessionId, mode }
// ============================================================

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, messages, sessionId, mode } = body;

    if (!email || !messages?.length) {
      return Response.json({ error: 'Email and messages required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Build conversation text for Haiku
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'LEADER' : 'COACH'}: ${m.content}`)
      .join('\n\n');

    // Call Haiku extractor
    const rawJson = await callHaiku(EXTRACTION_PROMPT, conversationText);

    let extracted;
    try {
      const cleaned = rawJson.replace(/```json|```/g, '').trim();
      extracted = JSON.parse(cleaned);
    } catch {
      console.error('Profile extraction parse error:', rawJson);
      return Response.json({ error: 'Profile extraction failed' }, { status: 500 });
    }

    const supabase = createServerClient();

    // Check if profile exists
    const { data: existing } = await supabase
      .from('leader_profiles')
      .select('*')
      .eq('email', cleanEmail)
      .single();

    let profileData;
    if (existing) {
      // Merge with time-weighting
      profileData = mergeProfiles(existing, extracted);
      profileData.sessions_count = (existing.sessions_count || 0) + 1;
      profileData.last_session = new Date().toISOString();
      profileData.preferred_mode = extracted.preferred_mode || existing.preferred_mode;
      profileData.updated_at = new Date().toISOString();
      profileData.profile_updated_at = new Date().toISOString();

      await supabase
        .from('leader_profiles')
        .update(profileData)
        .eq('email', cleanEmail);
    } else {
      // New profile
      profileData = {
        email: cleanEmail,
        ...extracted,
        sessions_count: 1,
        last_session: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_updated_at: new Date().toISOString(),
      };

      await supabase
        .from('leader_profiles')
        .insert(profileData);
    }

    // Link session to profile
    if (sessionId) {
      await supabase
        .from('ai_coach_sessions')
        .update({ leader_email: cleanEmail, profile_injected: true })
        .eq('id', sessionId);
    }

    return Response.json({ success: true, isNewProfile: !existing });

  } catch (err) {
    console.error('Profile save error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ============================================================
// DELETE — wipe all data for a user (Settings page)
// Body: { email, confirmToken: 'DELETE_ALL' }
// ============================================================

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { email, confirmToken } = body;

    if (!email || confirmToken !== 'DELETE_ALL') {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const supabase = createServerClient();

    // Delete profile
    await supabase
      .from('leader_profiles')
      .delete()
      .eq('email', cleanEmail);

    // Anonymize sessions (don't delete — keep for aggregate analytics)
    await supabase
      .from('ai_coach_sessions')
      .update({ leader_email: null })
      .eq('leader_email', cleanEmail);

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Export the builder so route.js can import it
export { buildProfileInjection };
