// ═══════════════════════════════════════════════════════════════
// LEDGE 360° — /api/activate-project · Next.js App Router
// ═══════════════════════════════════════════════════════════════
// Projekt aktiválás + email küldés szerver oldalon.
// Megszünteti a kliens oldali race condition-t (tab bezárás, lassú hálózat).
//
// Request:  POST { projectId: string, consultantName: string }
// Response: { ok: true, sent: number, errors: [{id, reason}] }
//           { ok: false, error: string } — 4xx/5xx esetén
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Szerver oldali Supabase kliens — service role key, nem NEXT_PUBLIC_
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Supabase KV wrapperek ─────────────────────────────────────
// jsonb backward compat: ha régi string adat jön → JSON.parse fallback
async function dbGet(key) {
  const { data, error } = await supabase
    .from('kv_store')
    .select('value')
    .eq('key', key)
    .single();
  if (error || !data) return null;
  const v = data.value;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch { return v; } }
  return v;
}

async function dbSet(key, value) {
  const { error } = await supabase
    .from('kv_store')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  return !error;
}

async function dbList(prefix) {
  const { data, error } = await supabase
    .from('kv_store')
    .select('key')
    .like('key', `${prefix}%`);
  if (error || !data) return [];
  return data.map(d => d.key);
}

// ─── Email sablonok (1:1 másolat a JSX-ből) ────────────────────
const DEFAULT_EMAIL_TEMPLATES = {
  hu: {
    selfInvite: {
      subject: 'Önértékelési felkérés — [Projekt neve]',
      body: `Kedves [Keresztnév]!\n\n[Cég] stratégiájának részeként kiemelten fontosnak tartjuk, hogy a vezetők rendszeresen visszajelzést kapjanak saját vezetői működésükről. Ennek egyik hatékony eszköze a 360 fokos értékelés.\n\nEzzel a levéllel arra kérünk fel, hogy értékeld a saját vezetői működésedet!\n\nKérlek, hogy nyitottan, aktívan és felelősséggel vegyél részt ebben a felmérésben!\n\nHa bármiben tudunk támogatni a folyamat során, fordulj hozzánk bizalommal.\n\nElőre is köszönjük a közreműködésedet!\n[Tanácsadó neve]`,
    },
    peerInvite: {
      subject: 'Visszajelzési felkérés — [Értékelt neve]',
      body: `Kedves [Keresztnév]!\n\n[Értékelt neve] meghívott, hogy értékeld a vezetői működését.\n\n[Cég] stratégiájának részeként kiemelten fontosnak tartjuk, hogy a vezetők rendszeresen visszajelzést kapjanak több nézőpontból. Ezzel a levéllel Téged is felkérünk arra, hogy adj visszajelzést a kollégádnak!\n\nKérlek, hogy nyitottan, aktívan és felelősséggel vegyél részt ebben a felmérésben! A kitöltés anonim — az egyéni válaszokat nem adjuk tovább.\n\nElőre is köszönjük a közreműködésedet!\n[Tanácsadó neve]`,
    },
    reminder: {
      subject: 'Emlékeztető — [Projekt neve]',
      body: `Kedves [Keresztnév]!\n\nSzeretnénk emlékeztetni a folyamatban lévő 360 fokos vezetői felmérésre.\n\nA határidő: [Határidő]\nA kitöltés kb. 15 percet vesz igénybe.\n\nKérjük, hogy a következő napokban szánj időt a kérdőív kitöltésére.\n\nKöszönjük az együttműködésedet!\n[Tanácsadó neve]`,
    },
  },
  en: {
    selfInvite: {
      subject: 'Self-assessment invitation — [Projekt neve]',
      body: `Dear [Keresztnév],\n\nAs part of [Cég]'s strategy, we believe it is essential that leaders regularly receive feedback on their leadership. The 360-degree assessment is one of the most effective tools for this.\n\nWe invite you to assess your own leadership!\n\nPlease participate openly, actively and responsibly in this survey.\n\nIf you need any support during the process, please don't hesitate to reach out.\n\nThank you in advance for your contribution!\n[Tanácsadó neve]`,
    },
    peerInvite: {
      subject: 'Feedback invitation — [Értékelt neve]',
      body: `Dear [Keresztnév],\n\n[Értékelt neve] has invited you to provide feedback on their leadership.\n\nAs part of [Cég]'s strategy, we invite you to give feedback to your colleague through our 360-degree leadership assessment. Responses are anonymous.\n\nPlease participate openly and honestly.\n\nThank you in advance for your contribution!\n[Tanácsadó neve]`,
    },
    reminder: {
      subject: 'Reminder — [Projekt neve]',
      body: `Dear [Keresztnév],\n\nWe would like to remind you of the ongoing 360-degree leadership assessment.\n\nDeadline: [Határidő]\nThe survey takes approximately 15 minutes.\n\nPlease take the time to complete the questionnaire in the coming days.\n\nThank you for your cooperation!\n[Tanácsadó neve]`,
    },
  },
};

