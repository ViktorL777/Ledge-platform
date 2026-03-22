'use client';

// ═══════════════════════════════════════════════════════════════
// LEDGE — Global Navigation Bar
// ═══════════════════════════════════════════════════════════════
// Appears on every page. Logo links to home.
// Updated: added 360° Assessment link + all engines
// ═══════════════════════════════════════════════════════════════

import { usePathname } from 'next/navigation';

const linkStyle = (isActive) => ({
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: isActive ? '#1a2b4a' : '#6b7b8d',
  textDecoration: 'none',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  borderBottom: isActive ? '1.5px solid #b87333' : '1.5px solid transparent',
  paddingBottom: '2px',
  transition: 'color 0.2s, border-color 0.2s',
});

export default function LedgeNav() {
  const pathname = usePathname();

  const links = [
    { href: '/news',  label: 'News' },
    { href: '/chess', label: 'Chess' },
    { href: '/learn', label: 'Learn' },
    { href: '/coach', label: 'Coach' },
    { href: '/board', label: 'Board' },
    { href: '/360',   label: '360°' },
  ];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '1.25rem 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(247, 246, 243, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(26, 43, 74, 0.07)',
      }}>
        <a
          href="/"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#1a2b4a',
            letterSpacing: '-0.02em',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          <span style={{
            display: 'inline-block',
            borderBottom: '2.5px solid #b87333',
            paddingBottom: '1px',
            marginRight: '-1px',
          }}>L</span>EDGE
        </a>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={linkStyle(pathname === href || (href !== '/' && pathname?.startsWith(href)))}
              onMouseEnter={(e) => {
                if (pathname !== href) {
                  e.target.style.color = '#1a2b4a';
                  e.target.style.borderBottomColor = '#b8733355';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== href) {
                  e.target.style.color = '#6b7b8d';
                  e.target.style.borderBottomColor = 'transparent';
                }
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
      <div style={{ height: '72px' }} />
    </>
  );
}
