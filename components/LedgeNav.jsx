'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ============================================================
// LedgeNav — Global navigation component
// Shows on all pages. Logo links back to homepage.
// Hides automatically on the homepage (/).
// Brand: Fraunces + DM Sans, deep blue + copper
// ============================================================

export default function LedgeNav() {
  const pathname = usePathname();

  // Don't render on the homepage — it has its own full-page nav
  if (pathname === '/') return null;

  return (
    <>
      {/* Google Fonts — same as landing page */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:wght@300;400;500;600;700&display=swap');
      `}</style>

      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '1.25rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(247, 246, 243, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(26, 43, 74, 0.07)',
        }}
      >
        {/* Logo — links to homepage */}
        <Link
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
          <span
            style={{
              display: 'inline-block',
              borderBottom: '2.5px solid #b87333',
              paddingBottom: '1px',
              marginRight: '-1px',
            }}
          >
            L
          </span>
          EDGE
        </Link>

        {/* Page-specific nav links */}
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <NavLink href="/chess" label="Chess" active={pathname.startsWith('/chess')} />
          <NavLink href="/learn" label="Learn" active={pathname.startsWith('/learn')} />
          <NavLink href="/coach" label="AI Coach" active={pathname.startsWith('/coach')} />
        </div>
      </nav>

      {/* Spacer — prevents content from sliding under the fixed nav */}
      <div style={{ height: '72px' }} />
    </>
  );
}

// ──────────────────────────────────────────────
// NavLink — individual nav item
// ──────────────────────────────────────────────

function NavLink({ href, label, active }) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: active ? '#1a2b4a' : '#6b7b8d',
        textDecoration: 'none',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        borderBottom: active ? '1.5px solid #b87333' : '1.5px solid transparent',
        paddingBottom: '2px',
        transition: 'color 0.2s, border-color 0.2s',
      }}
    >
      {label}
    </Link>
  );
}
