const BOOKS = [
  { title: 'All of Statistics', author: 'Wasserman', cover: 'var(--c-yellow)', status: 'reading' as const },
  { title: 'Deep Learning', author: 'Goodfellow et al.', cover: 'var(--c-blue)', status: 'read' as const },
  { title: 'Information Theory', author: 'MacKay', cover: 'var(--c-green)', status: 'queue' as const },
]

export default function ReadingSection() {
  return (
    <section id="reading" className="section">
      <div className="container">
        <h2 className="section-title portfolio-section-title">
          Reading <span className="it">list</span>
        </h2>
        <div className="reading-grid">
          {BOOKS.map(b => (
            <div key={b.title} className="book">
              <div className="cover" style={{ background: b.cover }}>
                <div className="title">{b.title}</div>
                <div className="author">{b.author}</div>
              </div>
              <div className={`status ${b.status === 'reading' ? 'reading' : ''}`}>
                {b.status === 'reading' ? 'Reading' : b.status === 'read' ? 'Read' : 'Queued'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
