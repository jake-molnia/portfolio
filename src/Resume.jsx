import { useState, useCallback } from 'react'
import { parseLatexResume } from './parseResume'

const JACOB = {
  name: 'Jacob Raoul Molnia',
  contact: {
    phone: '+1 (703) 398 4682',
    email: 'jacob@molnia.net',
    linkedin: 'linkedin.com/in/jacob-molnia',
    github: 'github.com/jake-molnia',
  },
  education: [
    {
      institution: 'Worcester Polytechnic Institute',
      location: 'Worcester, MA, USA',
      degree: 'Computer Science (BS/MS); Mathematical Science (BS)',
      dates: 'Aug 2023 – May 2027',
      items: [
        'Relevant Coursework: Object-Oriented Programming, Systems Programming, Discrete Optimization, Combinatorics, Linear Algebra, Ordinary Differential Equations, Topology, Real Analysis',
        'Relevant Graduate Coursework: Algorithms, Artificial Intelligence, Operating Systems, Machine Learning, ML DevOps, Deep Learning, Foundations of Computer Science',
      ],
    },
    {
      institution: 'Privates Gymnasium Huber',
      location: 'Munich, Bav, DE',
      degree: 'Abitur Degree — Bavaria (German Pre-College Diploma)',
      dates: 'Sept 2014 – June 2022',
      items: [],
    },
  ],
  technicalSkills: [
    { label: 'Programming Languages', value: 'C/C++, Python, golang, Rust' },
    { label: 'Libraries and Tools', value: 'git, torch, tensorflow, wandb, huggingface, nix, grafana, prometheus, uv, pandas, numpy, k3s, docker' },
  ],
  additionalSkills: [
    { label: 'Languages', value: 'German (native), English (native), Latin (Basic)' },
    { label: 'Software', value: 'KICAD, MATLAB, Overleaf, proxmox' },
  ],
  experience: [
    {
      role: 'Research Assistant',
      location: 'Worcester, MA',
      org: 'Professor Murai, Worcester Polytechnic Institute',
      dates: 'May 2025 – Present',
      items: [
        'Active research with a focus on TSFM, LLM-lasso, RAG, Prefix-tuning',
        'Developed useful skills in paper writing and common research processes.',
      ],
    },
    {
      role: 'Research Assistant',
      location: 'Worcester, MA',
      org: 'Professor Paffenroth, Worcester Polytechnic Institute',
      dates: 'May 2025 – Present',
      items: [
        'Active research with focus on Dynamical Systems, Reinforcement learning, RNNs and traditional MLPs',
      ],
    },
    {
      role: 'Undergraduate Research Assistant',
      location: 'Worcester, MA',
      org: 'TMS Lab, Worcester Polytechnic Institute',
      dates: 'May 2024 – January 2025',
      items: [
        'Consolidated multiple paper-specific software toolkits into unified MATLAB framework, improving maintainability and scalability.',
        'Implemented comprehensive unit testing framework for CI/CD and robust software development.',
        'Applied unit testing methodologies, version control systems, and object-oriented programming techniques.',
      ],
    },
    {
      role: 'Academic Tutor & Teaching Assistant & ARC Resource Coordinator',
      location: 'Worcester, MA',
      org: 'Worcester Polytechnic Institute',
      dates: 'May 2024 – Present',
      items: [
        'Provide expert tutoring in advanced mathematics and computer science subjects through the Academic Resource Center.',
        'Serve as a Teaching Assistant in the Computer Science Department, conducting office hours, leading lab sessions, and grading assignments. Creating and overseeing homework assignments for AI.',
      ],
    },
  ],
  projects: [
    {
      title: 'Traceface',
      desc: 'Real-time facial recognition system leveraging YOLOv8 and DeepFace. Implemented parallel processing architecture achieving 15+ FPS with 97.35% accuracy on LFW dataset, integrated with ChromaDB for efficient embedding storage.',
    },
    {
      title: 'Email Priority Ranking with Neural Networks',
      desc: 'Developed multivariate email prioritization system using CNN ensemble and SimCSE-BERT models. Implemented auto-labeling pipeline with BART-MNLI and VADER sentiment analysis on 500K Enron emails dataset. Achieved modular architecture combining urgency detection and sentiment analysis with tunable weighting parameters.',
    },
  ],
  honours: [
    'Dean\'s List — Worcester Polytechnic Institute',
    'Best PLA Computer Science — Worcester Polytechnic Institute 2024/2025',
  ],
}

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
  const [data, setData] = useState(JACOB)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback((file) => {
    if (!file || !file.name.endsWith('.tex')) {
      setError('Please upload a .tex file')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = parseLatexResume(e.target.result)
        if (!parsed.name) throw new Error('Could not parse resume — unsupported template?')
        setData(parsed)
      } catch (err) {
        setError(err.message)
      }
    }
    reader.readAsText(file)
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.75rem' }}>
        <div>
          <h1 className="page-title">Résumé</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>// curriculum vitae</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem', alignItems: 'center' }}>
          <label
            style={{ cursor: 'pointer' }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <span className={`btn btn-ghost ${dragging ? 'active' : ''}`} style={dragging ? { borderColor: 'var(--text)', color: 'var(--text)' } : {}}>
              ↑ Upload .tex
            </span>
            <input type="file" accept=".tex" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
          </label>
          {data !== JACOB && (
            <button className="btn btn-ghost" onClick={() => { setData(JACOB); setError(null) }}>Reset</button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', border: '1px solid #5a1a1a', borderRadius: '4px', color: '#ff6b6b', fontSize: '0.8rem', fontFamily: 'Syne Mono, monospace' }}>
          {error}
        </div>
      )}

      <ResumeView data={data} />
    </div>
  )
}