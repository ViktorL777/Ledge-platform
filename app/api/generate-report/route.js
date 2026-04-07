// ═══════════════════════════════════════════════════════════════
// LEDGE 360° — /api/generate-report · Anthropic AI riport
// ═══════════════════════════════════════════════════════════════
// Típusok:
//   'group'      → csoportriport, nevek nélkül
//   'individual' → személyes fejlesztési terv
//   'chat'       → folytatás (conversation history-val)
// ═══════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Formálja az adatokat olvasható szöveggé a prompthoz
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
      const s = selfAvg && selfAvg[item.id] ? selfAvg[item.id].toFixed(1) : '—';
      const p = peerAvg && peerAvg[item.id] ? Number(peerAvg[item.id]).toFixed(1) : '—';
      lines.push(`  • ${item.text}: Én ${s} / Értékelők ${p}`);
    });
    return lines.join('\n');
  }).join('\n\n');
}

function dimAvgFromObj(scores, dim) {
  const vals = dim.items.map(i => scores[i.id]).filter(v => v > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

const GROUP_SYSTEM = `Te egy tapasztalt szervezetfejlesztési tanácsadó és executive coach vagy, aki 360°-os értékelési adatokat elemez.

Csoportriportot készítesz, amelyben:
- Soha nem használsz személyes neveket vagy azonosítókat
- Azonosítod a csoport kollektív erősségeit és fejlesztési területeit
- Mintázatokat, összefüggéseket emelsz ki az adatokból
- Stratégiai, szervezetszintű javaslatokat adsz
- Konstruktív, szakmai és empatikus hangnemet használsz
- MINDIG magyarul írsz
- Strukturált formátumot használsz: **Összefoglaló** | **Csoporterősségek** | **Fejlesztési területek** | **Stratégiai javaslatok**
- Konkrét számokat idézed az elemzésben (pl. "az együttműködés dimenzióban a csoport átlaga 3.8/5")`;

const INDIVIDUAL_SYSTEM = `Te egy tapasztalt executive coach vagy, aki 360°-os értékelési eredmények alapján személyes fejlesztési tervet készít és coaching párbeszédet folytat.

A fejlesztési tervben és a párbeszédben:
- Empatikus, motiváló és fejlesztésorientált hangnemet használsz
- Konkrét, cselekvésorientált javaslatokat adsz prioritás szerint
- Kiemeled az erősségeket (megerősítés), vak foltokat és rejtett erősségeket
- Az értékelt személy nevét természetesen használod
- MINDIG magyarul írsz
- Az első válaszban strukturált tervet adsz: **Összefoglaló** | **Erősségeid** | **Fejlesztési területek** | **Konkrét javaslatok** | **Következő lépések**
- A folytatásban (chat) rugalmasan válaszolsz a kérdésekre, visszautalva az adatokra`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  const { type, projectName, partName, dimsData, selfAvg, peerAvg, scaleMax, chatMessages, blindSpots, hiddenStr } = req.body;

  try {
    let system = '';
    let messages = [];

    if (type === 'group') {
      system = GROUP_SYSTEM;
      const formatted = formatDimsData({ dims: dimsData, selfAvg, peerAvg, scaleMax });
      messages = [{
        role: 'user',
        content: `Projekt: ${projectName || 'LEDGE 360°'}\n\nAggregált csoporteredmények:\n\n${formatted}\n\nKészíts részletes csoportriportot a fenti adatok alapján.`
      }];

    } else if (type === 'individual') {
      system = INDIVIDUAL_SYSTEM;
      const formatted = formatDimsData({ dims: dimsData, selfAvg, peerAvg, scaleMax });
      const bsText = blindSpots && blindSpots.length
        ? `\nVak foltok (én jóval magasabbra értékelem magam): ${blindSpots.map(i => i.text).join(', ')}`
        : '';
      const hsText = hiddenStr && hiddenStr.length
        ? `\nRejtett erősségek (értékelőim jóval magasabbra értékelnek): ${hiddenStr.map(i => i.text).join(', ')}`
        : '';
      messages = [{
        role: 'user',
        content: `Értékelt: ${partName || 'Résztvevő'}\nProjekt: ${projectName || 'LEDGE 360°'}\n${bsText}${hsText}\n\nRészletes eredmények:\n\n${formatted}\n\nKészíts személyes fejlesztési tervet a fenti 360°-os visszajelzés alapján.`
      }];

    } else if (type === 'chat') {
      system = INDIVIDUAL_SYSTEM;
      messages = chatMessages || [];
      if (!messages.length) return res.status(400).json({ error: 'Chat messages required' });

    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system,
      messages,
    });

    return res.status(200).json({ text: response.content[0].text });

  } catch (err) {
    console.error('generate-report error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
