import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cdn } from './cdn'
import { capture } from './posthog'

interface Post {
  slug: string
  title: string
  date: string
  description?: string
  tags?: string[]
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(cdn('blog/index.json'))
      .then(r => {
        if (!r.ok) throw new Error(`Could not load blog/index.json (${r.status})`)
        return r.json()
      })
      .then(setPosts)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <div className="page">
      <h1 className="page-title">Blog</h1>
      <p className="page-sub">{'// notes & writing'}</p>

      {error && <p style={{ color: '#f55', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{error}</p>}
      {!error && !posts && <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{'// loading...'}</p>}
      {posts?.length === 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', color: 'var(--muted)', fontSize: '0.85rem', fontFamily: 'Syne Mono, monospace' }}>
          {'// no posts yet'}
        </div>
      )}
      {posts && posts.length > 0 && (
        <div className="paper-list">
          {posts.map(p => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="paper-item" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => capture('blog post opened', { slug: p.slug, title: p.title, tags: p.tags })}>
              <div className="paper-meta">{p.date}{p.tags?.length ? ` · ${p.tags.join(', ')}` : ''}</div>
              <div className="paper-title">{p.title}</div>
              {p.description && <p className="paper-abstract">{p.description}</p>}
              <div className="paper-read">Read post →</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
