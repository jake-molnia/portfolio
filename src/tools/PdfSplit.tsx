import { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'

function fmtSize(n: number) {
  if (n === 0) return '0 B'
  const k = 1024, s = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(n) / Math.log(k))
  return `${(n / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0)} ${s[i]}`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function parsePageRanges(input: string, maxPages: number): number[] | string {
  const indices: Set<number> = new Set()
  const parts = input.split(',').map(s => s.trim()).filter(Boolean)

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/)
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10)
      const end = parseInt(rangeMatch[2], 10)
      if (start < 1 || end < 1) return `Invalid range "${part}": pages start at 1`
      if (start > maxPages || end > maxPages) return `Range "${part}" exceeds page count (${maxPages})`
      if (start > end) return `Invalid range "${part}": start must be <= end`
      for (let p = start; p <= end; p++) indices.add(p - 1) // 0-based
    } else if (/^\d+$/.test(part)) {
      const num = parseInt(part, 10)
      if (num < 1) return `Invalid page "${part}": pages start at 1`
      if (num > maxPages) return `Page ${num} exceeds page count (${maxPages})`
      indices.add(num - 1) // 0-based
    } else {
      return `Cannot parse "${part}". Use numbers or ranges like "1-3, 5, 7-9"`
    }
  }

  if (indices.size === 0) return 'No pages specified'
  return Array.from(indices).sort((a, b) => a - b)
}

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [rangeText, setRangeText] = useState('')
  const [splitting, setSplitting] = useState(false)
  const [error, setError] = useState('')
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [resultPages, setResultPages] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setError('')
    setResultBlob(null)
    try {
      const bytes = await f.arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      setFile(f)
      setPageCount(doc.getPageCount())
      setPdfBytes(bytes)
      setRangeText('')
    } catch {
      setError('Could not read file as a valid PDF')
    }
    e.target.value = ''
  }

  async function split() {
    if (!pdfBytes) return
    setError('')

    const parsed = parsePageRanges(rangeText, pageCount)
    if (typeof parsed === 'string') {
      setError(parsed)
      return
    }

    setSplitting(true)
    try {
      const src = await PDFDocument.load(pdfBytes)
      const newDoc = await PDFDocument.create()
      const copiedPages = await newDoc.copyPages(src, parsed)
      for (const page of copiedPages) {
        newDoc.addPage(page)
      }
      const outBytes = await newDoc.save()
      const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' })
      setResultBlob(blob)
      setResultPages(newDoc.getPageCount())
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSplitting(false)
    }
  }

  function clear() {
    setFile(null)
    setPageCount(0)
    setPdfBytes(null)
    setRangeText('')
    setError('')
    setResultBlob(null)
    setResultPages(0)
  }

  return (
    <div>
      {!file ? (
        <div className="file-drop-zone" onClick={() => fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={handleFile} />
          <svg className="file-drop-zone-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="file-drop-zone-text"><strong>Drop a PDF here or click to browse</strong></p>
          <p className="file-drop-zone-hint">Accepts: application/pdf</p>
        </div>
      ) : (
        <>
          <div className="tool-section">
            <div className="tool-section-label">Source PDF</div>
            <p className="tool-stat">
              {file.name} &middot; {fmtSize(file.size)} &middot; {pageCount} page{pageCount !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="tool-section">
            <div className="tool-section-label">Page Ranges</div>
            <input
              className="tool-input"
              style={{ width: '100%' }}
              type="text"
              placeholder="e.g. 1-3, 5, 7-9"
              value={rangeText}
              onChange={e => { setRangeText(e.target.value); setResultBlob(null) }}
            />
            <p className="tool-stat">
              Enter page numbers (1-based) separated by commas. Use dashes for ranges.
            </p>
          </div>

          {error && (
            <p className="tool-stat" style={{ color: '#f85149', marginTop: '0.5rem' }}>{error}</p>
          )}

          <div className="tool-actions">
            <button
              className="btn btn-primary"
              onClick={split}
              disabled={splitting || !rangeText.trim()}
            >
              {splitting ? 'Splitting\u2026' : 'Split'}
            </button>
            <button className="btn btn-ghost" onClick={clear}>Clear</button>
          </div>

          {resultBlob && (
            <div className="tool-section">
              <div className="tool-section-label">Result</div>
              <p className="tool-stat">
                Extracted {resultPages} page{resultPages !== 1 ? 's' : ''} &middot; {fmtSize(resultBlob.size)}
              </p>
              <div className="tool-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => downloadBlob(resultBlob, `split-${rangeText.replace(/\s/g, '')}.pdf`)}
                >
                  Download Split PDF
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
