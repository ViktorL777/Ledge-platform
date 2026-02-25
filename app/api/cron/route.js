// ============================================
// LEDGE — Cron Job Endpoint
// GET /api/cron
// ============================================
// Vercel Cron Jobs call this endpoint on schedule.
// Protected by CRON_SECRET environment variable.
// Runs the content pipeline automatically.
// ============================================

import { runPipeline } from '@/lib/pipeline';

export const maxDuration = 300; // 5 minutes max

export async function GET(request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // Allow if CRON_SECRET matches OR if PIPELINE_SECRET matches (backward compat)
  const pipelineSecret = process.env.PIPELINE_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also check pipeline secret as fallback
    if (!pipelineSecret || authHeader !== `Bearer ${pipelineSecret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('🕐 Cron job triggered at', new Date().toISOString());
    const result = await runPipeline();
    
    return Response.json({
      success: true,
      triggered_at: new Date().toISOString(),
      ...result
    });
  } catch (err) {
    console.error('❌ Cron pipeline failed:', err.message);
    return Response.json(
      { error: 'Pipeline failed', message: err.message },
      { status: 500 }
    );
  }
}
