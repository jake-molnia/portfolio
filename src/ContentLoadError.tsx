interface ContentLoadErrorProps {
  /** Short heading shown in Syne */
  title?: string
  /** User-facing explanation */
  detail: string
}

export default function ContentLoadError({ title = 'Unable to load this content', detail }: ContentLoadErrorProps) {
  return (
    <div className="content-load-error" role="alert">
      <p className="content-load-error-title">{title}</p>
      <p className="content-load-error-detail">{detail}</p>
    </div>
  )
}
