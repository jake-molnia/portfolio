import { useState, useEffect } from 'react'
import { renderWithMath } from './renderWithMath'
import { cdn } from './cdn'

function PostView({ post, onClose }) {
  const [html, setHtml] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(cdn(`blog/${post.slug}/content.md`))
      .then(r => {
        if (!r.ok) throw new Error(`Could not load post (${r.status})`)
        return r.text()
      })
      .then(md => setHtml(renderWithMath(md, {
        rewriteImages: (path) => cdn(`blog/${post.slug}/${path}`)
      })))
      .catch(err => setError(err.message))
  }, [post.slug])

  return (
    <div className="page">
      <button onClick={onClose} style={{
        background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
        cursor: 'pointer', padding: '0.3rem 0.8rem', fontSize: '0.75rem',
        fontFamily: 'Syne Mono, monospace', marginBottom: '2rem', letterSpacing: '0.08em'
      }}>← back</button>

      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', marginBottom: '0.5rem' }}>
          {post.date}{post.tags?.length ? ` · ${post.tags.join(', ')}` : ''}
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.6rem' }}>{post.title}</h1>
        {post.description && <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>{post.description}</p>}
      </div>

      {error && <p style={{ color: '#f55', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{error}</p>}
      {!error && !html && <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>// loading...</p>}
      {html && <div className="blog-body" dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  )
}

export default function Blog() {
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState(null)
  const [activeSlug, setActiveSlug] = useState(() => {
    const h = window.location.hash
    return h.startsWith('#blog/') ? h.slice(6) : null
  })

  useEffect(() => {
    if (activeSlug) window.location.hash = `blog/${activeSlug}`
    else if (window.location.hash.startsWith('#blog/')) history.replaceState(null, '', ' ')
  }, [activeSlug])

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash
      setActiveSlug(h.startsWith('#blog/') ? h.slice(6) : null)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    fetch(cdn('blog/index.json'))
      .then(r => {
        if (!r.ok) throw new Error(`Could not load blog/index.json (${r.status})`)
        return r.json()
      })
      .then(setPosts)
      .catch(err => setError(err.message))
  }, [])

  const activePost = posts?.find(p => p.slug === activeSlug) ?? null
  if (activePost) return <PostView post={activePost} onClose={() => setActiveSlug(null)} />

  return (
    <div className="page">
      <h1 className="page-title">Blog</h1>
      <p className="page-sub">// notes & writing</p>

      {error && <p style={{ color: '#f55', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{error}</p>}
      {!error && !posts && <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>// loading...</p>}
      {posts?.length === 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', color: 'var(--muted)', fontSize: '0.85rem', fontFamily: 'Syne Mono, monospace' }}>
          // no posts yet
        </div>
      )}
      {posts?.length > 0 && (
        <div className="paper-list">
          {posts.map(p => (
            <div key={p.slug} className="paper-item" onClick={() => setActiveSlug(p.slug)}>
              <div className="paper-meta">{p.date}{p.tags?.length ? ` · ${p.tags.join(', ')}` : ''}</div>
              <div className="paper-title">{p.title}</div>
              {p.description && <p className="paper-abstract">{p.description}</p>}
              <div className="paper-read">Read post →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
