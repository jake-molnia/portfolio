import { useState } from 'react'

function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

function jsonToCsv(json: unknown[]): string {
  const headers = new Set<string>()
  for (const row of json) {
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      for (const key of Object.keys(row)) headers.add(key)
    }
  }
  const cols = Array.from(headers)
  const headerLine = cols.map(escapeCsvField).join(',')
  const lines = json.map((row) => {
    const obj = (row && typeof row === 'object' && !Array.isArray(row) ? row : {}) as Record<string, unknown>
    return cols.map((col) => escapeCsvField(obj[col])).join(',')
  })
  return [headerLine, ...lines].join('\n')
}

export default function JsonToCsv() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [colCount, setColCount] = useState(0)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const download = (content: string, filename: string, mime = 'text/plain') => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([content], { type: mime }))
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const convert = () => {
    setError('')
    setOutput('')
    setRowCount(0)
    setColCount(0)
    if (!input.trim()) return

    try {
      const parsed = JSON.parse(input)
      if (!Array.isArray(parsed)) {
        setError('Input must be a JSON array of objects')
        return
      }
      if (parsed.length === 0) {
        setError('Array is empty')
        return
      }
      const nonObjects = parsed.some(
        (item) => !item || typeof item !== 'object' || Array.isArray(item)
      )
      if (nonObjects) {
        setError('All array items must be objects')
        return
      }
      const csv = jsonToCsv(parsed)
      setOutput(csv)
      const headers = new Set<string>()
      for (const row of parsed) {
        for (const key of Object.keys(row)) headers.add(key)
      }
      setRowCount(parsed.length)
      setColCount(headers.size)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError('')
    setRowCount(0)
    setColCount(0)
  }

  return (
    <div>
      <div className="tool-section">
        <label className="tool-section-label">Input JSON (array of objects)</label>
        <textarea
          className="tool-textarea"
          rows={10}
          placeholder={'[\n  { "name": "Alice", "age": 30 },\n  { "name": "Bob", "age": 25 }\n]'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {error && (
          <p className="tool-stat" style={{ color: '#f85149', marginTop: '0.5rem' }}>{error}</p>
        )}
      </div>

      <div className="tool-actions">
        <button className="btn btn-primary" onClick={convert} disabled={!input.trim()}>
          Convert
        </button>
        <button className="btn btn-ghost" onClick={clear}>Clear</button>
      </div>

      {output && (
        <div className="tool-section">
          <label className="tool-section-label">CSV Output</label>
          <textarea
            className="tool-textarea"
            rows={10}
            readOnly
            value={output}
          />
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <p className="tool-stat">{rowCount} rows</p>
            <p className="tool-stat">{colCount} columns</p>
          </div>

          <div className="tool-actions">
            <button className="btn btn-ghost" onClick={() => copy(output)}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => download(output, 'data.csv', 'text/csv')}
            >
              Download CSV
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
