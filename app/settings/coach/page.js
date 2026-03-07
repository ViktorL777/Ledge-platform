'use client';
import { useState } from 'react';

// ============================================================
// LEDGE — Coach Settings Page
// app/settings/coach/page.js
//
// Profile reset (2-step confirmation)
// Delete all data (2-step, 5-second delay)
// ============================================================

export default function CoachSettingsPage() {
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Reset state
  const [resetStep, setResetStep] = useState(0); // 0: idle, 1: confirm, 2: done
  const [isResetting, setIsResetting] = useState(false);

  // Delete state
  const [deleteStep, setDeleteStep] = useState(0); // 0: idle, 1: confirm, 2: countdown, 3: done
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLoadProfile = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setProfileError('Please enter a valid email address.');
      return;
    }
    setLoadingProfile(true);
    setProfileError('');
    try {
      const res = await fetch(`/api/coach/profile?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setEmailSubmitted(true);
      } else {
        setProfileError('No coaching profile found for this email.');
      }
    } catch {
      setProfileError('Could not load profile. Try again.');
    } finally {
      setLoadingProfile(false);
    }
  };

  // RESET — clears profile_summary + saboteurs + themes, keeps email + sessions_count
  const handleResetProfile = async () => {
    if (resetStep === 0) { setResetStep(1); return; }
    setIsResetting(true);
    try {
      const res = await fetch('/api/coach/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), action: 'reset_profile' }),
      });
      if (res.ok) {
        setResetStep(2);
        setProfile(prev => prev ? { ...prev, profile_summary: null, active_saboteurs: [], recurring_themes: [], growth_edges: [], last_commitment: null } : prev);
      }
    } catch { /* silent */ }
    finally { setIsResetting(false); }
  };

  // DELETE — wipes everything
  const startDelete = () => {
    if (deleteStep === 0) { setDeleteStep(1); return; }
    if (deleteStep === 1) {
      setDeleteStep(2);
      setDeleteCountdown(5);
      const interval = setInterval(() => {
        setDeleteCountdown(c => {
          if (c <= 1) { clearInterval(interval); return 0; }
          return c - 1;
        });
      }, 1000);
      return;
    }
  };

  const confirmDelete = async () => {
    if (deleteCountdown > 0) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/coach/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), confirmToken: 'DELETE_ALL' }),
      });
      if (res.ok) {
        setDeleteStep(3);
        setProfile(null);
      }
    } catch { /* silent */ }
    finally { setIsDeleting(false); }
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem',
    color: '#1a2b4a', backgroundColor: '#f7f6f3',
    border: '1.5px solid rgba(26,43,74,0.12)', borderRadius: '8px',
    outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
  };

  const sectionStyle = {
    backgroundColor: '#fff', borderRadius: '12px',
    border: '1px solid rgba(26,43,74,0.08)',
    padding: '1.75rem', marginBottom: '1rem',
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#f7f6f3',
      fontFamily: "'DM Sans', sans-serif", padding: '2rem 1.5rem',
    }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <a href="/coach" style={{ fontSize: '0.8rem', color: '#9ba8b5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.25rem' }}>
            ← Back to Coach
          </a>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.6rem', fontWeight: '600', color: '#1a2b4a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Coach Settings
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#6b7b8d', lineHeight: '1.6' }}>
            Manage your coaching profile and data. Your email is the only identifier — no account required.
          </p>
        </div>

        {/* Email lookup */}
        {!emailSubmitted ? (
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a2b4a', marginBottom: '0.5rem' }}>Find your profile</h2>
            <p style={{ fontSize: '0.82rem', color: '#6b7b8d', marginBottom: '1.25rem' }}>Enter the email you used to save your coaching profile.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLoadProfile()}
                placeholder="your@email.com"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={(e) => { e.target.style.borderColor = '#b87333'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(26,43,74,0.12)'; }}
              />
              <button
                onClick={handleLoadProfile}
                disabled={loadingProfile}
                style={{
                  backgroundColor: '#1a2b4a', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '0 1.25rem', fontSize: '0.88rem',
                  fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: 'nowrap',
                }}
              >
                {loadingProfile ? 'Loading...' : 'Load profile'}
              </button>
            </div>
            {profileError && <p style={{ fontSize: '0.78rem', color: '#e05a5a', marginTop: '0.5rem' }}>{profileError}</p>}
          </div>
        ) : (
          <>
            {/* Profile overview */}
            {profile && (
              <div style={sectionStyle}>
                <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a2b4a', marginBottom: '1rem' }}>Your profile</h2>
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {[
                    ['Email', email],
                    ['Sessions', profile.sessions_count || 0],
                    ['Last session', profile.last_session ? new Date(profile.last_session).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'],
                    ['Preferred mode', profile.preferred_mode || '—'],
                    ['Communication style', profile.communication_style || '—'],
                    ['Active challenges', profile.key_challenges?.join(', ') || '—'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', gap: '1rem', fontSize: '0.84rem' }}>
                      <span style={{ color: '#9ba8b5', minWidth: '140px' }}>{label}</span>
                      <span style={{ color: '#1a2b4a', fontWeight: '500' }}>{String(value)}</span>
                    </div>
                  ))}
                </div>
                {profile.profile_summary && (
                  <div style={{ marginTop: '1.25rem', padding: '0.875rem', backgroundColor: '#f7f6f3', borderRadius: '8px', borderLeft: '3px solid #b87333' }}>
                    <p style={{ fontSize: '0.78rem', color: '#9ba8b5', marginBottom: '0.3rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Coach summary</p>
                    <p style={{ fontSize: '0.85rem', color: '#1a2b4a', lineHeight: '1.6', fontStyle: 'italic' }}>{profile.profile_summary}</p>
                  </div>
                )}
              </div>
            )}

            {/* RESET PROFILE */}
            <div style={sectionStyle}>
              <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a2b4a', marginBottom: '0.5rem' }}>Reset coaching profile</h2>
              <p style={{ fontSize: '0.82rem', color: '#6b7b8d', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                Clears your accumulated insights, patterns, and commitments. Your session history is kept. Use this if you feel the Coach's read of you is outdated.
              </p>

              {resetStep === 0 && (
                <button onClick={handleResetProfile} style={{ backgroundColor: 'transparent', border: '1.5px solid rgba(26,43,74,0.2)', borderRadius: '8px', padding: '0.65rem 1.25rem', fontSize: '0.88rem', color: '#1a2b4a', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>
                  Reset profile
                </button>
              )}

              {resetStep === 1 && (
                <div style={{ backgroundColor: 'rgba(26,43,74,0.04)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#1a2b4a', marginBottom: '1rem', lineHeight: '1.5' }}>
                    Are you sure? This will remove all accumulated insights about your leadership patterns. Your conversation history will be kept, but the Coach will start building a fresh read of you.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleResetProfile} disabled={isResetting} style={{ backgroundColor: '#1a2b4a', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      {isResetting ? 'Resetting...' : 'Yes, reset profile'}
                    </button>
                    <button onClick={() => setResetStep(0)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(26,43,74,0.15)', borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#6b7b8d', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {resetStep === 2 && (
                <div style={{ backgroundColor: 'rgba(184,115,51,0.06)', border: '1px solid rgba(184,115,51,0.2)', borderRadius: '8px', padding: '0.875rem 1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#b87333', fontWeight: '600' }}>Profile reset. The Coach will build a fresh read starting from your next session.</p>
                </div>
              )}
            </div>

            {/* DELETE ALL DATA */}
            <div style={{ ...sectionStyle, borderColor: 'rgba(224,90,90,0.15)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a2b4a', marginBottom: '0.5rem' }}>Delete all my data</h2>
              <p style={{ fontSize: '0.82rem', color: '#6b7b8d', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                Permanently removes your profile and all associated session data. This cannot be undone.
              </p>

              {deleteStep === 0 && (
                <button onClick={startDelete} style={{ backgroundColor: 'transparent', border: '1.5px solid rgba(224,90,90,0.4)', borderRadius: '8px', padding: '0.65rem 1.25rem', fontSize: '0.88rem', color: '#e05a5a', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>
                  Delete all my data
                </button>
              )}

              {deleteStep === 1 && (
                <div style={{ backgroundColor: 'rgba(224,90,90,0.04)', border: '1px solid rgba(224,90,90,0.15)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#1a2b4a', marginBottom: '1rem', lineHeight: '1.5' }}>
                    This will permanently delete your coaching profile, all accumulated insights, and unlink all session history from your email. <strong>This cannot be undone.</strong>
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={startDelete} style={{ backgroundColor: '#e05a5a', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      I understand, continue
                    </button>
                    <button onClick={() => setDeleteStep(0)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(26,43,74,0.15)', borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#6b7b8d', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {deleteStep === 2 && (
                <div style={{ backgroundColor: 'rgba(224,90,90,0.04)', border: '1px solid rgba(224,90,90,0.15)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#1a2b4a', marginBottom: '1rem', lineHeight: '1.5', fontWeight: '500' }}>
                    Final confirmation: This cannot be undone. Your conversation history will be kept anonymized, but your profile and all personal data will be deleted.
                  </p>
                  <button
                    onClick={confirmDelete}
                    disabled={deleteCountdown > 0 || isDeleting}
                    style={{
                      backgroundColor: deleteCountdown > 0 ? '#c8d0d8' : '#e05a5a',
                      color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '0.65rem 1.5rem', fontSize: '0.88rem',
                      fontWeight: '600', cursor: deleteCountdown > 0 ? 'not-allowed' : 'pointer',
                      fontFamily: "'DM Sans', sans-serif", transition: 'background-color 0.3s',
                    }}
                  >
                    {isDeleting ? 'Deleting...' : deleteCountdown > 0 ? `Confirm delete (${deleteCountdown}s)` : 'Confirm delete'}
                  </button>
                  <button onClick={() => setDeleteStep(0)} style={{ marginLeft: '0.75rem', backgroundColor: 'transparent', border: 'none', fontSize: '0.82rem', color: '#9ba8b5', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    Cancel
                  </button>
                </div>
              )}

              {deleteStep === 3 && (
                <div style={{ backgroundColor: 'rgba(26,43,74,0.04)', borderRadius: '8px', padding: '0.875rem 1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#1a2b4a', fontWeight: '600' }}>All data deleted. Your profile has been permanently removed.</p>
                  <a href="/coach" style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.82rem', color: '#b87333', textDecoration: 'none' }}>
                    Return to Coach →
                  </a>
                </div>
              )}
            </div>

            {/* Privacy note */}
            <div style={{ padding: '0 0.25rem', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#9ba8b5', lineHeight: '1.6' }}>
                Your coaching conversations are encrypted at rest in Supabase. Ledge never sells or shares your data. Session data is linked to your email only when you explicitly save your profile.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
