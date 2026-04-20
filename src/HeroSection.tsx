import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Hero — editorial, asymmetric, typographic.
 *
 * Not a "name + tagline + 3 buttons" arrangement. Instead:
 *   1. three-line credo with three distinct type treatments:
 *        line 1  Fraunces display, opsz 144, SOFT 30
 *        line 2  Instrument Serif italic — the pair voice
 *        line 3  Fraunces display, WONK 1, SOFT 85 — the flourish
 *   2. short tight sub-paragraph with a real italic pair.
 *   3. one primary CTA + one inline secondary link (GitHub).
 *   4. thin scroll-rule bottom-left with subtle animation.
 *
 * Right column is intentionally empty — negative space is the point.
 */
export default function HeroSection() {
  const navigate = useNavigate()
  const [scrollDone, setScrollDone] = useState(false)

  /* Fade the scroll hint out once the user actually scrolls past it.
     Unsubscribe as soon as it fires — the listener has nothing else to do. */
  useEffect(() => {
    if (scrollDone) return
    const onScroll = () => {
      if (window.scrollY > 80) setScrollDone(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [scrollDone])

  return (
    <section className="hero-section">
      <div className="container hero-grid">
        {/* The headline — three lines, three type treatments */}
        <h1 className="hero-headline">
          <span className="hero-line hero-line--1">Small models,</span>
          <span className="hero-line hero-line--2">
            <em>sharp</em> questions,
          </span>
          <span className="hero-line hero-line--3">honest benchmarks.</span>
        </h1>

        {/* Sub — one narrow paragraph, with an actual italic pair */}
        <p className="hero-sub">math and cs at wqpi!</p>

        {/* One primary CTA, one inline GitHub link — no three-button drawer */}
        <div className="hero-actions">
          <button
            className="btn btn-primary hero-cta"
            onClick={() => navigate('/research')}
          >
            Read the research
            <svg
              className="hero-cta-arrow"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
          <a
            className="btn btn-outline hero-github"
            href="https://github.com/jake-molnia"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.2-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.7.2 3 .1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.1.9 2.3v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
            </svg>
            GitHub
          </a>
        </div>

        {/* Scroll hint — thin rule + mono label, bottom-left */}
        <div
          className={`hero-scroll ${scrollDone ? 'hero-scroll--done' : ''}`}
          aria-hidden
        >
          <span className="hero-scroll-rule" />
          <span className="hero-scroll-label">keep reading</span>
        </div>
      </div>
    </section>
  )
}
