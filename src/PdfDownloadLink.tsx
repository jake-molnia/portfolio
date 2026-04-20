function DownloadGlyph() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

interface PdfDownloadLinkProps {
  href: string
  /** Shown to screen readers and as hover tooltip */
  label: string
  onClick?: () => void
  /** `editorial` — chunky outlined pill with visible “PDF” (e.g. résumé header) */
  variant?: 'icon' | 'editorial'
}

export default function PdfDownloadLink({ href, label, onClick, variant = 'icon' }: PdfDownloadLinkProps) {
  if (variant === 'editorial') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="pdf-download-editorial"
        aria-label={label}
        title={label}
        onClick={onClick}
      >
        <DownloadGlyph />
        <span className="pdf-download-editorial-text">PDF</span>
      </a>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="pdf-download-icon"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <DownloadGlyph />
    </a>
  )
}