function renderTemplate(template, vars) {
  return template
    .replace(/\[Keresztnév\]/g,     vars.firstName       || '')
    .replace(/\[Cég\]/g,            vars.company         || '')
    .replace(/\[Értékelt neve\]/g,  vars.participantName || '')
    .replace(/\[Tanácsadó neve\]/g, vars.consultantName  || '')
    .replace(/\[Projekt neve\]/g,   vars.projectName     || '')
    .replace(/\[Határidő\]/g,       vars.deadline        || '…');
}

// ─── Email HTML builder ────────────────────────────────────────
function buildEmailContent({ rater, part, project, consultantName, templateKey }) {
  const lang    = project.emailLang || 'hu';
  const tmpls   = (project.emailTemplates && project.emailTemplates[lang]) || DEFAULT_EMAIL_TEMPLATES[lang];

  // Spec: ha role===self és templateKey===peerInvite → selfInvite
  const resolvedKey = (rater.role === 'self' && templateKey === 'peerInvite') ? 'selfInvite' : templateKey;
  const tmpl = tmpls[resolvedKey];
  if (!tmpl) return null;

  const partName = part ? `${part.firstName || ''} ${part.lastName || ''}`.trim() : '';
  const emailTo  = rater.email || (rater.role === 'self' ? part?.email : null);
  if (!emailTo) return null;

  const vars = {
    firstName:       rater.firstName    || '',
    participantName: partName,
    code:            rater.code,
    company:         project.client     || project.name || '',
    consultantName:  consultantName     || '',
    projectName:     project.name       || '',
  };

  const subject  = renderTemplate(tmpl.subject, vars);
  const bodyText = renderTemplate(tmpl.body,    vars);
  const surveyUrl = `https://www.ledge.news/360?code=${rater.code}`;

  const html = `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#1A1A18;">
    <div style="text-align:center;margin-bottom:28px;">
      <span style="font-family:Georgia,serif;font-size:16px;color:#8A8478;letter-spacing:.04em;">LEDGE <span style="color:#A68542">360°</span></span>
    </div>
    ${bodyText.split('\n\n').map(p =>
      `<p style="font-size:15px;line-height:1.7;color:#4A4A48;margin:0 0 18px;">${p.replace(/\n/g,'<br>')}</p>`
    ).join('')}
    <div style="text-align:center;margin:32px 0;">
      <a href="${surveyUrl}" style="display:inline-block;background:#A68542;color:#fff;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:.02em;">
        Kérdőív kitöltése →
      </a>
    </div>
    <div style="background:#F5F3EF;border:1px solid #E2DED6;border-radius:10px;padding:16px 20px;margin:24px 0;text-align:center;">
      <div style="font-size:12px;color:#8A8478;margin-bottom:6px;">Azonosítód</div>
      <div style="font-family:monospace;font-size:20px;font-weight:700;letter-spacing:.15em;color:#A68542;">${rater.code}</div>
    </div>
    <hr style="border:none;border-top:1px solid #E2DED6;margin:28px 0;">
    <p style="font-size:11px;color:#C5C0B8;text-align:center;">LEDGE 360° — ZEL Group · Bizalmas értékelési rendszer</p>
  </div>`;

  return { subject, html, to: emailTo };
}

