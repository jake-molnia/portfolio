import { useState, useEffect } from 'react'
import { parseLatexResume } from './parseResume'

function ResumeView({ data }) {
  return (
    <div className="resume-wrapper">
      {/* Left column */}
      <div>
        <div className="r-name">{data.name}</div>
        <div className="r-contact" style={{ marginTop: '0.75rem' }}>
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {data.contact.email && <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a>}
          {data.contact.linkedin && <a href={`https://${data.contact.linkedin}`} target="_blank" rel="noreferrer">{data.contact.linkedin}</a>}
          {data.contact.github && <a href={`https://${data.contact.github}`} target="_blank" rel="noreferrer">{data.contact.github}</a>}
        </div>

        {(data.technicalSkills?.length > 0 || data.additionalSkills?.length > 0) && (
          <div style={{ marginTop: '2rem' }}>
            <div className="rs-label">Skills</div>
            {[...(data.technicalSkills || []), ...(data.additionalSkills || [])].map((s, i) => (
              <div key={i} style={{ marginBottom: '0.6rem' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', marginBottom: '0.25rem' }}>{s.label}</div>
                <div className="skills-grid">
                  {s.value.split(/,\s*/).map((chip, j) => (
                    <span key={j} className="skill-chip">{chip.trim()}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.honours?.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <div className="rs-label">Honours</div>
            {data.honours.map((h, i) => (
              <div key={i} className="rs-entry">
                <div className="rs-title" style={{ fontSize: '0.85rem' }}>{h}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right column */}
      <div>
        {data.education?.length > 0 && (
          <div className="rs">
            <div className="rs-label">Education</div>
            {data.education.map((e, i) => (
              <div key={i} className="rs-entry">
                <div className="rs-row">
                  <span className="rs-title">{e.degree}</span>
                  <span className="rs-date">{e.dates}</span>
                </div>
                <div className="rs-org">{e.institution} · {e.location}</div>
                {e.items.map((item, j) => (
                  <div key={j} className="rs-desc" style={{ marginTop: '0.25rem' }}>— {item}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {data.experience?.length > 0 && (
          <div className="rs">
            <div className="rs-label">Experience</div>
            {data.experience.map((e, i) => (
              <div key={i} className="rs-entry">
                <div className="rs-row">
                  <span className="rs-title">{e.role}</span>
                  <span className="rs-date">{e.dates}</span>
                </div>
                <div className="rs-org">{e.org} · {e.location}</div>
                <ul style={{ marginTop: '0.3rem', paddingLeft: '1rem' }}>
                  {e.items.map((item, j) => (
                    <li key={j} className="rs-desc" style={{ listStyle: 'disc', marginBottom: '0.15rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {data.projects?.length > 0 && (
          <div className="rs">
            <div className="rs-label">Projects</div>
            {data.projects.map((p, i) => (
              <div key={i} className="rs-entry">
                <div className="rs-title" style={{ fontSize: '0.95rem' }}>{p.title}</div>
                <div className="rs-desc">{p.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Resume() {
  const [data, setData] = useState(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    fetch('/resume.tex')
      .then(r => { if (!r.ok) throw new Error(); return r.text() })
      .then(tex => {
        const parsed = parseLatexResume(tex)
        parsed.name ? setData(parsed) : setMissing(true)
      })
      .catch(() => setMissing(true))
  }, [])

  return (
    <div className="page">
      <div style={{ marginBottom: '2.75rem' }}>
        <h1 className="page-title">Résumé</h1>
        <p className="page-sub">// curriculum vitae</p>
      </div>
      {!data && !missing && (
        <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>// loading...</p>
      )}
      {missing && (
        <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>// no resume found — add resume.tex to public/</p>
      )}
      {data && <ResumeView data={data} />}
    </div>
  )
}