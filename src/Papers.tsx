import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cdn } from './cdn'
import { capture } from './posthog'

interface Paper {
  id: string
  title: string
  authors: string
  tag: string
  abstract?: string
  pdf?: string
}

export default function Papers() {
  const [papers, setPapers] = useState<Paper[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(cdn('papers/index.json'))
      .then(r => {
        if (!r.ok) throw new Error(`Could not load papers/index.json (${r.status})`)
        return r.json()
      })
      .then(setPapers)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <div className="page">
      <h1 className="page-title">Research</h1>
      <p className="page-sub">{'// selected publications'}</p>

      {error && <p style={{ color: '#f55', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{error}</p>}
      {!error && !papers && <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{'// loading...'}</p>}
      {papers?.length === 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', color: 'var(--muted)', fontSize: '0.85rem', fontFamily: 'Syne Mono, monospace' }}>
          {'// no papers yet'}
        </div>
      )}
      {papers && papers.length > 0 && (
        <div className="paper-list">
          {papers.map(p => (
            <Link key={p.id} to={`/research/${p.id}`} className="paper-item" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => capture('paper opened', { paper_id: p.id, title: p.title, tag: p.tag })}>
              <div className="paper-meta">{p.tag}</div>
              <div className="paper-title">{p.title}</div>
              <div className="paper-authors">{p.authors}</div>
              {p.abstract && <p className="paper-abstract">{p.abstract}</p>}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                <span className="paper-read">Read paper →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
