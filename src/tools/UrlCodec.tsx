import { useState, useEffect } from 'react'

export default function UrlCodec() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [copied, setCopied] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  useEffect(() => {
    if (!input) {
      setOutput('')
      return
    }
    try {
      setOutput(mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input))
    } catch {
      setOutput('Invalid input')
    }
  }, [input, mode])

  return (
    <div>
      <div className="tool-section">
        <label className="tool-section-label">Input</label>
        <textarea
          className="tool-textarea"
          rows={6}
          placeholder="Enter text or URL..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>

      <div className="tool-actions">
        <button
          className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMode('encode')}
        >
          Encode
        </button>
        <button
          className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMode('decode')}
        >
          Decode
        </button>
        <button className="btn btn-ghost" onClick={() => copy(output)} disabled={!output}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="tool-section">
        <label className="tool-section-label">Output</label>
        <textarea
          className="tool-textarea"
          rows={6}
          readOnly
          value={output}
        />
      </div>
    </div>
  )
}
