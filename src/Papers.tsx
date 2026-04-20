import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ContentLoadError from './ContentLoadError'
import { fetchCdnJson, userFacingCdnMessage } from './cdn'
import { capture } from './posthog'

interface Paper {
  id: string
  title: string
  authors: string
  tag: string
  abstract?: string
  pdf?: string
}

const BADGE_CLASS = ['research-badge--rose', 'research-badge--amber', 'research-badge--neutral'] as const

function parseYearFromTag(tag: string): number | null {
  const m = tag.match(/\b(19|20)\d{2}\b/)
  return m ? parseInt(m[0], 10) : null
}

function sortPapers(list: Paper[]): Paper[] {
  return [...list].sort((a, b) => {
    const ya = parseYearFromTag(a.tag) ?? -1
    const yb = parseYearFromTag(b.tag) ?? -1
    if (yb !== ya) return yb - ya
    return a.title.localeCompare(b.title)
  })
}

export default function Papers() {
  const [papers, setPapers] = useState<Paper[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sorted = useMemo(() => (papers ? sortPapers(papers) : null), [papers])

  useEffect(() => {
    fetchCdnJson<Paper[]>('papers/index.json')
      .then(setPapers)
      .catch((err: unknown) => setError(userFacingCdnMessage(err)))
  }, [])

  return (
    <section className="section research-page view-enter">
      <div className="research-hero-container">
        <header className="research-header">
          <h1 className="section-title research-hero-title">Research</h1>
          <p className="research-intro">
            Write-ups of work I have contributed to — full text, figures, and TeX when I have them.
            <span className="research-intro-mono"> // posters, preprints, and proceedings</span>
          </p>
          {sorted && sorted.length > 0 && (
            <p className="list-page-meta" aria-live="polite">
              <span className="list-page-meta-count">{sorted.length}</span>
              <span className="list-page-meta-label">{sorted.length === 1 ? 'paper' : 'papers'}</span>
              <span className="list-page-meta-hint"> · newest first</span>
            </p>
          )}
        </header>

        {error && <ContentLoadError title="Research list could not be loaded" detail={error} />}
        {!error && !papers && <p className="research-loading">{'// loading...'}</p>}
        {papers?.length === 0 && (
          <p className="research-loading research-loading--spaced">{'// no papers in index yet'}</p>
        )}
        {sorted && sorted.length > 0 && (
          <div className="research-list">
            {sorted.map((p, i) => {
              const year = parseYearFromTag(p.tag)
              return (
                <Link
                  key={p.id}
                  to={`/research/${p.id}`}
                  className="research-card"
                  style={{ animationDelay: `${0.06 + i * 0.09}s` }}
                  onClick={() => capture('paper opened', { paper_id: p.id, title: p.title, tag: p.tag })}
                >
                  <div className="research-year-col">
                    <span className="research-year-label">{year != null ? 'Year' : 'Entry'}</span>
                    <span className="research-year-num">{year != null ? String(year) : String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="research-main">
                    <div className="research-main-head">
                      <h2 className="research-title">{p.title}</h2>
                      <span className={`research-badge ${BADGE_CLASS[i % BADGE_CLASS.length]}`}>{p.tag}</span>
                    </div>
                    <p className="research-authors">{p.authors}</p>
                    {p.abstract && <p className="research-abstract">{p.abstract}</p>}
                    <div className="research-actions">
                      <span className="research-action-link">
                        Read online <span className="research-action-arrow">→</span>
                      </span>
                      {p.pdf && (
                        <span className="research-pdf-pill" aria-hidden="true">
                          PDF
                        </span>
                      )}
                    </div>
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
