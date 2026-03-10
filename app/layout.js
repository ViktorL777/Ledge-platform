import { Inter } from 'next/font/google';
import LedgeNav from '@/components/LedgeNav';
import './globals.css';

// ============================================================
// app/layout.js — Root layout
// LedgeNav renders on all pages EXCEPT the homepage (/).
// The homepage has its own full-screen nav — LedgeNav
// auto-hides when pathname === '/'.
// ============================================================

export const metadata = {
  title: 'Ledge — Leadership Intelligence',
  description: 'Sharpens leadership judgement in the age of intelligent technologies.',
  metadataBase: new URL('https://ledge.news'),
  openGraph: {
    title: 'Ledge — Leadership Intelligence',
    description: 'See further. Lead smarter. Balance uncertainty.',
    url: 'https://ledge.news',
    siteName: 'Ledge',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LedgeNav />
        {children}
      </body>
    </html>
  );
}
