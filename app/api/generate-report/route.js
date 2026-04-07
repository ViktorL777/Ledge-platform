// ═══════════════════════════════════════════════════════════════
// LEDGE 360° — /api/generate-report · Anthropic AI riport
// Native fetch — nem kell @anthropic-ai/sdk npm csomag
// ═══════════════════════════════════════════════════════════════

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

function dimAvgFromObj(scores, dim) {
  const vals = dim.items.map(i => scores[i.id]).filter(v => v && v > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

function formatDimsData({ dims, selfAvg, peerAvg, scaleMax }) {
  if (!dims || !dims.length) return 'Nincs adat.';
  const max = scaleMax || 5;
  return dims.map(d => {
    const sv = selfAvg ? dimAvgFromObj(selfAvg, d) : null;
    const pv = peerAvg ? dimAvgFromObj(peerAvg, d) : null;
    const lines = [`${d.label || d.id} (1-${max} skála)`];
    if (sv) lines.push(`  Önértékelés átlag: ${sv.toFixed(1)}`);
    if (pv) lines.push(`  Értékelők átlaga: ${pv.toFixed(1)}`);
    d.items.forEach(item => {
      const s = selfAvg && selfAvg[item.id] ? Number(selfAvg[item.id]).toFixed(1) : '—';
      const p = peerAvg && peerAvg[item.id] ? Number(peerAvg[item.id]).toFixed(1) : '—';
      lines.push(`  • ${item.text}: Én ${s} / Értékelők ${p}`);
    });
    return lines.join('\n');
  }).join('\n\n');
}

const GROUP_SYSTEM = `Te egy tapasztalt szervezetfejlesztési tanácsadó és executive coach vagy, aki 360°-os értékelési adatokat elemez.

Csoportriportot készítesz, amelyben:
- Soha nem használsz személyes neveket vagy azonosítókat
- Azonosítod a csoport kollektív erősségeit és fejlesztési területeit
- Mintázatokat, összefüggéseket emelsz ki az adatokból
- Stratégiai, szervezetszintű javaslatokat adsz
- Konstruktív, szakmai és empatikus hangnemet használsz
- MINDIG magyarul írsz
- Strukturált formátumot használsz markdown-ban: ## Összefoglaló, ## Csoporterősségek, ## Fejlesztési területek, ## Stratégiai javaslatok
- Konkrét számokat idézed az elemzésben`;

const INDIVIDUAL_SYSTEM = `Te egy tapasztalt executive coach vagy, aki 360°-os értékelési eredmények alapján személyes fejlesztési tervet készít és coaching párbeszédet folytat.

A fejlesztési tervben és a párbeszédben:
- Empatikus, motiváló és fejlesztésorientált hangnemet használsz
- Konkrét, cselekvésorientált javaslatokat adsz prioritás szerint
- Kiemeled az erősségeket, vak foltokat és rejtett erősségeket
- Az értékelt személy nevét természetesen használod
- MINDIG magyarul írsz
- Az első válaszban strukturált tervet adsz markdown-ban: ## Összefoglaló, ## Erősségeid, ## Fejlesztési területek, ## Konkrét javaslatok, ## Következő lépések
- A folytatásban rugalmasan válaszolsz, visszautalva az adatokra`;

async function callAnthropic(system, messages) {
  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 2000, system, messages }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

export async function POST(req) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { type, projectName, partName, dimsData, selfAvg, peerAvg, scaleMax, chatMessages, blindSpots, hiddenStr } = body;

  try {
    let text;

    if (type === 'group') {
      const formatted = formatDimsData({ dims: dimsData, selfAvg, peerAvg, scaleMax });
      text = await callAnthropic(GROUP_SYSTEM, [{
        role: 'user',
        content: `Projekt: ${projectName || 'LEDGE 360°'}\n\nAggregált csoporteredmények:\n\n${formatted}\n\nKészíts részletes csoportriportot a fenti adatok alapján.`
      }]);

    } else if (type === 'individual') {
      const formatted = formatDimsData({ dims: dimsData, selfAvg, peerAvg, scaleMax });
      const bsText = blindSpots && blindSpots.length
        ? `\nVak foltok (én jóval magasabbra értékelem magam): ${blindSpots.map(i => i.text).join(', ')}`
        : '';
      const hsText = hiddenStr && hiddenStr.length
        ? `\nRejtett erősségek (értékelőim jóval magasabbra értékelnek): ${hiddenStr.map(i => i.text).join(', ')}`
        : '';
      text = await callAnthropic(INDIVIDUAL_SYSTEM, [{
        role: 'user',
        content: `Értékelt: ${partName || 'Résztvevő'}\nProjekt: ${projectName || 'LEDGE 360°'}\n${bsText}${hsText}\n\nRészletes eredmények:\n\n${formatted}\n\nKészíts személyes fejlesztési tervet a fenti 360°-os visszajelzés alapján.`
      }]);

    } else if (type === 'chat') {
      if (!chatMessages || !chatMessages.length) {
        return Response.json({ error: 'Chat messages required' }, { status: 400 });
      }
      text = await callAnthropic(INDIVIDUAL_SYSTEM, chatMessages);

    } else {
      return Response.json({ error: 'Invalid type' }, { status: 400 });
    }

    return Response.json({ text });

  } catch (err) {
    console.error('generate-report error:', err);
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
