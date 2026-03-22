'use client';

import dynamic from 'next/dynamic';

const Ledge360App = dynamic(
  () => import('@/components/Ledge360App'),
  { 
    ssr: false,
    loading: () => (
      <div style={{
        minHeight: '100vh',
        background: '#f7f6f3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
        color: '#6b7b8d'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#1a2b4a', color: '#f7f6f3',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Fraunces', serif", fontSize: 20, marginBottom: 12
          }}>L</div>
          <div style={{ fontSize: 14 }}>Loading 360° Assessment...</div>
        </div>
      </div>
    )
  }
);

export default function AssessmentPage() {
  return <Ledge360App />;
}
