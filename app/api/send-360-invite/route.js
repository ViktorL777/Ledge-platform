// ═══════════════════════════════════════════════════════════════
// LEDGE 360° — /app/api/send-360-invite/route.js
// App Router email API · v3.4 · 2026-03-27
// ═══════════════════════════════════════════════════════════════
// Meghívó és emlékeztető email küldése Resend-del.
// Hívja: Ledge360App.jsx → sendRaterInvite()
// Body: { to, subject, bodyText, raterName }
// ═══════════════════════════════════════════════════════════════

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Szöveges body → HTML konvertálás (newline → <br>, link kiemelés)
function textToHtml(text = '') {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // URL-ek kiemelése kattintható linkként
  const withLinks = escaped.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" style="color:#A68542;text-decoration:none;">$1</a>'
  );

  // Newline → <br>
  return withLinks.replace(/\n/g, '<br>');
}

// Email HTML wrapper — LEDGE 360° branded shell
function buildHtml({ raterName, bodyText }) {
  const bodyHtml = textToHtml(bodyText);

  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LEDGE 360°</title>
</head>
<body style="margin:0;padding:0;background:#F5F3EF;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3EF;padding:40px 20px;">
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E2DED6;box-shadow:0 4px 20px rgba(0,0,0,0.06);">

          <!-- HEADER -->
          <tr>
            <td style="background:#1A1A18;padding:24px 32px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#A68542;width:32px;height:32px;border-radius:8px;text-align:center;vertical-align:middle;">
                    <span style="font-family:Georgia,serif;font-size:16px;color:#FAFAF8;font-weight:700;line-height:32px;">L</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-family:Georgia,serif;font-size:17px;color:#FAFAF8;letter-spacing:0.05em;">LEDGE</span>
                    <span style="font-family:Georgia,serif;font-size:13px;color:#A68542;margin-left:4px;">360°</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:36px 32px 28px;color:#1A1A18;font-size:15px;line-height:1.75;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #E2DED6;text-align:center;">
              <p style="font-size:11px;color:#C5C0B8;margin:0;line-height:1.6;">
                LEDGE 360° — ZEL Group &nbsp;·&nbsp; Bizalmas értékelési rendszer<br>
                Ha ezt a levelet nem Ön kérte, figyelmen kívül hagyhatja.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── POST handler ──────────────────────────────────────────────
export async function POST(request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { to, subject, bodyText, raterName } = body;

  if (!to || !subject || !bodyText) {
    return Response.json(
      { error: 'Missing required fields: to, subject, bodyText' },
      { status: 400 }
    );
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 });
  }

  try {
    const html = buildHtml({ raterName: raterName || '', bodyText });

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'LEDGE 360° <noreply@ledge.news>',
      to: [to],
      subject,
      html,
      // Plain text fallback
      text: bodyText,
    });

    if (error) {
      console.error('[send-360-invite] Resend error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log(`[send-360-invite] Sent to ${to} — Resend ID: ${data?.id}`);
    return Response.json({ success: true, id: data?.id });

  } catch (err) {
    console.error('[send-360-invite] Unexpected error:', err);
    return Response.json({ error: 'Internal server error: ' + err.message }, { status: 500 });
  }
}

// ─── GET health check ──────────────────────────────────────────
export async function GET() {
  return Response.json({
    status: 'ok',
    endpoint: '/api/send-360-invite',
    description: 'LEDGE 360° email invite sender. Use POST with { to, subject, bodyText, raterName }.',
    time: new Date().toISOString(),
  });
}
