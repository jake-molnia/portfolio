import { useState, useMemo } from 'react'
import { marked } from 'marked'

const PLACEHOLDER = `# Markdown Preview

Write **Markdown** on the left, see the rendered output on the right.

## Features

- **Bold**, *italic*, and \`inline code\`
- [Links](https://example.com)
- Lists (ordered and unordered)

### Code Block

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

> Blockquotes work too.

---

| Feature | Status |
|---------|--------|
| Tables  | Yes    |
| Images  | Yes    |
`

export default function MarkdownPreview() {
  const [input, setInput] = useState(PLACEHOLDER)

  const html = useMemo(() => {
    try {
      return marked.parse(input, { async: false }) as string
    } catch {
      return '<p style="color:#f85149">Error rendering Markdown</p>'
    }
  }, [input])

  return (
    <div>
      <div className="tool-row">
        <div className="tool-section">
          <label className="tool-section-label">Markdown</label>
          <textarea
            className="tool-textarea"
            rows={20}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Write Markdown here..."
          />
        </div>
        <div className="tool-section">
          <label className="tool-section-label">Preview</label>
          <div
            className="tool-preview-area tool-md-preview"
            style={{ minHeight: '20rem' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  )
}
