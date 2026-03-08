import { useState } from 'react'
import NeuralCanvas from './NeuralCanvas'
import Papers from './Papers'
import Resume from './Resume'
import Blog from './Blog'

const TABS = ['Home', 'Research', 'Blog', 'Resume']

const TAB_ICONS = {
  Home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Research: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  Resume: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Blog: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
}

export default function App() {
  const [tab, setTab] = useState('Home')
  const activeIdx = TABS.indexOf(tab)

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }}>
        <defs>
          <filter id="glass-distortion" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.012" numOctaves="2" seed="42" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="1.5" result="blurred" />
            <feDisplacementMap in="SourceGraphic" in2="blurred" scale="18" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Desktop nav */}
      <nav className="nav">
        <span className="nav-logo">JRM</span>
        <div className="nav-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`nav-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile liquid-glass bottom nav */}
      <nav className="mobile-nav" style={{ '--active-idx': activeIdx }}>
        <div className="mobile-nav-pill" aria-hidden="true" />
        {TABS.map(t => (
          <button
            key={t}
            className={`mobile-nav-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            <span className="mobile-nav-icon">{TAB_ICONS[t]}</span>
            <span className="mobile-nav-label">{t}</span>
          </button>
        ))}
      </nav>

      {tab === 'Home' && (
        <div className="hero">
          <NeuralCanvas name="Jacob Molnia" />
          <div className="hero-content">
            <div className="hero-role">Masters Student · ML Systems · WPI</div>
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setTab('Research')}>View Research →</button>
              <button className="btn btn-ghost" onClick={() => setTab('Resume')}>Résumé</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'Research' && <Papers />}
      {tab === 'Blog'     && <Blog />}
      {tab === 'Resume'   && <Resume />}
    </>
  )
}