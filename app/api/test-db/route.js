import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return Response.json({ error: 'Missing env vars', hasUrl: !!url, hasKey: !!key });
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('curated_articles')
    .select('id, title');

  return Response.json({
    success: !error,
    count: data?.length || 0,
    error: error?.message || null,
    titles: (data || []).slice(0, 3).map(a => a.title)
  });
}
