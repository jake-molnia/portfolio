import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { capture, useFeatureFlag } from './posthog'

import HeroSection from './HeroSection'
import AboutStrip from './AboutStrip'
import ProjectsSection from './ProjectsSection'
import ReadingSection from './ReadingSection'
import ContactSection from './ContactSection'
import Footer from './Footer'
import Duck from './Duck'

const Papers = lazy(() => import('./Papers'))
const PaperView = lazy(() => import('./PaperView'))
const Resume = lazy(() => import('./Resume'))
const Blog = lazy(() => import('./Blog'))
const PostView = lazy(() => import('./PostView'))
const Tools = lazy(() => import('./Tools'))
const ToolView = lazy(() => import('./ToolView'))

type Tab = 'Home' | 'Research' | 'Blog' | 'Resume'

const TAB_ROUTES: Record<Tab, string> = {
  Home: '/',
  Research: '/research',
  Blog: '/blog',
  Resume: '/resume',
}

const TAB_COLORS: Record<Tab, string> = {
  Home: 'var(--c-orange)',
  Research: 'var(--c-blue)',
  Blog: 'var(--c-purple)',
  Resume: 'var(--c-red)',
}

const TABS: Tab[] = ['Home', 'Research', 'Blog', 'Resume']

const PageLoader = () => <div className="page-loader">{/* loading... */}</div>

const TAB_FLAGS: Partial<Record<Tab, string>> = {
  Research: 'show-research',
  Blog: 'show-blog',
  Resume: 'show-resume',
}

function activeTabFromPath(pathname: string): Tab {
  if (pathname.startsWith('/research')) return 'Research'
  if (pathname.startsWith('/blog')) return 'Blog'
  if (pathname.startsWith('/resume')) return 'Resume'
  if (pathname.startsWith('/tools')) return 'Home'
  return 'Home'
}

function HomePage() {
  return (
    <div className="view-enter home-view-enter">
      <HeroSection />
      <AboutStrip />
      <ProjectsSection />
      <ReadingSection />
      <ContactSection />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const activeTab = activeTabFromPath(location.pathname)

  const showResearch = useFeatureFlag('show-research')
  const showBlog = useFeatureFlag('show-blog')
  const showResume = useFeatureFlag('show-resume')

  const flagMap: Record<string, boolean> = {
    'show-research': showResearch,
    'show-blog': showBlog,
    'show-resume': showResume,
  }

  const visibleTabs = TABS.filter(t => {
    const flag = TAB_FLAGS[t]
    return !flag || flagMap[flag]
  })

  useEffect(() => {
    capture('$pageview', { path: location.pathname })
  }, [location.pathname])

  useEffect(() => {
    const resume = location.pathname === '/resume'
    document.documentElement.classList.toggle('resume-route', resume)
    return () => document.documentElement.classList.remove('resume-route')
  }, [location.pathname])

  return (
    <>
      <nav className="mobile-nav" aria-label="Main navigation">
        <Duck active />
        <div className="mobile-nav-tabs">
          {visibleTabs.map(t => (
            <NavLink
              key={t}
              to={TAB_ROUTES[t]}
              className={`nav-tab ${activeTab === t ? 'active' : ''}`}
              style={{ '--tab-color': TAB_COLORS[t] } as React.CSSProperties}
              onClick={() => capture('tab navigated', { tab: t })}
            >
              {t === 'Resume' ? 'Resume' : t}
            </NavLink>
          ))}
          <NavLink
            to="/tools"
            className={`nav-tab ${location.pathname.startsWith('/tools') ? 'active' : ''}`}
            style={{ '--tab-color': 'var(--c-green)' } as React.CSSProperties}
            onClick={() => capture('tab navigated', { tab: 'Tools' })}
          >
            Tools
          </NavLink>
        </div>
        <div className="mobile-nav-theme">
          <ThemeToggle />
        </div>
      </nav>

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {showResearch && <Route path="/research" element={<Papers />} />}
          {showResearch && <Route path="/research/:id" element={<PaperView />} />}
          {showBlog && <Route path="/blog" element={<Blog />} />}
          {showBlog && <Route path="/blog/:slug" element={<PostView />} />}
          {showResume && <Route path="/resume" element={<Resume />} />}
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:slug" element={<ToolView />} />
        </Routes>
      </Suspense>

      <Footer />
    </>
  )
}
