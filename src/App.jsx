import { useState, lazy, Suspense } from 'react'
import NeuralCanvas from './NeuralCanvas'

const Papers = lazy(() => import('./Papers'))
const Blog   = lazy(() => import('./Blog'))
const Resume = lazy(() => import('./Resume'))

const TABS = ['Home', 'Research', 'Blog', 'Resume']

const Loading = () => (
  <div className="page">
    <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>// loading...</p>
  </div>
)

export default function App() {
  const [tab, setTab] = useState('Home')

  return (
    <>
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

      <Suspense fallback={<Loading />}>
        {tab === 'Research' && <Papers />}
        {tab === 'Blog'     && <Blog />}
        {tab === 'Resume'   && <Resume />}
      </Suspense>
    </>
  )
}
