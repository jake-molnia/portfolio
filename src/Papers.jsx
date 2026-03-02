import { useState } from 'react'
import PDFViewer from './PDFViewer'

const PAPERS = [
  {
    id: 'neural-scaling-2024',
    tag: 'Machine Learning · NeurIPS 2024',
    title: 'Emergent Capabilities in Large-Scale Neural Systems: A Theoretical Framework',
    authors: 'A. Researcher, B. Collaborator, C. Advisor',
    abstract: 'We present a unified theoretical framework for understanding emergent capabilities in large-scale neural systems. Drawing on statistical mechanics and information theory, we derive scaling laws that predict phase transitions in model behavior as a function of parameter count and training compute.',
    pdf: '/placeholder-paper.pdf',
  },
  {
    id: 'distributed-inference-2024',
    tag: 'Systems · MLSys 2024',
    title: 'Efficient Distributed Inference for Trillion-Parameter Models via Adaptive Tensor Partitioning',
    authors: 'A. Researcher, D. Engineer',
    abstract: 'Serving trillion-parameter language models at low latency remains an open challenge. We introduce adaptive tensor partitioning, a dynamic inference strategy that reduces end-to-end latency by 2.3× while maintaining identical output quality, with near-linear scaling up to 256 devices.',
    pdf: '/placeholder-paper.pdf',
  },
  {
    id: 'alignment-geometry-2023',
    tag: 'AI Safety · ICLR 2023',
    title: 'Geometric Signatures of Aligned Representations in Transformer Models',
    authors: 'A. Researcher, E. Theorist, F. Safety',
    abstract: 'We investigate the geometric structure of internal representations in transformer models trained with RLHF. Using topological data analysis, we identify persistent homological features that correlate strongly with downstream alignment properties.',
    pdf: '/placeholder-paper.pdf',
  },
]

export default function Papers() {
  const [active, setActive] = useState(null)

  return (
    <div className="page">
      <h1 className="page-title">Research</h1>
      <p className="page-sub">// selected publications</p>

      <div className="paper-list">
        {PAPERS.map(p => (
          <div key={p.id} className="paper-item" onClick={() => setActive(p)}>
            <div className="paper-meta">{p.tag}</div>
            <div className="paper-title">{p.title}</div>
            <div className="paper-authors">{p.authors}</div>
            <p className="paper-abstract">{p.abstract}</p>
            <div className="paper-read">Open paper →</div>
          </div>
        ))}
      </div>

      {active && (
        <PDFViewer title={active.title} url={active.pdf} onClose={() => setActive(null)} />
      )}
    </div>
  )
}