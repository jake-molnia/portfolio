interface PageBackButtonProps {
  onClick: () => void
  /** Extra class on the button (e.g. for layout wrappers) */
  className?: string
}

export default function PageBackButton({ onClick, className = '' }: PageBackButtonProps) {
  return (
    <button type="button" className={`page-back-btn ${className}`.trim()} onClick={onClick}>
      <svg className="page-back-btn-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Back
    </button>
  )
}
