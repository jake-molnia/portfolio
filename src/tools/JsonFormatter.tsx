import { useState } from 'react'

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const format = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  const minify = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <div>
      <div className="tool-section">
        <label className="tool-section-label">Input JSON</label>
        <textarea
          className="tool-textarea"
          rows={10}
          placeholder="Paste JSON here..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        {error && (
          <p className="tool-stat" style={{ color: '#f85149', marginTop: '0.5rem' }}>{error}</p>
        )}
      </div>

      <div className="tool-actions">
        <button className="btn btn-primary" onClick={format}>Format</button>
        <button className="btn btn-ghost" onClick={minify}>Minify</button>
        <button className="btn btn-ghost" onClick={() => copy(output)} disabled={!output}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button className="btn btn-ghost" onClick={clear}>Clear</button>
      </div>

      {output && (
        <div className="tool-section">
          <label className="tool-section-label">Output</label>
          <textarea
            className="tool-textarea"
            rows={10}
            readOnly
            value={output}
          />
        </div>
      )}
    </div>
  )
}
