const PROJECTS = [
  {
    title: 'Research stack',
    lang: 'Python',
    langColor: 'var(--c-blue)',
    desc: 'Experiments, training loops, and evaluation harnesses — reproducibility first.',
    meta: 'ML · systems',
  },
  {
    title: 'Browser tools',
    lang: 'TypeScript',
    langColor: 'var(--c-orange)',
    desc: 'Small utilities that stay local: codecs, PDF helpers, and quick transforms.',
    meta: 'Web',
  },
  {
    title: 'Writing',
    lang: 'Prose',
    langColor: 'var(--c-purple)',
    desc: 'Long-form notes on methods, failure modes, and what held up in practice.',
    meta: 'Blog',
  },
] as const

export default function ProjectsSection() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <h2 className="section-title portfolio-section-title">
          Projects <span className="it">&amp; builds</span>
        </h2>
        <div className="project-grid">
          {PROJECTS.map((p, i) => (
            <article
              key={p.title}
              className="card project-card portfolio-card"
              style={{ animationDelay: `${0.06 + i * 0.09}s` }}
            >
              <div className="lang">
                <span className="dot" style={{ background: p.langColor }} />
                {p.lang}
              </div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="project-meta">
                <span>{p.meta}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
