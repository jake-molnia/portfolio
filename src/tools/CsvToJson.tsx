import { useState, useRef } from 'react'

/** Parse a single CSV row respecting quoted fields. */
function parseCsvRow(line: string): string[] {
  const fields: string[] = []
  let i = 0
  while (i <= line.length) {
    if (i === line.length) {
      fields.push('')
      break
    }
    if (line[i] === '"') {
      // Quoted field
      let value = ''
      i++ // skip opening quote
      while (i < line.length) {
        if (line[i] === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            value += '"'
            i += 2
          } else {
            i++ // skip closing quote
            break
          }
        } else {
          value += line[i]
          i++
        }
      }
      fields.push(value)
      if (i < line.length && line[i] === ',') i++ // skip comma
    } else {
      // Unquoted field
      const next = line.indexOf(',', i)
      if (next === -1) {
        fields.push(line.slice(i))
        break
      } else {
        fields.push(line.slice(i, next))
        i = next + 1
      }
    }
  }
  return fields
}

/** Auto-detect type for a string value. */
function autoType(val: string): unknown {
  if (val === '') return null
  if (val === 'true') return true
  if (val === 'false') return false
  if (val === 'null') return null
  const num = Number(val)
  if (val.trim() !== '' && !isNaN(num) && isFinite(num)) return num
  return val
}

function csvToJson(csv: string): Record<string, unknown>[] {
  const lines = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  // Drop trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop()
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row')

  const headers = parseCsvRow(lines[0])
  if (headers.every((h) => h.trim() === '')) {
    throw new Error('Header row is empty')
  }

  const result: Record<string, unknown>[] = []
  for (let r = 1; r < lines.length; r++) {
    if (lines[r].trim() === '') continue
    const fields = parseCsvRow(lines[r])
    const obj: Record<string, unknown> = {}
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c].trim() || `col_${c}`
      obj[key] = autoType(fields[c] ?? '')
    }
    result.push(obj)
  }
  return result
}

export default function CsvToJson() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      setInput(text)
      setError('')
      setOutput('')
      setRowCount(0)
    }
    reader.readAsText(file)
    // Reset input so the same file can be re-uploaded
    e.target.value = ''
  }

  const convert = () => {
    setError('')
    setOutput('')
    setRowCount(0)
    if (!input.trim()) return

    try {
      const json = csvToJson(input)
      const formatted = JSON.stringify(json, null, 2)
      setOutput(formatted)
      setRowCount(json.length)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError('')
    setRowCount(0)
  }

  return (
    <div>
      <div className="tool-section">
        <label className="tool-section-label">Input CSV</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            Upload CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={handleFile} />
        </div>
        <textarea
          className="tool-textarea"
          rows={10}
          placeholder={'name,age,city\nAlice,30,NYC\nBob,25,LA'}
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
          <label className="tool-section-label">JSON Output</label>
          <textarea
            className="tool-textarea"
            rows={12}
            readOnly
            value={output}
          />
          <p className="tool-stat">{rowCount} rows</p>

          <div className="tool-actions">
            <button className="btn btn-ghost" onClick={() => copy(output)}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => download(output, 'data.json', 'application/json')}
            >
              Download JSON
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
