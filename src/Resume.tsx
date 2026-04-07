import { useState, useEffect } from 'react'
import { cdn } from './cdn'
import { capture } from './posthog'

interface ResumeContact {
  phone?: string
  email?: string
  linkedin?: string
  github?: string
}

interface Skill {
  label: string
  value: string
}

interface Education {
  degree: string
  dates: string
  institution: string
  location: string
  items: string[]
}

interface Experience {
  role: string
  dates: string
  org: string
  location: string
  items: string[]
}

interface Project {
  title: string
  desc: string
}

interface ResumeData {
  name: string
  contact: ResumeContact
  skills?: Skill[]
  honours?: string[]
  education?: Education[]
  experience?: Experience[]
  projects?: Project[]
}

function ResumeView({ data }: { data: ResumeData }) {
  return (
    <div className="resume-wrapper">
      <div>
        <div className="r-name">{data.name}</div>
        <div className="r-contact" style={{ marginTop: '0.75rem' }}>
          {data.contact.phone    && <span>{data.contact.phone}</span>}
          {data.contact.email    && <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a>}
          {data.contact.linkedin && <a href={`https://${data.contact.linkedin}`} target="_blank" rel="noreferrer">{data.contact.linkedin}</a>}
          {data.contact.github   && <a href={`https://${data.contact.github}`}   target="_blank" rel="noreferrer">{data.contact.github}</a>}
        </div>

        {data.skills && data.skills.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <div className="rs-label">Skills</div>
            {data.skills.map((s, i) => (
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

        {data.honours && data.honours.length > 0 && (
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

      <div>
        {data.education && data.education.length > 0 && (
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

        {data.experience && data.experience.length > 0 && (
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

        {data.projects && data.projects.length > 0 && (
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
  const [data, setData]       = useState<ResumeData | null>(null)
  const [missing, setMissing] = useState(false)
  const [hasPdf, setHasPdf]   = useState(false)

  useEffect(() => {
    fetch(cdn('resume/resume.json'))
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setData)
      .catch(() => setMissing(true))
  }, [])

  useEffect(() => {
    fetch(cdn('resume/resume.pdf'), { method: 'HEAD' })
      .then(r => setHasPdf(r.ok))
      .catch(() => setHasPdf(false))
  }, [])

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Résumé</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>// curriculum vitae</p>
        </div>
        {hasPdf && (
          <a href={cdn('resume/resume.pdf')} target="_blank" rel="noreferrer" className="btn btn-primary" onClick={() => capture('resume pdf downloaded')}>↓ Download PDF</a>
        )}
      </div>
      {!data && !missing && <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>// loading...</p>}
      {missing && <p style={{ color: 'var(--muted)', fontFamily: 'Syne Mono, monospace', fontSize: '0.8rem' }}>// no resume found — add resume.json to R2 bucket</p>}
      {data && <ResumeView data={data} />}
    </div>
  )
}
