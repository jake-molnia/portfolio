export default function AboutStrip() {
  return (
    <section id="about" className="section">
      <div className="container">
        <div className="about-grid">
          <div className="about-left">
            <h2 className="section-title">
              About <span className="it">the work</span>
            </h2>
            <p>
              I care about models that are small enough to reason about, benchmarks that tell the truth, and the gap
              between what papers claim and what code does.
            </p>
            <p>
              This site is a living notebook: research notes, occasional blog posts, and tools I actually use.
            </p>
          </div>
          <div className="about-right">
            <div className="card">
              <div className="card-label">Now</div>
              <p className="mono" style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--ink-muted)' }}>
                Building; writing; reading papers on optimization and generalization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
