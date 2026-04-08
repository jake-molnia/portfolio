import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import ContentLoadError from './ContentLoadError'
import { cdn, fetchCdnJson, fetchCdnText, userFacingCdnMessage } from './cdn'
import PdfDownloadLink from './PdfDownloadLink'
import { capture } from './posthog'

marked.setOptions({ breaks: true, gfm: true })

interface Paper {
  id: string
  title: string
  authors: string
  tag: string
  abstract?: string
  pdf?: string
}

function renderWithMath(md: string): string {
  const blocks: string[] = []
  const inlines: string[] = []

  md = md.replace(/\$\$([\s\S]*?)\$\$/g, (_, expr: string) => {
    const key = `XMATHBLOCKX${blocks.length}X`
    try { blocks.push(katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })) }
    catch { blocks.push(`<code>${expr}</code>`) }
    return key
  })

  md = md.replace(/\$([^$\n]+?)\$/g, (_, expr: string) => {
    const key = `XMATHINLINEX${inlines.length}X`
    try { inlines.push(katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false })) }
    catch { inlines.push(`<code>${expr}</code>`) }
    return key
  })

  let html = marked.parse(md) as string
  html = html.replace(/XMATHBLOCKX(\d+)X/g, (_, i: string) => `<div class="math-block">${blocks[+i]}</div>`)
  html = html.replace(/XMATHINLINEX(\d+)X/g, (_, i: string) => inlines[+i])
  return html
}

export default function PaperView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [paper, setPaper] = useState<Paper | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load paper metadata from index
  useEffect(() => {
    if (!id) return
    fetchCdnJson<Paper[]>('papers/index.json')
      .then(papers => {
        const found = papers.find(p => p.id === id)
        if (found) {
          setPaper(found)
          capture('paper opened', { paper_id: found.id, title: found.title, tag: found.tag })
        } else {
          setError("We couldn't find a paper with this ID. It may have been removed or the link is wrong.")
        }
      })
      .catch((err: unknown) => setError(userFacingCdnMessage(err)))
  }, [id])

  // Load paper content
  useEffect(() => {
    if (!id) return
    fetchCdnText(`papers/${id}/content.md`)
      .then(md => setHtml(renderWithMath(md)))
      .catch((err: unknown) => setError(userFacingCdnMessage(err)))
  }, [id])

  const handleBack = () => {
    if (paper) capture('paper closed', { paper_id: paper.id, title: paper.title })
    navigate('/research')
  }

  return (
    <div className="page">
      <div className="page-top-bar">
        <button type="button" className="page-back-btn" onClick={handleBack}>
          <svg className="page-back-btn-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        {paper?.pdf && (
          <PdfDownloadLink
            href={cdn(`papers/${paper.id}/${paper.pdf}`)}
            label="Download PDF"
            onClick={() => capture('paper pdf downloaded', { paper_id: paper.id, title: paper.title })}
          />
        )}
      </div>

      {paper && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>{paper.tag}</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.6rem' }}>{paper.title}</h1>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{paper.authors}</div>
        </div>
      )}

      {error && <ContentLoadError title="This paper could not be loaded" detail={error} />}
      {!error && !html && <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{/* loading... */}</p>}
      {html && <div className="blog-body" dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  )
}
