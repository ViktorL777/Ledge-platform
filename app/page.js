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
