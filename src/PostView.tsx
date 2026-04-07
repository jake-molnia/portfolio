import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { cdn, fetchCdn } from './cdn'
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
    fetchCdn('blog/index.json')
      .then(r => r.json())
      .then((posts: Post[]) => {
        const found = posts.find(p => p.slug === slug)
        if (found) {
          setPost(found)
          capture('blog post opened', { slug: found.slug, title: found.title, tags: found.tags })
        } else {
          setError('Post not found')
        }
      })
      .catch((err: Error) => setError(err.message))
  }, [slug])

  // Load post content
  useEffect(() => {
    if (!slug) return
    fetchCdn(`blog/${slug}/content.md`)
      .then(r => r.text())
      .then(md => setHtml(renderWithMath(md, slug)))
      .catch((err: Error) => setError(err.message))
  }, [slug])

  const handleBack = () => {
    if (post) capture('blog post closed', { slug: post.slug, title: post.title })
    navigate('/blog')
  }

  return (
    <div className="page">
      <button onClick={handleBack} style={{
        background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
        cursor: 'pointer', padding: '0.3rem 0.8rem', fontSize: '0.75rem',
        fontFamily: 'Syne Mono, monospace', marginBottom: '2rem', letterSpacing: '0.08em'
      }}>← back</button>

      {post && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', marginBottom: '0.5rem' }}>
            {post.date}{post.tags?.length ? ` · ${post.tags.join(', ')}` : ''}
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.6rem' }}>{post.title}</h1>
          {post.description && <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>{post.description}</p>}
        </div>
      )}

      {error && <p style={{ color: '#f55', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{error}</p>}
      {!error && !html && <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{/* loading... */}</p>}
      {html && <div className="blog-body" dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  )
}
