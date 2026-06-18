'use client';
// ============================================================
// LEDGE — Measurement (assessment hub)
// app/measurement/page.js
//
// A hub that links out to standalone measurement apps.
// Each app opens in a new tab (external URL). Add new tools
// by appending to the TOOLS array below.
// ============================================================


const C = {
  blue: '#1a2b4a', slate: '#6b7b8d', copper: '#b87333',
  paper: '#f7f6f3', ink: '#222', line: 'rgba(26,43,74,0.10)',
};

// ── The measurement apps ───────────────────────────────────────
// To add a new tool later: copy a block, change the fields.
// status: 'live' shows an "Open →" action; 'soon' shows a muted badge.
const TOOLS = [
  {
    id: 'ledge360',
    name: 'Ledge 360°',
    tagline: 'Leadership 360-degree assessment',
    description:
      'AI-powered leadership assessment that goes beyond questionnaires. Collect structured feedback, map blind spots across all eight dimensions, and get a development roadmap grounded in real data.',
    tag: 'B2B · 29 EUR/mo',
    url: 'https://ledge360.online',
    status: 'live',
  },
  {
    id: 'vezetoi-jollet',
    name: 'Vezetői Jóllét',
    tagline: 'Vezetői jóllét-szűrés',
    description:
      'Gyors önszűrés vezetőknek: felméri a terhelést, a kiégés korai jeleit és az erőforrásokat. Néhány perc alatt kitölthető, és személyes visszajelzést ad arról, hol érdemes odafigyelni.',
    tag: 'Magyar nyelvű',
    url: 'https://vezetoi-jollet.app',
    status: 'live',
  },
  // Example placeholder for a future tool — remove or edit freely:
  // {
  //   id: 'team-pulse',
  //   name: 'Team Pulse',
  //   tagline: 'Lightweight team climate check',
  //   description: 'A short, recurring pulse survey for team health and engagement.',
  //   tag: 'Coming soon',
  //   url: '',
  //   status: 'soon',
  // },
];

export default function MeasurementPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.ink }}>
      

      {/* Hero */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '3rem 1.5rem 1.5rem' }}>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: C.copper, marginBottom: '0.75rem' }}>
          Measurement
        </p>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 600, lineHeight: 1.05, color: C.blue, margin: 0, maxWidth: 760, letterSpacing: '-0.02em' }}>
          Tools that put numbers on leadership.
        </h1>
        <p style={{ fontSize: '1.05rem', color: C.slate, marginTop: '1rem', maxWidth: 620, lineHeight: 1.5 }}>
          Assessment instruments that turn judgement, feedback, and behaviour into data you can act on. Each opens in its own workspace.
        </p>
      </section>

      {/* Tools grid */}
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '1.5rem 1.5rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {TOOLS.map(tool => {
            const card = (
              <article style={{
                backgroundColor: '#fff', border: `1px solid ${C.line}`, borderRadius: 12,
                borderLeft: `3px solid ${C.copper}`, padding: '1.5rem', height: '100%',
                boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
                opacity: tool.status === 'soon' ? 0.7 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: C.slate, fontWeight: 600 }}>
                    {tool.tagline}
                  </span>
                </div>
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: C.blue, margin: '0 0 0.75rem', lineHeight: 1.15 }}>
                  {tool.name}
                </h2>
                <p style={{ fontSize: '0.9rem', color: C.slate, lineHeight: 1.55, margin: '0 0 1.25rem', flexGrow: 1 }}>
                  {tool.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.7rem', letterSpacing: '0.04em', color: C.copper, border: `1px solid ${C.copper}`, borderRadius: 4, padding: '0.15rem 0.5rem', fontWeight: 600 }}>
                    {tool.tag}
                  </span>
                  {tool.status === 'live'
                    ? <span style={{ marginLeft: 'auto', color: C.copper, fontWeight: 600, fontSize: '0.85rem' }}>Open ↗</span>
                    : <span style={{ marginLeft: 'auto', color: C.slate, fontSize: '0.8rem' }}>Coming soon</span>}
                </div>
              </article>
            );
            return tool.status === 'live' && tool.url ? (
              <a key={tool.id} href={tool.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                {card}
              </a>
            ) : (
              <div key={tool.id}>{card}</div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
