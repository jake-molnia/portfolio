import { useState } from 'react'
import PDFViewer from './PDFViewer'

const RESUME_PDF = '/placeholder-resume.pdf'

export default function Resume() {
  const [viewing, setViewing] = useState(false)

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2.75rem' }}>
        <div>
          <h1 className="page-title">Résumé</h1>
          <p className="page-sub" style={{marginBottom:0}}>// curriculum vitae</p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem', paddingTop:'0.25rem' }}>
          <button className="btn btn-ghost" onClick={() => setViewing(true)}>View PDF</button>
          <a href={RESUME_PDF} download className="btn btn-primary">↓ Download</a>
        </div>
      </div>

      <div className="resume-wrapper">
        <div>
          <div className="r-name">Alex Researcher</div>
          <div className="r-role">PhD · ML Systems</div>
          <div className="r-contact">
            <a href="mailto:alex@mit.edu">alex@mit.edu</a>
            <a href="https://github.com/alexresearcher" target="_blank" rel="noreferrer">github</a>
            <a href="https://scholar.google.com" target="_blank" rel="noreferrer">google scholar</a>
            <span>MIT CSAIL</span>
            <span>Cambridge, MA</span>
          </div>

          <div style={{ marginTop:'2rem' }}>
            <div className="rs-label">Skills</div>
            <div className="skills-grid">
              {['PyTorch','JAX','CUDA','Python','C++','Rust','Triton','Kubernetes'].map(s => (
                <span key={s} className="skill-chip">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="rs">
            <div className="rs-label">Education</div>
            <div className="rs-entry">
              <div className="rs-row"><span className="rs-title">PhD, Computer Science</span><span className="rs-date">2021 – present</span></div>
              <div className="rs-org">Massachusetts Institute of Technology</div>
              <div className="rs-desc">Thesis: Geometry of Learned Representations in Foundation Models. Advised by Prof. Y. Supervisor.</div>
            </div>
            <div className="rs-entry">
              <div className="rs-row"><span className="rs-title">BSc, Mathematics & CS</span><span className="rs-date">2017 – 2021</span></div>
              <div className="rs-org">Stanford University</div>
              <div className="rs-desc">Graduated with Distinction. Thesis on spectral methods for graph neural networks.</div>
            </div>
          </div>

          <div className="rs">
            <div className="rs-label">Experience</div>
            <div className="rs-entry">
              <div className="rs-row"><span className="rs-title">Research Intern</span><span className="rs-date">Summer 2023</span></div>
              <div className="rs-org">Google DeepMind · London</div>
              <div className="rs-desc">Efficient inference for large language models. Adaptive KV cache compression reducing memory 40% with &lt;0.5% perplexity increase.</div>
            </div>
            <div className="rs-entry">
              <div className="rs-row"><span className="rs-title">Research Intern</span><span className="rs-date">Summer 2022</span></div>
              <div className="rs-org">Anthropic · San Francisco</div>
              <div className="rs-desc">Mechanistic interpretability. Automated circuit discovery tools for identifying features in transformer activations.</div>
            </div>
          </div>

          <div className="rs">
            <div className="rs-label">Selected Publications</div>
            <div className="rs-entry">
              <div className="rs-title">Emergent Capabilities in Large-Scale Neural Systems</div>
              <div className="rs-org">NeurIPS 2024 — Spotlight</div>
            </div>
            <div className="rs-entry">
              <div className="rs-title">Efficient Distributed Inference via Adaptive Tensor Partitioning</div>
              <div className="rs-org">MLSys 2024</div>
            </div>
            <div className="rs-entry">
              <div className="rs-title">Geometric Signatures of Aligned Representations</div>
              <div className="rs-org">ICLR 2023</div>
            </div>
          </div>

          <div className="rs">
            <div className="rs-label">Awards</div>
            <div className="rs-entry">
              <div className="rs-row"><span className="rs-title">NSF Graduate Research Fellowship</span><span className="rs-date">2021</span></div>
            </div>
            <div className="rs-entry">
              <div className="rs-row"><span className="rs-title">NeurIPS Outstanding Paper Award</span><span className="rs-date">2024</span></div>
            </div>
          </div>
        </div>
      </div>

      {viewing && <PDFViewer title="Résumé" url={RESUME_PDF} onClose={() => setViewing(false)} />}
    </div>
  )
}