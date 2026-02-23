import { runPipeline } from '@/lib/pipeline';

export const maxDuration = 300;

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.PIPELINE_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runPipeline();
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: 'Pipeline failed', message: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    status: 'ok',
    message: 'Ledge Pipeline endpoint. Use POST with Bearer token to run.',
    time: new Date().toISOString()
  });
}
