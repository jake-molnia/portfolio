import { useState } from 'react'

export default function Base64Codec() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const process = (text: string, m: 'encode' | 'decode') => {
    setInput(text)
    setError('')
    if (!text) {
      setOutput('')
      return
    }
    try {
      if (m === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(text))))
      } else {
        setOutput(decodeURIComponent(escape(atob(text))))
      }
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  const switchMode = (m: 'encode' | 'decode') => {
    setMode(m)
    setOutput('')
    setError('')
    process(input, m)
  }

  return (
    <div>
      <div className="tool-actions">
        <button
          className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => switchMode('encode')}
        >
          Encode
        </button>
        <button
          className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => switchMode('decode')}
        >
          Decode
        </button>
      </div>

      <div className="tool-section">
        <label className="tool-section-label">Input</label>
        <textarea
          className="tool-textarea"
          rows={8}
          placeholder={mode === 'encode' ? 'Text to encode...' : 'Base64 string to decode...'}
          value={input}
          onChange={e => process(e.target.value, mode)}
        />
      </div>

      <div className="tool-section">
        <label className="tool-section-label">Output</label>
        <textarea
          className="tool-textarea"
          rows={8}
          readOnly
          value={output}
        />
        {error && (
          <p className="tool-stat" style={{ color: '#f85149', marginTop: '0.5rem' }}>{error}</p>
        )}
      </div>

      <div className="tool-actions">
        <button className="btn btn-ghost" onClick={() => copy(output)} disabled={!output}>
          {copied ? 'Copied!' : 'Copy Output'}
        </button>
      </div>
    </div>
  )
}
