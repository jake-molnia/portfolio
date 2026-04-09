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

interface PdfFile {
  file: File
  pageCount: number
}

export default function PdfMerge() {
  const [files, setFiles] = useState<PdfFile[]>([])
  const [merging, setMerging] = useState(false)
  const [error, setError] = useState('')
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [resultPages, setResultPages] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files
    if (!selected || selected.length === 0) return
    setError('')
    setResultBlob(null)

    const newFiles: PdfFile[] = []
    for (const f of Array.from(selected)) {
      try {
        const bytes = await f.arrayBuffer()
        const doc = await PDFDocument.load(bytes)
        newFiles.push({ file: f, pageCount: doc.getPageCount() })
      } catch {
        setError(`Could not read "${f.name}" as a valid PDF`)
      }
    }
    setFiles(prev => [...prev, ...newFiles])
    // Reset input so the same files can be re-selected
    e.target.value = ''
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setResultBlob(null)
  }

  async function merge() {
    if (files.length < 2) {
      setError('Add at least 2 PDF files to merge')
      return
    }
    setError('')
    setMerging(true)
    try {
      const merged = await PDFDocument.create()
      for (const { file } of files) {
        const bytes = await file.arrayBuffer()
        const src = await PDFDocument.load(bytes)
        const pages = await merged.copyPages(src, src.getPageIndices())
        for (const page of pages) {
          merged.addPage(page)
        }
      }
      const pdfBytes = await merged.save()
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
      setResultBlob(blob)
      setResultPages(merged.getPageCount())
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setMerging(false)
    }
  }

  function clear() {
    setFiles([])
    setResultBlob(null)
    setResultPages(0)
    setError('')
  }

  const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0)

  return (
    <div>
      <div
        className="file-drop-zone"
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={handleFiles}
        />
        <svg
          className="file-drop-zone-icon"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="file-drop-zone-text">
          <strong>Drop PDF files here or click to browse</strong>
        </p>
        <p className="file-drop-zone-hint">Select multiple PDF files</p>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => (
            <div key={i} className="file-list-item">
              <span className="file-list-item-name">{f.file.name}</span>
              <span className="file-list-item-size">
                {fmtSize(f.file.size)} &middot; {f.pageCount} pg
              </span>
              <button
                className="file-list-item-remove"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${f.file.name}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <p className="tool-stat">
          {files.length} file{files.length !== 1 ? 's' : ''} &middot; {totalPages} total page{totalPages !== 1 ? 's' : ''}
        </p>
      )}

      {error && (
        <p className="tool-stat" style={{ color: '#f85149', marginTop: '0.5rem' }}>{error}</p>
      )}

      <div className="tool-actions">
        <button
          className="btn btn-primary"
          onClick={merge}
          disabled={merging || files.length < 2}
        >
          {merging ? 'Merging\u2026' : 'Merge'}
        </button>
        {files.length > 0 && (
          <button className="btn btn-ghost" onClick={clear}>Clear</button>
        )}
      </div>

      {resultBlob && (
        <div className="tool-section">
          <div className="tool-section-label">Result</div>
          <p className="tool-stat">
            Merged PDF: {resultPages} pages &middot; {fmtSize(resultBlob.size)}
          </p>
          <div className="tool-actions">
            <button
              className="btn btn-primary"
              onClick={() => downloadBlob(resultBlob, 'merged.pdf')}
            >
              Download Merged PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