// ─── POST handler ──────────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { projectId, consultantName } = body;

    if (!projectId) {
      return Response.json({ error: 'projectId kötelező' }, { status: 400 });
    }

    // 1. Projekt lekérés + aktiválás
    const project = await dbGet(projectId);
    if (!project) {
      return Response.json({ error: 'Projekt nem található' }, { status: 404 });
    }

    const updatedProject = { ...project, status: 'active' };
    const saved = await dbSet(projectId, updatedProject);
    if (!saved) {
      return Response.json({ error: 'DB mentési hiba — projekt státusz nem frissült' }, { status: 500 });
    }

    // 2. Összes rater lekérése ehhez a projekthez
    const ratKeys = await dbList('rat:');
    const allRatData = await Promise.all(ratKeys.map(k => dbGet(k)));
    const projectRaters = allRatData
      .map((r, i) => r ? { ...r, _key: ratKeys[i] } : null)
      .filter(r => r && r.projectId === projectId);

    if (projectRaters.length === 0) {
      return Response.json({ ok: true, sent: 0, errors: [], note: 'Nincs értékelő a projektben' });
    }

    // 3. Résztvevők lekérése (map: participantId → part)
    const partKeys = await dbList('part:');
    const allPartData = await Promise.all(partKeys.map(k => dbGet(k)));
    const partMap = {};
    allPartData.forEach(p => {
      if (p && p.projectId === projectId) {
        // indexelés id mező alapján (pl. "part:xxxx")
        if (p.id)       partMap[p.id]       = p;
        // indexelés key alapján is
      }
    });
    // Fallback: indexelés kulcs alapján
    allPartData.forEach((p, i) => {
      if (p && p.projectId === projectId) partMap[partKeys[i]] = p;
    });

    // 4. Email küldés minden raternek emailcímmel
    const sent   = [];
    const errors = [];

    for (const rater of projectRaters) {
      const part        = partMap[rater.participantId] || partMap[rater.participantId?.replace('part:', '')] || null;
      const templateKey = rater.role === 'self' ? 'selfInvite' : 'peerInvite';
      const emailData   = buildEmailContent({ rater, part, project: updatedProject, consultantName, templateKey });

      if (!emailData) {
        // Nincs emailcím vagy sablon → naplózzuk, nem hiba
        if (!rater.email && rater.role !== 'self') {
          errors.push({ id: rater._key, reason: 'no_email' });
        }
        continue;
      }

      try {
        const { error: resendError } = await resend.emails.send({
          from: 'LEDGE 360° <noreply@ledge.news>',
          to:   [emailData.to],
          subject: emailData.subject,
          html:    emailData.html,
        });

        if (resendError) {
          console.error('[activate-project] Resend hiba:', rater._key, resendError);
          errors.push({ id: rater._key, reason: resendError.message });
        } else {
          // Rater rekord frissítése: email_sent + timestamp
          await dbSet(rater._key, {
            ...rater,
            _key:          undefined,  // ne mentse el a belső mezőt
            email_sent:    true,
            email_sent_at: Date.now(),
          });
          sent.push(rater._key);
        }
      } catch (e) {
        console.error('[activate-project] Küldési kivétel:', rater._key, e.message);
        errors.push({ id: rater._key, reason: e.message });
      }
    }

    return Response.json({
      ok:     true,
      sent:   sent.length,
      errors,
    });

  } catch (e) {
    console.error('[activate-project] Szerver hiba:', e);
    return Response.json({ error: 'Belső szerver hiba: ' + e.message }, { status: 500 });
  }
}
