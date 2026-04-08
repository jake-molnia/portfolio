import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ContentLoadError from './ContentLoadError'
import { fetchCdnJson, userFacingCdnMessage } from './cdn'
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
    fetchCdnJson<Post[]>('blog/index.json')
      .then(setPosts)
      .catch((err: unknown) => setError(userFacingCdnMessage(err)))
  }, [])

  return (
    <div className="page">
      <h1 className="page-title">Blog</h1>

      {error && <ContentLoadError title="Blog could not be loaded" detail={error} />}
      {!error && !posts && <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{'// loading...'}</p>}
      {posts?.length === 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', color: 'var(--muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
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
