import { useState, useEffect, lazy, Suspense, type ReactNode } from 'react'
import NeuralCanvas from './NeuralCanvas'
import { capture, useFeatureFlag } from './posthog'

const Papers = lazy(() => import('./Papers'))
const Resume = lazy(() => import('./Resume'))
const Blog   = lazy(() => import('./Blog'))

type Tab = 'Home' | 'Research' | 'Blog' | 'Resume'

const TABS: Tab[] = ['Home', 'Research', 'Blog', 'Resume']

const TAB_ICONS: Record<Tab, ReactNode> = {
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

function useIsMobile(breakpoint = 640): boolean {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [breakpoint])
  return mobile
}

const PageLoader = () => <div className="page-loader">{/* loading... */}</div>

function navigateTo(targetTab: Tab, setTab: (tab: Tab) => void): void {
  setTab(targetTab)
  capture('tab navigated', { tab: targetTab })
}

/** Map togglable tabs to their PostHog feature flag key */
const TAB_FLAGS: Partial<Record<Tab, string>> = {
  Research: 'show-research',
  Blog:     'show-blog',
  Resume:   'show-resume',
}

export default function App() {
  const [tab, setTab] = useState<Tab>('Home')
  const isMobile = useIsMobile()

  // Feature flags — default true so everything shows without PostHog
  const showResearch = useFeatureFlag('show-research')
  const showBlog     = useFeatureFlag('show-blog')
  const showResume   = useFeatureFlag('show-resume')

  const flagMap: Record<string, boolean> = {
    'show-research': showResearch,
    'show-blog':     showBlog,
    'show-resume':   showResume,
  }

  const visibleTabs = TABS.filter(t => {
    const flag = TAB_FLAGS[t]
    return !flag || flagMap[flag]
  })

  // If the active tab gets disabled, fall back to Home
  const activeTab = visibleTabs.includes(tab) ? tab : 'Home'

  return (
    <>
      {/* Desktop top nav */}
      <nav className="nav">
        <span className="nav-logo">JRM</span>
        <div className="nav-tabs">
          {visibleTabs.map(t => (
            <button
              key={t}
              className={`nav-tab ${activeTab === t ? 'active' : ''}`}
              onClick={() => navigateTo(t, setTab)}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav" aria-label="Main navigation">
        {visibleTabs.map(t => (
          <button
            key={t}
            className={`mobile-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => navigateTo(t, setTab)}
            aria-current={activeTab === t ? 'page' : undefined}
          >
            {TAB_ICONS[t]}
            <span>{t}</span>
          </button>
        ))}
      </nav>

      {activeTab === 'Home' && (
        <div className="hero">
          {!isMobile && <NeuralCanvas name="Jacob Molnia" />}
          <div className="hero-content">
            {isMobile && <h1 className="hero-name">Jacob Molnia</h1>}
            <div className="hero-role">Deep Learning and Optimization</div>
            <div style={{ marginTop: 'clamp(1.5rem, 3vw, 2.5rem)', display: 'flex', gap: 'clamp(0.5rem, 2vw, 0.75rem)', justifyContent: 'center', flexWrap: 'wrap' }}>
              {showResearch && <button className="btn btn-primary" onClick={() => { capture('research cta clicked'); navigateTo('Research', setTab) }}>View Research →</button>}
              {showResume && <button className="btn btn-ghost" onClick={() => { capture('resume cta clicked'); navigateTo('Resume', setTab) }}>Résumé</button>}
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={<PageLoader />}>
        {activeTab === 'Research' && showResearch && <Papers />}
        {activeTab === 'Blog'     && showBlog     && <Blog />}
        {activeTab === 'Resume'   && showResume   && <Resume />}
      </Suspense>
    </>
  )
}
