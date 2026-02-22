'use client'

import { useState } from 'react'

function TopoBg() {
  return (
    <div className="topo-bg">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#1a2b4a" strokeWidth="1">
          <path d="M0,180 Q360,120 720,200 T1440,160"/>
          <path d="M0,240 Q360,180 720,260 T1440,220"/>
          <path d="M0,300 Q400,250 800,320 T1440,280"/>
          <path d="M0,370 Q350,310 700,380 T1440,350"/>
          <path d="M0,440 Q380,400 760,460 T1440,420"/>
          <path d="M0,510 Q340,470 680,530 T1440,490"/>
          <path d="M0,580 Q400,540 800,600 T1440,560"/>
          <path d="M0,650 Q360,610 720,670 T1440,640"/>
          <path d="M0,720 Q380,680 760,740 T1440,710"/>
          <path d="M0,790 Q350,760 700,810 T1440,780"/>
        </g>
      </svg>
    </div>
  )
}

function Nav() {
  return (
    <nav>
      <a href="#" className="nav-logo">
        <span className="l-mark">L</span>edge
        <span className="nav-beta">Beta</span>
      </a>
      <div className="nav-links">
        <a href="#news">News</a>
        <a href="#chess">Leadership Chess</a>
        <a href="#learn">Learn</a>
        <a href="#coach">AI Coach</a>
        <a href="#subscribe">Subscribe</a>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-wordmark">
        <span className="l-mark">L</span>edge
      </div>
      <div className="hero-tagline">
        See further.&ensp;Lead smarter.&ensp;Balance uncertainty.
      </div>
      <div className="hero-divider"></div>
      <div className="hero-descriptor">
        Sharpens leadership judgement<br />
        in the age of intelligent technologies.
      </div>
      <div className="hero-scroll-hint">
        <span>Explore</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  )
}

function Pillars() {
  return (
    <section className="pillars-section" id="news">
      <div className="section-inner">
        <div className="section-label">The promise</div>
        <div className="section-title">Leadership intelligence,<br />delivered daily.</div>
        <div className="section-text">
          AI-curated news, interactive case studies, and an intelligent coaching engine —
          all calibrated to sharpen how leaders think, decide, and act.
        </div>
        <div className="pillars-grid">
          <div className="pillar">
            <div className="pillar-number">01</div>
            <div className="pillar-title">See further</div>
            <div className="pillar-text">
              AI filters thousands of global sources daily, surfacing only what
              matters for leadership in the age of intelligent technologies.
              Not more noise — better signal.
            </div>
          </div>
          <div className="pillar">
            <div className="pillar-number">02</div>
            <div className="pillar-title">Lead smarter</div>
            <div className="pillar-text">
              Test your judgement against history&apos;s most consequential leadership
              decisions. Learn from the patterns that separate breakthrough
              decisions from catastrophic ones.
            </div>
          </div>
          <div className="pillar">
            <div className="pillar-number">03</div>
            <div className="pillar-title">Balance uncertainty</div>
            <div className="pillar-text">
              An AI coaching engine that doesn&apos;t give answers — it sharpens
              your questions. Because in the age of AI, the quality of your
              thinking is your only sustainable advantage.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="chess">
      <div className="section-inner">
        <div className="section-label">Platform</div>
        <div className="section-title">Five engines.<br />One daily habit.</div>
        <div className="section-text">
          Each feature is designed to create a reason to return —
          and a reason to share.
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
              </svg>
            </div>
            <div className="feature-title">The Daily Ledge</div>
            <div className="feature-text">
              AI-curated leadership news across eight dimensions — from strategy and
              technology to culture and self-mastery. Each article gets a Leadership
              Angle: a provocative take you won&apos;t find elsewhere.
            </div>
            <span className="feature-tag">Daily · Automated</span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                <path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4"/>
              </svg>
            </div>
            <div className="feature-title">Leadership Chess</div>
            <div className="feature-text">
              Historical leadership dilemmas presented as interactive decision challenges.
              Read the scenario, make your call, then discover what the real leader
              decided — and what happened next.
            </div>
            <span className="feature-tag">Interactive · Shareable</span>
          </div>

          <div className="feature-card" id="learn">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
              </svg>
            </div>
            <div className="feature-title">Explain in 5 Minutes</div>
            <div className="feature-text">
              Every core leadership concept explained at four levels:
              high school, university, expert, and practitioner.
              The right depth for every audience.
            </div>
            <span className="feature-tag">Library · 4 Levels</span>
          </div>

          <div className="feature-card" id="coach">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                <circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/>
              </svg>
            </div>
            <div className="feature-title">Ask Ledge</div>
            <div className="feature-text">
              An AI leadership coach with six specialist agents — from
              strategic thinking to personal resilience. Not generic advice.
              A thinking partner that challenges your assumptions.
            </div>
            <span className="feature-tag">AI Coach · Coming Phase 2</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Dimensions() {
  const dimensions = [
    { name: 'Meaning Maker', desc: 'Purpose, values, philosophy, ethics' },
    { name: 'Strategy', desc: 'Business strategy, competitive moves' },
    { name: 'New Technologies', desc: 'AI, robotics, quantum, biotech' },
    { name: 'Operations', desc: 'Process innovation, automation' },
    { name: 'People & Teams', desc: 'Talent, interpersonal dynamics' },
    { name: 'Culture', desc: 'Org culture, DEI, experience' },
    { name: 'Self-Mastery', desc: 'Resilience, mindset, growth' },
    { name: 'Change', desc: 'Transformation, M&A, disruption' },
  ]

  return (
    <section style={{ background: 'var(--off-white)' }}>
      <div className="section-inner">
        <div className="section-label">Coverage</div>
        <div className="section-title">Eight dimensions of<br />leadership intelligence.</div>
        <div className="section-text">
          Every day, AI scans hundreds of global sources and classifies
          what matters across the full spectrum of leadership practice.
        </div>
        <div className="sections-grid">
          {dimensions.map((dim) => (
            <div className="stoic-card" key={dim.name}>
              <div className="stoic-dot"></div>
              <div className="stoic-name">{dim.name}</div>
              <div className="stoic-desc">{dim.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="cta-section" id="subscribe">
      <div className="section-label" style={{ color: 'var(--copper)' }}>Early Access</div>
      <h2 className="cta-title">The Daily Ledge launches soon.</h2>
      <p className="cta-text">
        Join the early access list to be first to play Leadership Chess,
        explore the AI-curated news, and shape the platform as a founding member.
      </p>
      <form className="cta-form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="cta-input"
          placeholder="Your email address"
          required
          disabled={submitted}
        />
        <button type="submit" className="cta-button">
          {submitted ? 'Thank you.' : 'Join the Ledge'}
        </button>
      </form>
      <p className="cta-note">No spam. Unsubscribe anytime. We respect your attention.</p>
    </section>
  )
}

function Footer() {
  return (
    <footer>
      <div className="footer-logo">Ledge</div>
      <div className="footer-text">&copy; 2026 Ledge. All rights reserved.</div>
      <div className="footer-links">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Contact</a>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <>
      <TopoBg />
      <Nav />
      <Hero />
      <Pillars />
      <Features />
      <Dimensions />
      <CTA />
      <Footer />
    </>
  )
}
