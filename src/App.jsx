import { useState } from 'react'
import NeuralCanvas from './NeuralCanvas'
import Papers from './Papers'
import Resume from './Resume'

const TABS = ['Home', 'Research', 'Resume']

export default function App() {
  const [tab, setTab] = useState('Home')

  return (
    <>
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
            {/* <h1 className="hero-name">Jacob Molnia</h1> */}
            <div className="hero-role">Masters Student · ML Systems · WPI</div>
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setTab('Papers')}>View Research →</button>
              <button className="btn btn-ghost" onClick={() => setTab('Resume')}>Résumé</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'Research' && <Papers />}
      {tab === 'Resume' && <Resume />}
    </>
  )
}