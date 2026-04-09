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

export default function PdfCompress() {
  const [file, setFile] = useState<File | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [compressedSize, setCompressedSize] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setError('')
    setResultBlob(null)
    try {
      // Verify it's a valid PDF
      const bytes = await f.arrayBuffer()
      await PDFDocument.load(bytes)
      setFile(f)
      setOriginalSize(f.size)
    } catch {
      setError('Could not read file as a valid PDF')
    }
    e.target.value = ''
  }

  async function compress() {
    if (!file) return
    setError('')
    setCompressing(true)
    try {
      const bytes = await file.arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const outBytes = await doc.save()
      const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' })
      setResultBlob(blob)
      setCompressedSize(blob.size)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCompressing(false)
    }
  }

  function clear() {
    setFile(null)
    setOriginalSize(0)
    setResultBlob(null)
    setCompressedSize(0)
    setError('')
  }

  const saved = originalSize > 0 && compressedSize > 0
    ? ((1 - compressedSize / originalSize) * 100)
    : 0

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
              {file.name} &middot; {fmtSize(originalSize)}
            </p>
          </div>

          <p className="tool-stat" style={{ marginTop: '0.75rem' }}>
            Compression works by re-serializing the PDF, which removes unused objects, duplicate
            resources, and metadata bloat. It will not significantly reduce the size of image-heavy
            PDFs since embedded images are not recompressed.
          </p>

          {error && (
            <p className="tool-stat" style={{ color: '#f85149', marginTop: '0.5rem' }}>{error}</p>
          )}

          <div className="tool-actions">
            <button
              className="btn btn-primary"
              onClick={compress}
              disabled={compressing}
            >
              {compressing ? 'Compressing\u2026' : 'Compress'}
            </button>
            <button className="btn btn-ghost" onClick={clear}>Clear</button>
          </div>

          {resultBlob && (
            <div className="tool-section">
              <div className="tool-section-label">Result</div>
              <p className="tool-stat">
                Original: {fmtSize(originalSize)}
              </p>
              <p className="tool-stat">
                Compressed: {fmtSize(compressedSize)}
              </p>
              <p className="tool-stat">
                {saved > 0
                  ? `Saved ${saved.toFixed(1)}%`
                  : saved < 0
                    ? `File grew by ${Math.abs(saved).toFixed(1)}% (re-serialization added structure)`
                    : 'No size change'}
              </p>
              <div className="tool-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => downloadBlob(resultBlob, `compressed-${file.name}`)}
                >
                  Download Compressed PDF
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
