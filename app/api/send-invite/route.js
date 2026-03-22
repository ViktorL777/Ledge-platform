import { Resend } from 'resend';

export async function POST(request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json(
      { error: 'RESEND_API_KEY not configured' },
      { status: 500 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { to, raterName, code, surveyTitle, participantName, senderName } = await request.json();

    if (!to || !code) {
      return Response.json(
        { error: 'Missing required fields: to, code' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ledge.news';
    const surveyUrl = `${baseUrl}/360?code=${code}`;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Ledge 360° <noreply@ledge.news>',
      to: [to],
      subject: `${surveyTitle || 'LEDGE 360° Assessment'} — Please complete your evaluation`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #1a2b4a;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 28px; height: 28px; border-radius: 8px; background: #1a2b4a; color: #f7f6f3; font-size: 14px; line-height: 28px; text-align: center; font-family: Georgia, serif;">L</div>
            <span style="font-family: Georgia, serif; font-size: 16px; color: #6b7b8d; margin-left: 6px;">360°</span>
          </div>

          <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 400; margin: 0 0 16px; color: #1a2b4a;">
            Dear ${raterName || 'Colleague'},
          </h1>

          <p style="font-size: 15px; line-height: 1.7; color: #5a6978; margin: 0 0 20px;">
            ${senderName ? senderName + ' has invited you' : 'You have been invited'} to evaluate
            ${participantName ? '<strong>' + participantName + '</strong>' : 'a colleague'} in a
            360-degree leadership assessment.
          </p>

          <p style="font-size: 15px; line-height: 1.7; color: #5a6978; margin: 0 0 24px;">
            Your responses are anonymous — individual answers are never shared, only aggregated results.
            The assessment takes approximately 5-10 minutes.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${surveyUrl}"
              style="display: inline-block; background: #b87333; color: #FFFFFF; padding: 14px 36px; border-radius: 10px; font-size: 15px; font-weight: 600; text-decoration: none; letter-spacing: 0.02em;">
              Complete Assessment →
            </a>
          </div>

          <div style="background: #f7f6f3; border: 1px solid #d6d1c9; border-radius: 10px; padding: 16px 20px; margin: 24px 0; text-align: center;">
            <div style="font-size: 12px; color: #6b7b8d; margin-bottom: 6px;">Your Code</div>
            <div style="font-family: monospace; font-size: 20px; font-weight: 700; letter-spacing: 0.15em; color: #b87333;">${code}</div>
          </div>

          <p style="font-size: 13px; color: #6b7b8d; margin: 24px 0 0; text-align: center;">
            If the button doesn't work, enter your code at
            <a href="${baseUrl}/360" style="color: #b87333;">${baseUrl}/360</a>
          </p>

          <hr style="border: none; border-top: 1px solid #d6d1c9; margin: 32px 0;">
          <p style="font-size: 11px; color: #8a97a6; text-align: center;">
            Ledge 360° — Leadership Intelligence Platform · ledge.news
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Send invite error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
