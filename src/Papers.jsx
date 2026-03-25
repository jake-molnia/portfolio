import { useState, useEffect } from 'react'
import { renderWithMath } from './renderWithMath'
import { cdn } from './cdn'

function PaperView({ paper, onClose }) {
  const [html, setHtml] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(cdn(`papers/${paper.id}/content.md`))
      .then(r => {
        if (!r.ok) throw new Error(`Could not load content (${r.status})`)
        return r.text()
      })
      .then(md => setHtml(renderWithMath(md)))
      .catch(err => setError(err.message))
  }, [paper.id])

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={onClose} style={{
          background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
          cursor: 'pointer', padding: '0.3rem 0.8rem', fontSize: '0.75rem',
          fontFamily: 'Syne Mono, monospace', letterSpacing: '0.08em'
        }}>← back</button>
        {paper.pdf && (
          <a href={cdn(`papers/${paper.id}/${paper.pdf}`)} target="_blank" rel="noreferrer" className="btn btn-primary">↓ Download PDF</a>
        )}
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', marginBottom: '0.5rem' }}>{paper.tag}</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.6rem' }}>{paper.title}</h1>
        <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{paper.authors}</div>
      </div>

      {error && <p style={{ color: '#f55', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{error}</p>}
      {!error && !html && <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>// loading...</p>}
      {html && <div className="blog-body" dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  )
}

export default function Papers() {
  const [papers, setPapers] = useState(null)
  const [error, setError] = useState(null)
  const [activeId, setActiveId] = useState(() => {
    const h = window.location.hash
    return h.startsWith('#paper/') ? h.slice(7) : null
  })

  useEffect(() => {
    if (activeId) window.location.hash = `paper/${activeId}`
    else if (window.location.hash.startsWith('#paper/')) history.replaceState(null, '', ' ')
  }, [activeId])

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash
      setActiveId(h.startsWith('#paper/') ? h.slice(7) : null)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    fetch(cdn('papers/index.json'))
      .then(r => {
        if (!r.ok) throw new Error(`Could not load papers/index.json (${r.status})`)
        return r.json()
      })
      .then(setPapers)
      .catch(err => setError(err.message))
  }, [])

  const activePaper = papers?.find(p => p.id === activeId) ?? null
  if (activePaper) return <PaperView paper={activePaper} onClose={() => setActiveId(null)} />

  return (
    <div className="page">
      <h1 className="page-title">Research</h1>
      <p className="page-sub">// selected publications</p>

      {error && <p style={{ color: '#f55', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{error}</p>}
      {!error && !papers && <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>// loading...</p>}
      {papers?.length === 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', color: 'var(--muted)', fontSize: '0.85rem', fontFamily: 'Syne Mono, monospace' }}>
          // no papers yet
        </div>
      )}
      {papers?.length > 0 && (
        <div className="paper-list">
          {papers.map(p => (
            <div key={p.id} className="paper-item" onClick={() => setActiveId(p.id)}>
              <div className="paper-meta">{p.tag}</div>
              <div className="paper-title">{p.title}</div>
              <div className="paper-authors">{p.authors}</div>
              {p.abstract && <p className="paper-abstract">{p.abstract}</p>}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                <span className="paper-read">Read paper →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
