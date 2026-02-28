// ============================================
// LEDGE — Admin API
// GET/POST/PATCH/DELETE /api/admin/articles
// Protected by ADMIN_PASSWORD
// ============================================

import { createClient } from '@supabase/supabase-js';

function getServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    return { authorized: false, error: 'ADMIN_PASSWORD not configured' };
  }
  if (token !== adminPassword) {
    return { authorized: false, error: 'Unauthorized' };
  }
  return { authorized: true };
}

// GET — List all articles (all statuses)
export async function GET(request) {
  const auth = checkAuth(request);
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: 401 });
  }

  const supabase = getServerClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // optional filter

  let query = supabase
    .from('curated_articles')
    .select('*')
    .order('curated_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ articles: data, count: data.length });
}

// POST — Create a new article manually
export async function POST(request) {
  const auth = checkAuth(request);
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: 401 });
  }

  const supabase = getServerClient();
  const body = await request.json();

  const { title, lead, source_name, article_url, primary_dimension, leadership_angle, data_source, tags, status } = body;

  if (!title || !primary_dimension || !leadership_angle) {
    return Response.json({ error: 'title, primary_dimension, and leadership_angle are required' }, { status: 400 });
  }

  // Generate slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
    .replace(/-+$/, '');

  const { data, error } = await supabase
    .from('curated_articles')
    .insert({
      title,
      lead: lead || '',
      source_name: source_name || 'Ledge Editorial',
      source_url: '',
      article_url: article_url || '',
      primary_dimension,
      related_dimensions: [],
      relevance_score: 10,
      leadership_angle,
      data_source: data_source || null,
      tone_check: 'editorial',
      tags: tags || [],
      status: status || 'published',
      slug,
      published_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, article: data });
}

// PATCH — Update article (status change, edit content)
export async function PATCH(request) {
  const auth = checkAuth(request);
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: 401 });
  }

  const supabase = getServerClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return Response.json({ error: 'Article id is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('curated_articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, article: data });
}

// DELETE — Remove article
export async function DELETE(request) {
  const auth = checkAuth(request);
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: 401 });
  }

  const supabase = getServerClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'Article id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('curated_articles')
    .delete()
    .eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
