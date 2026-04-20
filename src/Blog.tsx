import { useMemo, useState, useEffect } from 'react'
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const TAG_ACCENTS = ['var(--c-orange)', 'var(--c-blue)', 'var(--c-purple)', 'var(--c-green)', 'var(--c-pink)']

function parseBlogDate(date: string) {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return { month: '—', day: '—', year: '' }
  const mi = parseInt(m[2], 10) - 1
  return {
    month: MONTHS[mi] ?? m[2],
    day: String(parseInt(m[3], 10)),
    year: m[1],
  }
}

function postSortKey(date: string): number {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return 0
  return new Date(`${m[1]}-${m[2]}-${m[3]}`).getTime()
}

function sortPostsNewestFirst(list: Post[]): Post[] {
  return [...list].sort((a, b) => postSortKey(b.date) - postSortKey(a.date))
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sorted = useMemo(() => (posts ? sortPostsNewestFirst(posts) : null), [posts])

  useEffect(() => {
    fetchCdnJson<Post[]>('blog/index.json')
      .then(setPosts)
      .catch((err: unknown) => setError(userFacingCdnMessage(err)))
  }, [])

  return (
    <section className="section blog-page view-enter">
      <div className="container blog-container">
        <header className="blog-header">
          <h1 className="section-title blog-hero-title">Blog</h1>
          <p className="research-intro">
            Deeper dives: paper notes, implementation details, and bugs that only showed up at 2am.
            <span className="research-intro-mono"> // long-form, lightly edited</span>
          </p>
          {sorted && sorted.length > 0 && (
            <p className="list-page-meta" aria-live="polite">
              <span className="list-page-meta-count">{sorted.length}</span>
              <span className="list-page-meta-label">{sorted.length === 1 ? 'post' : 'posts'}</span>
              <span className="list-page-meta-hint"> · newest first</span>
            </p>
          )}
        </header>

        {error && <ContentLoadError title="Blog could not be loaded" detail={error} />}
        {!error && !posts && <p className="research-loading">{'// loading...'}</p>}
        {posts?.length === 0 && (
          <p className="research-loading research-loading--spaced">{'// no posts yet — add entries to blog/index.json'}</p>
        )}
        {sorted && sorted.length > 0 && (
          <div className="blog-list">
            {sorted.map(p => {
              const { month, day, year } = parseBlogDate(p.date)
              return (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="blog-entry"
                  onClick={() => capture('blog post opened', { slug: p.slug, title: p.title, tags: p.tags })}
                >
                  <div className="blog-date-col">
                    <span className="blog-date-month">{month}</span>
                    <span className="blog-date-day">{day}</span>
                    <span className="blog-date-year">{year}</span>
                  </div>
                  <div className="blog-content">
                    <span className="blog-entry-title">{p.title}</span>
                    {p.description && <p className="blog-entry-desc">{p.description}</p>}
                    {p.tags && p.tags.length > 0 && (
                      <div className="blog-entry-tags">
                        {p.tags.map((t, i) => (
                          <span key={t} className="blog-tag">
                            <span
                              className="blog-tag-dot"
                              style={{ background: TAG_ACCENTS[i % TAG_ACCENTS.length] }}
                            />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
