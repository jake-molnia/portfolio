import { useState, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).href
} catch {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).href
  } catch {
    // Worker setup failed; pdfjs will fall back to main thread
  }
}

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

interface RenderedImage {
  blob: Blob
  url: string
  pageNum: number
  width: number
  height: number
}

type ImageFormat = 'png' | 'jpeg'
type ScaleOption = 1 | 1.5 | 2

export default function PdfToImages() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfProxy, setPdfProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [format, setFormat] = useState<ImageFormat>('png')
  const [quality, setQuality] = useState(0.85)
  const [scale, setScale] = useState<ScaleOption>(1.5)
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [images, setImages] = useState<RenderedImage[]>([])
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setError('')
    cleanup()
    try {
      const bytes = await f.arrayBuffer()
      const proxy = await pdfjsLib.getDocument({ data: bytes }).promise
      setFile(f)
      setPdfProxy(proxy)
      setPageCount(proxy.numPages)
    } catch {
      setError('Could not read file as a valid PDF')
    }
    e.target.value = ''
  }

  function cleanup() {
    // Revoke old object URLs
    for (const img of images) {
      URL.revokeObjectURL(img.url)
    }
    setImages([])
    setProgress({ current: 0, total: 0 })
  }

  async function convert() {
    if (!pdfProxy) return
    setError('')
    setConverting(true)
    cleanup()

    const total = pdfProxy.numPages
    setProgress({ current: 0, total })
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
    const results: RenderedImage[] = []

    try {
      for (let i = 1; i <= total; i++) {
        const page = await pdfProxy.getPage(i)
        const vp = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = vp.width
        canvas.height = vp.height
        await page.render({ canvas, viewport: vp }).promise

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            b => (b ? resolve(b) : reject(new Error(`Failed to render page ${i}`))),
            mimeType,
            format === 'jpeg' ? quality : undefined,
          )
        })

        const url = URL.createObjectURL(blob)
        results.push({ blob, url, pageNum: i, width: vp.width, height: vp.height })
        setProgress({ current: i, total })
        // Update images incrementally so user sees progress
        setImages([...results])
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setConverting(false)
    }
  }

  function downloadAll() {
    const ext = format === 'png' ? 'png' : 'jpg'
    for (const img of images) {
      downloadBlob(img.blob, `page-${img.pageNum}.${ext}`)
    }
  }

  function clear() {
    if (pdfProxy) pdfProxy.destroy()
    cleanup()
    setFile(null)
    setPdfProxy(null)
    setPageCount(0)
    setError('')
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
            <div className="tool-section-label">Options</div>
            <div className="tool-actions">
              <select
                className="tool-select"
                value={format}
                onChange={e => setFormat(e.target.value as ImageFormat)}
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>

              <select
                className="tool-select"
                value={scale}
                onChange={e => setScale(Number(e.target.value) as ScaleOption)}
              >
                <option value={1}>1x (72 DPI)</option>
                <option value={1.5}>1.5x (108 DPI)</option>
                <option value={2}>2x (144 DPI)</option>
              </select>
            </div>

            {format === 'jpeg' && (
              <div className="tool-range-group" style={{ marginTop: '0.75rem' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--muted2)' }}>
                  Quality
                </label>
                <input
                  className="tool-range"
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={e => setQuality(Number(e.target.value))}
                />
                <span className="tool-range-value">{Math.round(quality * 100)}%</span>
              </div>
            )}
          </div>

          {error && (
            <p className="tool-stat" style={{ color: '#f85149', marginTop: '0.5rem' }}>{error}</p>
          )}

          <div className="tool-actions">
            <button
              className="btn btn-primary"
              onClick={convert}
              disabled={converting}
            >
              {converting
                ? `Converting ${progress.current}/${progress.total}\u2026`
                : 'Convert'}
            </button>
            {images.length > 1 && (
              <button className="btn btn-ghost" onClick={downloadAll}>
                Download All ({images.length})
              </button>
            )}
            <button className="btn btn-ghost" onClick={clear}>Clear</button>
          </div>

          {images.length > 0 && (
            <div className="tool-section">
              <div className="tool-section-label">
                Rendered Images ({images.length}/{pageCount})
              </div>
              <div className="pdf-page-grid">
                {images.map(img => {
                  const ext = format === 'png' ? 'png' : 'jpg'
                  return (
                    <div key={img.pageNum} className="pdf-page-thumb" style={{ aspectRatio: 'auto' }}>
                      <a
                        href={img.url}
                        download={`page-${img.pageNum}.${ext}`}
                        title={`Download page ${img.pageNum}`}
                        style={{ display: 'block' }}
                      >
                        <img
                          src={img.url}
                          alt={`Page ${img.pageNum}`}
                          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }}
                        />
                      </a>
                      <div className="pdf-page-thumb-label">
                        Page {img.pageNum} &middot; {fmtSize(img.blob.size)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
