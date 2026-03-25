import { marked } from 'marked'
import katex from 'katex'
import 'katex/dist/katex.min.css'

marked.setOptions({ breaks: true, gfm: true })

export function renderWithMath(md, { rewriteImages } = {}) {
  const blocks = []
  const inlines = []

  md = md.replace(/\$\$([\s\S]*?)\$\$/g, (_, expr) => {
    const key = `XMATHBLOCKX${blocks.length}X`
    try { blocks.push(katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false })) }
    catch { blocks.push(`<code>${expr}</code>`) }
    return key
  })

  md = md.replace(/\$([^$\n]+?)\$/g, (_, expr) => {
    const key = `XMATHINLINEX${inlines.length}X`
    try { inlines.push(katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false })) }
    catch { inlines.push(`<code>${expr}</code>`) }
    return key
  })

  let html = marked.parse(md)
  html = html.replace(/XMATHBLOCKX(\d+)X/g, (_, i) => `<div class="math-block">${blocks[i]}</div>`)
  html = html.replace(/XMATHINLINEX(\d+)X/g, (_, i) => inlines[i])
  if (rewriteImages) {
    html = html.replace(/src="(?!https?:\/\/|\/)(.*?)"/g, (_, path) => `src="${rewriteImages(path)}"`)
  }
  return html
}
