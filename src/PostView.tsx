import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import ContentLoadError from './ContentLoadError'
import { cdn, fetchCdnJson, fetchCdnText, userFacingCdnMessage } from './cdn'
import { capture } from './posthog'

marked.setOptions({ breaks: true, gfm: true })

interface Post {
  slug: string
  title: string
  date: string
  description?: string
  tags?: string[]
}

function renderWithMath(md: string, slug: string): string {
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
  html = html.replace(/src="(?!https?:\/\/|\/)(.*?)"/g, `src="${cdn(`blog/${slug}/$1`)}"`)
  return html
}

export default function PostView() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load post metadata from index
  useEffect(() => {
    if (!slug) return
    fetchCdnJson<Post[]>('blog/index.json')
      .then(posts => {
        const found = posts.find(p => p.slug === slug)
        if (found) {
          setPost(found)
          capture('blog post opened', { slug: found.slug, title: found.title, tags: found.tags })
        } else {
          setError("We couldn't find a post at this address. It may have been removed or the link is wrong.")
        }
      })
      .catch((err: unknown) => setError(userFacingCdnMessage(err)))
  }, [slug])

  // Load post content
  useEffect(() => {
    if (!slug) return
    fetchCdnText(`blog/${slug}/content.md`)
      .then(md => setHtml(renderWithMath(md, slug)))
      .catch((err: unknown) => setError(userFacingCdnMessage(err)))
  }, [slug])

  const handleBack = () => {
    if (post) capture('blog post closed', { slug: post.slug, title: post.title })
    navigate('/blog')
  }

  return (
    <div className="page">
      <div className="page-back-row">
        <button type="button" className="page-back-btn" onClick={handleBack}>
          <svg className="page-back-btn-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
      </div>

      {post && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
            {post.date}{post.tags?.length ? ` · ${post.tags.join(', ')}` : ''}
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.6rem' }}>{post.title}</h1>
          {post.description && <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>{post.description}</p>}
        </div>
      )}

      {error && <ContentLoadError title="This post could not be loaded" detail={error} />}
      {!error && !html && <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{/* loading... */}</p>}
      {html && <div className="blog-body" dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  )
}
