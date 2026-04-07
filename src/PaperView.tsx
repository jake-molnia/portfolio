import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { cdn, fetchCdn } from './cdn'
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
    fetchCdn('papers/index.json')
      .then(r => r.json())
      .then((papers: Paper[]) => {
        const found = papers.find(p => p.id === id)
        if (found) {
          setPaper(found)
          capture('paper opened', { paper_id: found.id, title: found.title, tag: found.tag })
        } else {
          setError('Paper not found')
        }
      })
      .catch((err: Error) => setError(err.message))
  }, [id])

  // Load paper content
  useEffect(() => {
    if (!id) return
    fetchCdn(`papers/${id}/content.md`)
      .then(r => r.text())
      .then(md => setHtml(renderWithMath(md)))
      .catch((err: Error) => setError(err.message))
  }, [id])

  const handleBack = () => {
    if (paper) capture('paper closed', { paper_id: paper.id, title: paper.title })
    navigate('/research')
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={handleBack} style={{
          background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
          cursor: 'pointer', padding: '0.3rem 0.8rem', fontSize: '0.75rem',
          fontFamily: 'Syne Mono, monospace', letterSpacing: '0.08em'
        }}>← back</button>
        {paper?.pdf && (
          <a href={cdn(`papers/${paper.id}/${paper.pdf}`)} target="_blank" rel="noreferrer" className="btn btn-primary" onClick={() => capture('paper pdf downloaded', { paper_id: paper.id, title: paper.title })}>↓ Download PDF</a>
        )}
      </div>

      {paper && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', marginBottom: '0.5rem' }}>{paper.tag}</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.6rem' }}>{paper.title}</h1>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{paper.authors}</div>
        </div>
      )}

      {error && <p style={{ color: '#f55', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{error}</p>}
      {!error && !html && <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{/* loading... */}</p>}
      {html && <div className="blog-body" dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  )
}
