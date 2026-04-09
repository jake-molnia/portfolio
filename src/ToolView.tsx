import { Suspense, lazy, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageBackButton from './PageBackButton'
import { getToolBySlug } from './toolRegistry'
import { capture } from './posthog'

export default function ToolView() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const tool = slug ? getToolBySlug(slug) : undefined

  useEffect(() => {
    if (tool) capture('tool viewed', { tool: tool.slug })
  }, [tool])

  const LazyComponent = useMemo(() => {
    if (!tool) return null
    return lazy(tool.component)
  }, [tool])

  if (!tool || !LazyComponent) {
    return (
      <div className="page">
        <div className="page-back-row">
          <PageBackButton onClick={() => navigate('/tools')} />
        </div>
        <h1 className="page-title">Tool not found</h1>
        <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          The tool &ldquo;{slug}&rdquo; doesn&rsquo;t exist.
        </p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-back-row">
        <PageBackButton onClick={() => navigate('/tools')} />
      </div>
      <h1 className="page-title">{tool.name}</h1>
      {tool.lossy && (
        <div className="tool-lossy-warning">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
          </svg>
          This tool may reduce quality. Output is not lossless.
        </div>
      )}
      <Suspense fallback={<div className="page-loader" />}>
        <LazyComponent />
      </Suspense>
    </div>
  )
}
