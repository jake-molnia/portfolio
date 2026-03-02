export default function PDFViewer({ title, url, onClose }) {
  return (
    <div className="pdf-overlay">
      <div className="pdf-header">
        <span className="pdf-header-title">{title}</span>
        <div className="pdf-header-actions">
          <a href={url} download className="btn btn-primary">
            ↓ Download PDF
          </a>
          <button onClick={onClose} className="btn btn-ghost">✕ Close</button>
        </div>
      </div>
      <div className="pdf-body">
        <iframe src={url} title={title} />
      </div>
    </div>
  )
}