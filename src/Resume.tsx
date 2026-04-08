import { useState, useEffect } from 'react'
import { cdn, fetchCdn, fetchCdnJson } from './cdn'
import PdfDownloadLink from './PdfDownloadLink'
import ResumeSkills from './ResumeSkills'
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
      <div className="resume-sidebar">
        <div className="r-name">{data.name}</div>
        <div className="r-contact">
          {data.contact.phone    && <span>{data.contact.phone}</span>}
          {data.contact.email    && <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a>}
          {data.contact.linkedin && <a href={`https://${data.contact.linkedin}`} target="_blank" rel="noreferrer">{data.contact.linkedin}</a>}
          {data.contact.github   && <a href={`https://${data.contact.github}`}   target="_blank" rel="noreferrer">{data.contact.github}</a>}
        </div>

        {data.skills && data.skills.length > 0 && <ResumeSkills groups={data.skills} />}

        {data.honours && data.honours.length > 0 && (
          <div className="rs rs-honours-section">
            <div className="rs-label">Honours</div>
            {data.honours.map((h, i) => (
              <div key={i} className="rs-entry">
                <div className="rs-honour-text">{h}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="resume-main">
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
                  <div key={j} className="rs-detail">{item}</div>
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
                <ul className="rs-bullets">
                  {e.items.map((item, j) => (
                    <li key={j} className="rs-desc">{item}</li>
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
                <div className="rs-project-title">{p.title}</div>
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
    fetchCdnJson<ResumeData>('resume/resume.json')
      .then(setData)
      .catch(() => setMissing(true))
  }, [])

  useEffect(() => {
    fetchCdn('resume/resume.pdf', { method: 'HEAD' })
      .then(() => setHasPdf(true))
      .catch(() => setHasPdf(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header-row">
        <h1 className="page-title">Résumé</h1>
        {hasPdf && (
          <PdfDownloadLink href={cdn('resume/resume.pdf')} label="Download résumé PDF" onClick={() => capture('resume pdf downloaded')} />
        )}
      </div>
      {!data && !missing && <p className="resume-status">{'// loading...'}</p>}
      {missing && <p className="resume-status">{'// no resume found \u2014 add resume.json to R2 bucket'}</p>}
      {data && <ResumeView data={data} />}
    </div>
  )
}
