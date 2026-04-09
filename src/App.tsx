import { useState, lazy, Suspense, useEffect, type ReactNode } from 'react'
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom'
import NeuralCanvas from './NeuralCanvas'
import ThemeToggle from './ThemeToggle'
import NavLogoDropdown from './NavLogoDropdown'
import { capture, useFeatureFlag } from './posthog'

const Papers   = lazy(() => import('./Papers'))
const PaperView = lazy(() => import('./PaperView'))
const Resume   = lazy(() => import('./Resume'))
const Blog     = lazy(() => import('./Blog'))
const PostView = lazy(() => import('./PostView'))
const Tools    = lazy(() => import('./Tools'))
const ToolView = lazy(() => import('./ToolView'))

type Tab = 'Home' | 'Research' | 'Blog' | 'Resume'

const TAB_ROUTES: Record<Tab, string> = {
  Home:     '/',
  Research: '/research',
  Blog:     '/blog',
  Resume:   '/resume',
}

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

const TABS: Tab[] = ['Home', 'Research', 'Blog', 'Resume']

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

/** Map togglable tabs to their PostHog feature flag key */
const TAB_FLAGS: Partial<Record<Tab, string>> = {
  Research: 'show-research',
  Blog:     'show-blog',
  Resume:   'show-resume',
}

function activeTabFromPath(pathname: string): Tab {
  if (pathname.startsWith('/research')) return 'Research'
  if (pathname.startsWith('/blog'))     return 'Blog'
  if (pathname.startsWith('/resume'))   return 'Resume'
  if (pathname.startsWith('/tools'))    return 'Home' // Tools lives under the logo dropdown, not a tab
  return 'Home'
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const activeTab = activeTabFromPath(location.pathname)

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

  // Track page views on route change
  useEffect(() => {
    capture('$pageview', { path: location.pathname })
  }, [location.pathname])

  return (
    <>
      {/* Desktop top nav */}
      <nav className="nav">
        <NavLogoDropdown />
        <div className="nav-tabs">
          {visibleTabs.map(t => (
            <NavLink
              key={t}
              to={TAB_ROUTES[t]}
              className={`nav-tab ${activeTab === t ? 'active' : ''}`}
              onClick={() => capture('tab navigated', { tab: t })}
            >
              {t}
            </NavLink>
          ))}
        </div>
        <ThemeToggle />
      </nav>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav" aria-label="Main navigation">
        {visibleTabs.map(t => (
          <NavLink
            key={t}
            to={TAB_ROUTES[t]}
            className={`mobile-tab ${activeTab === t ? 'active' : ''}`}
            aria-current={activeTab === t ? 'page' : undefined}
            onClick={() => capture('tab navigated', { tab: t })}
          >
            {TAB_ICONS[t]}
            <span>{t}</span>
          </NavLink>
        ))}
        <NavLink
          to="/tools"
          className={`mobile-tab ${location.pathname.startsWith('/tools') ? 'active' : ''}`}
          aria-current={location.pathname.startsWith('/tools') ? 'page' : undefined}
          onClick={() => capture('tab navigated', { tab: 'Tools' })}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <span>Tools</span>
        </NavLink>
      </nav>

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={
            <div className="hero">
              {!isMobile && <NeuralCanvas name="Jacob Molnia" />}
              <div className="hero-content">
                {isMobile && <h1 className="hero-name">Jacob Molnia</h1>}
                <div className="hero-role">Deep Learning and Optimization</div>
                <div style={{ marginTop: 'clamp(1.5rem, 3vw, 2.5rem)', display: 'flex', gap: 'clamp(0.5rem, 2vw, 0.75rem)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {showResearch && <button className="btn btn-primary" onClick={() => { capture('research cta clicked'); navigate('/research') }}>View Research →</button>}
                  {showResume && <button className="btn btn-ghost" onClick={() => { capture('resume cta clicked'); navigate('/resume') }}>Résumé</button>}
                </div>
              </div>
            </div>
          } />
          {showResearch && <Route path="/research" element={<Papers />} />}
          {showResearch && <Route path="/research/:id" element={<PaperView />} />}
          {showBlog && <Route path="/blog" element={<Blog />} />}
          {showBlog && <Route path="/blog/:slug" element={<PostView />} />}
          {showResume && <Route path="/resume" element={<Resume />} />}
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:slug" element={<ToolView />} />
        </Routes>
      </Suspense>
    </>
  )
}
