import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DIMENSION_INFO = {
  'Meaning-Maker': { emoji: '🧭', color: '#b87333' },
  'Strategist': { emoji: '♟️', color: '#1a2b4a' },
  'Tech-Savvy': { emoji: '⚡', color: '#4a90d9' },
  'Operator': { emoji: '⚙️', color: '#6b7b8d' },
  'Relationship-Weaver': { emoji: '🤝', color: '#8b6914' },
  'Culture-Architect': { emoji: '🏛️', color: '#7a5c3a' },
  'Self-Awareness': { emoji: '🪞', color: '#5a7a6a' },
  'Transformator': { emoji: '🔄', color: '#9a4a4a' },
};

export const revalidate = 300;

async function getArticles() {
  const { data, error } = await supabase
    .from('curated_articles')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch articles:', error.message);
    return [];
  }
  return data || [];
}

export default async function NewsPage() {
  const articles = await getArticles();

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#f7f6f3',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <header style={{
        backgroundColor: '#1a2b4a',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            color: '#f7f6f3',
            fontSize: '28px',
            margin: 0
          }}>
            Ledge <span style={{ color: '#b87333', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>news</span>
          </h1>
        </a>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <a href="/news" style={{ color: '#b87333', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>NEWS</a>
          <a href="/" style={{ color: '#f7f6f3', textDecoration: 'none', fontSize: '14px' }}>HOME</a>
        </nav>
      </header>

      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '36px',
          color: '#1a2b4a',
          marginBottom: '8px'
        }}>
          Leadership Intelligence
        </h2>
        <p style={{
          color: '#6b7b8d',
          fontSize: '16px',
          marginBottom: '40px'
        }}>
          Curated insights with the Leadership Angle. Updated daily.
        </p>

        {articles.length === 0 ? (
          <p style={{ color: '#6b7b8d' }}>No articles yet. Check back soon.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {articles.map((article) => {
              const dim = DIMENSION_INFO[article.primary_dimension] || { emoji: '📄', color: '#6b7b8d' };
              return (
                <article key={article.id} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '32px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  borderLeft: `4px solid ${dim.color}`
                }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{
                      backgroundColor: dim.color,
                      color: '#f7f6f3',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {dim.emoji} {article.primary_dimension}
                    </span>
                    {(article.related_dimensions || []).map((rd) => (
                      <span key={rd} style={{
                        backgroundColor: '#e8e6e1',
                        color: '#6b7b8d',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px'
                      }}>
                        {rd}
                      </span>
                    ))}
                  </div>

                  <h3 style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: '22px',
                    color: '#1a2b4a',
                    marginBottom: '8px',
                    lineHeight: 1.3
                  }}>
                    {article.title}
                  </h3>

                  <p style={{
                    color: '#6b7b8d',
                    fontSize: '13px',
                    marginBottom: '16px'
                  }}>
                    {article.source_name} {article.published_at && `· ${new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </p>

                  <div style={{
                    backgroundColor: '#faf9f6',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '16px',
                    borderLeft: '3px solid #b87333'
                  }}>
                    <p style={{
                      fontSize: '11px',
                      color: '#b87333',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '8px'
                    }}>
                      The Leadership Angle
                    </p>
                    <p style={{
                      color: '#1a2b4a',
                      fontSize: '15px',
                      lineHeight: 1.7
                    }}>
                      {article.leadership_angle}
                    </p>
                  </div>

                  <a href={article.article_url} target="_blank" rel="noopener noreferrer" style={{
                    color: '#b87333',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}>
                    Read original article →
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer style={{
        backgroundColor: '#1a2b4a',
        padding: '24px',
        textAlign: 'center',
        color: '#6b7b8d',
        fontSize: '13px',
        marginTop: '60px'
      }}>
        © 2026 Ledge · See further. Lead smarter. Balance uncertainty.
      </footer>
    </main>
  );
}
