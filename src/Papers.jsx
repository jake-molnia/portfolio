import { useState, useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// ── LaTeX section parser ──────────────────────────────────────────────────────

function parsePaper(tex) {
  const get = (cmd) => {
    const m = tex.match(new RegExp(`\\\\${cmd}\\{([^}]*)\\}`))
    return m ? m[1].trim() : ''
  }

  const title = get('title')
  const author = get('author')
  const date = get('date')

  // abstract
  const abMatch = tex.match(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/)
  const abstract = abMatch ? abMatch[1].trim() : ''

  // sections
  const sections = []
  const secRe = /\\section\{([^}]+)\}([\s\S]*?)(?=\\section\{|\\end\{document\}|$)/g
  let m
  while ((m = secRe.exec(tex)) !== null) {
    sections.push({ heading: m[1].trim(), body: m[2].trim() })
  }

  return { title, author, date, abstract, sections }
}

function cleanLatex(s = '') {
  return s
    .replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>')
    .replace(/\\textit\{([^}]*)\}/g, '<em>$1</em>')
    .replace(/\\emph\{([^}]*)\}/g, '<em>$1</em>')
    .replace(/\\cite\{([^}]*)\}/g, '<span style="color:var(--muted)">[cite:$1]</span>')
    .replace(/\\footnote\{[^}]*\}/g, '')
    .replace(/\\label\{[^}]*\}/g, '')
    .replace(/\\ref\{([^}]*)\}/g, '[ref]')
    .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '<a href="$1" target="_blank" rel="noreferrer">$2</a>')
    .replace(/\\url\{([^}]*)\}/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\\noindent/g, '')
    .replace(/\\[a-zA-Z]+[*]\{([^}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── math renderer ────────────────────────────────────────────────────────────

function renderMath(text) {
  // display math $$...$$
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, expr) => {
    try { return '<div class="math-block">' + katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false }) + '</div>' }
    catch { return `<div class="math-block"><code>${expr}</code></div>` }
  })
  // inline math $...$
  text = text.replace(/\$([^$\n]+?)\$/g, (_, expr) => {
    try { return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false }) }
    catch { return `<code>${expr}</code>` }
  })
  return text
}

// ── components ────────────────────────────────────────────────────────────────

function MathHTML({ src }) {
  const ref = useRef()
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = renderMath(cleanLatex(src))
  }, [src])
  return <div ref={ref} style={{ lineHeight: 1.8, fontSize: '0.88rem', color: 'var(--fg-dim, #ccc)' }} />
}

function PaperView({ paper, onClose }) {
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/papers/${paper.file}`)
      .then(r => {
        if (!r.ok) throw new Error(`Could not load ${paper.file} (${r.status})`)
        return r.text()
      })
      .then(tex => setParsed(parsePaper(tex)))
      .catch(err => setError(err.message))
  }, [paper.file])

  return (
    <div className="page">
      <button onClick={onClose} style={{
        background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
        cursor: 'pointer', padding: '0.3rem 0.8rem', fontSize: '0.75rem',
        fontFamily: 'Syne Mono, monospace', marginBottom: '2rem', letterSpacing: '0.08em'
      }}>← back</button>

      {error && <p style={{ color: '#f55', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{error}</p>}

      {!error && !parsed && (
        <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>// loading...</p>
      )}

      {parsed && (
        <>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', marginBottom: '0.5rem' }}>{paper.tag}</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.6rem' }}>{parsed.title || paper.title}</h1>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{parsed.author || paper.authors}</div>
            {parsed.date && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{parsed.date}</div>}
          </div>

          {parsed.abstract && (
            <div style={{
              borderLeft: '2px solid var(--border)', paddingLeft: '1.2rem',
              marginBottom: '2.5rem'
            }}>
              <div style={{ fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', marginBottom: '0.6rem' }}>Abstract</div>
              <MathHTML src={parsed.abstract} />
            </div>
          )}

          {parsed.sections.map((sec, i) => (
            <div key={i} style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.3rem', marginBottom: '0.8rem' }}>{sec.heading}</h2>
              <MathHTML src={sec.body} />
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function Papers() {
  const [papers, setPapers] = useState(null)
  const [error, setError] = useState(null)
  const [active, setActive] = useState(null)

  useEffect(() => {
    fetch('/papers/index.json')
      .then(r => {
        if (!r.ok) throw new Error(`Could not load /papers/index.json (${r.status})`)
        return r.json()
      })
      .then(setPapers)
      .catch(err => setError(err.message))
  }, [])

  if (active) return <PaperView paper={active} onClose={() => setActive(null)} />

  return (
    <div className="page">
      <h1 className="page-title">Research</h1>
      <p className="page-sub">// selected publications</p>

      {error && (
        <>
          <p style={{ color: '#f55', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>{error}</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
            Create <code>public/papers/index.json</code> with an array of paper entries.
          </p>
        </>
      )}

      {!error && !papers && (
        <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>// loading...</p>
      )}

      {papers?.length === 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', color: 'var(--muted)', fontSize: '0.85rem', fontFamily: 'Syne Mono, monospace' }}>
          // no papers yet — add entries to public/papers/index.json
        </div>
      )}

      {papers?.length > 0 && (
        <div className="paper-list">
          {papers.map(p => (
            <div key={p.id} className="paper-item" onClick={() => setActive(p)}>
              <div className="paper-meta">{p.tag}</div>
              <div className="paper-title">{p.title}</div>
              <div className="paper-authors">{p.authors}</div>
              {p.abstract && (
                <p className="paper-abstract">{p.abstract.replace(/\$[^$]*\$/g, '[math]')}</p>
              )}
              <div className="paper-read">Open paper →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}