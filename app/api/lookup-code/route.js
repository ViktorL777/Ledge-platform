// ═══════════════════════════════════════════════════════════════
// LEDGE 360° — /api/lookup-code · Next.js App Router
// ═══════════════════════════════════════════════════════════════
// Kód keresés szerver oldalon — megbízhatóbb, mint a kliens oldali
// db.list('rat:') loop. Egy DB lekérdezés az összes rat: kulcsra,
// szerver filtrálja a kódot → nincs N+1 kliens oldali kérés.
//
// Request:  POST { code: string }
// Response (talált):
//   { found: true, type: 'project'|'group',
//     rater: {...}, project: {...}, participant: {...} }
//   { found: true, type: 'group',
//     member: {...}, group: {...} }
// Response (nem talált):
//   { found: false, reason: 'invalid_code'|'db_error'|'not_found' }
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── DB helpers ────────────────────────────────────────────────
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

// Összes rat: kulcs + érték, egy lekérdezésben
async function fetchAllRats() {
  const { data, error } = await supabase
    .from('kv_store')
    .select('key, value')
    .like('key', 'rat:%');
  if (error || !data) return [];
  return data.map(row => {
    const v = typeof row.value === 'string'
      ? (() => { try { return JSON.parse(row.value); } catch { return null; } })()
      : row.value;
    return v ? { ...v, _key: row.key } : null;
  }).filter(Boolean);
}

// ─── POST handler ───────────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const raw  = body.code;

    if (!raw || String(raw).trim().length < 6) {
      return Response.json({ found: false, reason: 'invalid_code' }, { status: 400 });
    }

    const t = String(raw).trim().toUpperCase();

    // ── 1. Leader groups keresés ───────────────────────────────
    // leader_groups egy kulcs, a tagokat a members tömbben tárolja
    const groups = await dbGet('leader_groups');
    if (Array.isArray(groups)) {
      for (const g of groups) {
        const member = (g.members || []).find(m => m.code === t);
        if (member) {
          return Response.json({
            found:  true,
            type:   'group',
            member,
            group:  g,
          });
        }
      }
    }

    // ── 2. Projekt rater keresés ───────────────────────────────
    // Összes rat: egy DB roundtrip-ben → szerver filtrálja
    let allRats;
    try {
      allRats = await fetchAllRats();
    } catch (e) {
      console.error('[lookup-code] DB hiba:', e.message);
      return Response.json({ found: false, reason: 'db_error' }, { status: 503 });
    }

    const rater = allRats.find(r => r.code === t);
    if (!rater) {
      return Response.json({ found: false, reason: 'not_found' });
    }

    // Projekt + résztvevő párhuzamos lekérés
    const [project, participant] = await Promise.all([
      dbGet(rater.projectId ? 'proj:' + rater.projectId.replace(/^proj:/, '') : null),
      dbGet(rater.participantId),
    ]);

    // Ha a projectId már 'proj:xxx' formátumban van tárolva, próbáljuk közvetlenül is
    const proj = project || (rater.projectId ? await dbGet(rater.projectId) : null);

    // Rater status frissítés: pending → in_progress (ha még nem kész)
    // Ezt a kliens végzi el a navigáció előtt, hogy ne blokkolja a response-t
    // (a szerver visszaadja az adatokat, a kliens hív egy PATCH-et ha kell)

    return Response.json({
      found:       true,
      type:        'project',
      rater:       { ...rater, _key: undefined },
      raterKey:    rater._key,
      project:     proj,
      participant,
    });

  } catch (e) {
    console.error('[lookup-code] Szerver hiba:', e.message);
    return Response.json({ found: false, reason: 'db_error' }, { status: 503 });
  }
}

// ─── PATCH handler — status frissítés ─────────────────────────
// Kliens hívja miután a navigáció megtörtént: { raterKey, status }
export async function PATCH(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { raterKey, status } = body;

    if (!raterKey || !status) {
      return Response.json({ error: 'raterKey és status kötelező' }, { status: 400 });
    }

    const rater = await dbGet(raterKey);
    if (!rater) return Response.json({ error: 'Rater nem található' }, { status: 404 });

    // Csak pending → in_progress, ne írjuk felül a done státuszt
    if (rater.status === 'done') {
      return Response.json({ ok: true, status: 'done', note: 'már kész, nem módosítva' });
    }

    const { error } = await supabase
      .from('kv_store')
      .upsert(
        { key: raterKey, value: { ...rater, status }, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, status });

  } catch (e) {
    console.error('[lookup-code PATCH] Hiba:', e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
