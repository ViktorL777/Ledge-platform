import { createServerClient } from '@/lib/supabase-server';

// ============================================================
// RELATED INSIGHTS — Lazy-loaded, only when user clicks
// Matches coach session's identified dimensions to published articles
// ============================================================

const DIMENSION_MAP = {
  clarify: ['Meaning-Maker', 'Self-Awareness', 'Culture-Architect'],
  analyze: ['Strategist', 'Operator', 'Transformator'],
  transfer_window: ['Strategist', 'Transformator', 'Change & Transformation'],
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    const sessionId = searchParams.get('session_id');

    const supabase = createServerClient();

    // If we have a session, check if the session has identified_dimensions
    let dimensions = DIMENSION_MAP[mode] || [];

    if (sessionId) {
      const { data: session } = await supabase
        .from('ai_coach_sessions')
        .select('identified_dimensions')
        .eq('session_id', sessionId)
        .single();

      if (session?.identified_dimensions?.length > 0) {
        dimensions = session.identified_dimensions;
      }
    }

    // Fetch relevant published articles matching dimensions
    let query = supabase
      .from('curated_articles')
      .select('id, title, url, lead, leadership_angle, primary_dimension, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(6);

    if (dimensions.length > 0) {
      query = query.in('primary_dimension', dimensions);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error('Insights fetch error:', error);
      return Response.json({ articles: [] });
    }

    return Response.json({ articles: articles || [] });
  } catch (err) {
    console.error('Insights API error:', err);
    return Response.json({ articles: [] });
  }
}
