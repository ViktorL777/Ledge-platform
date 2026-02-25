// ============================================
// LEDGE — Newsletter Subscribe Endpoint
// POST /api/subscribe
// ============================================

import { createServerClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const { email, name, source } = await request.json();
    
    if (!email || !email.includes('@')) {
      return Response.json(
        { error: 'Valid email address required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      if (existing.status === 'unsubscribed') {
        // Re-subscribe
        await supabase
          .from('newsletter_subscribers')
          .update({ status: 'active', unsubscribed_at: null })
          .eq('id', existing.id);
        return Response.json({ success: true, message: 'Welcome back!' });
      }
      return Response.json({ success: true, message: 'Already subscribed' });
    }

    // New subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        name: name || null,
        source: source || 'website',
        status: 'active'
      });

    if (error) {
      console.error('Subscribe error:', error);
      return Response.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    return Response.json({ success: true, message: 'Subscribed!' });
    
  } catch (err) {
    console.error('Subscribe endpoint error:', err);
    return Response.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
