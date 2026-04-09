import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { capture } from './posthog'
import { getToolsByCategory, CATEGORY_LABELS, type ToolDescriptor } from './toolRegistry'

function ToolCard({ tool }: { tool: ToolDescriptor }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className="tool-card"
      onClick={() => {
        capture('tool opened', { tool: tool.slug })
        navigate(`/tools/${tool.slug}`)
      }}
    >
      <svg className="tool-card-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={tool.icon} />
      </svg>
      <div className="tool-card-body">
        <div className="tool-card-name">
          {tool.name}
          {tool.lossy && <span className="tool-card-badge">lossy</span>}
        </div>
        <div className="tool-card-desc">{tool.description}</div>
      </div>
    </button>
  )
}

export default function Tools() {
  const grouped = getToolsByCategory()

  useEffect(() => { capture('tools page viewed') }, [])

  return (
    <div className="page">
      <div className="page-header-row">
        <h1 className="page-title">Tools</h1>
      </div>
      <p className="tools-tagline">browser-based file utilities &mdash; all processing happens locally</p>

      {Array.from(grouped.entries()).map(([category, tools]) => (
        <section key={category} className="tools-category">
          <h2 className="tools-category-label">{CATEGORY_LABELS[category]}</h2>
          <div className="tools-grid">
            {tools.map(tool => <ToolCard key={tool.slug} tool={tool} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
