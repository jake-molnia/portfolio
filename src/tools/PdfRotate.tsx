import { useState, useRef, useEffect, useCallback } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
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

async function renderPageThumb(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  maxWidth = 150,
) {
  const page = await pdfDoc.getPage(pageNum)
  const vp = page.getViewport({ scale: 1 })
  const scale = maxWidth / vp.width
  const viewport = page.getViewport({ scale })
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({ canvas, viewport }).promise
}

type RotateDirection = 90 | -90 | 180

export default function PdfRotate() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [pdfProxy, setPdfProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [rotations, setRotations] = useState<number[]>([])
  const [rotateAll, setRotateAll] = useState<RotateDirection>(90)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map())
  const fileRef = useRef<HTMLInputElement>(null)

  const renderThumbs = useCallback(async (proxy: pdfjsLib.PDFDocumentProxy) => {
    const count = proxy.numPages
    for (let i = 1; i <= count; i++) {
      const canvas = canvasRefs.current.get(i)
      if (canvas) {
        await renderPageThumb(proxy, i, canvas)
      }
    }
  }, [])

  useEffect(() => {
    if (pdfProxy && pageCount > 0) {
      // Small delay to let canvases mount
      const timer = setTimeout(() => renderThumbs(pdfProxy), 50)
      return () => clearTimeout(timer)
    }
  }, [pdfProxy, pageCount, renderThumbs])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setError('')
    try {
      const bytes = await f.arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const count = doc.getPageCount()

      // Read existing rotations from pdf-lib
      const existingRotations = doc.getPages().map(p => p.getRotation().angle)

      const proxy = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise

      setFile(f)
      setPdfBytes(bytes)
      setPageCount(count)
      setRotations(existingRotations)
      setPdfProxy(proxy)
    } catch {
      setError('Could not read file as a valid PDF')
    }
    e.target.value = ''
  }

  function rotatePage(index: number, dir: RotateDirection) {
    setRotations(prev => {
      const next = [...prev]
      next[index] = (next[index] + dir + 360) % 360
      return next
    })
  }

  function rotateAllPages() {
    setRotations(prev => prev.map(r => (r + rotateAll + 360) % 360))
  }

  async function save() {
    if (!pdfBytes) return
    setSaving(true)
    setError('')
    try {
      const doc = await PDFDocument.load(pdfBytes)
      const pages = doc.getPages()
      for (let i = 0; i < pages.length; i++) {
        pages[i].setRotation(degrees(rotations[i]))
      }
      const outBytes = await doc.save()
      const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `rotated-${file?.name ?? 'output.pdf'}`; a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function clear() {
    if (pdfProxy) pdfProxy.destroy()
    setFile(null)
    setPdfBytes(null)
    setPdfProxy(null)
    setPageCount(0)
    setRotations([])
    setError('')
    canvasRefs.current.clear()
  }

  function setCanvasRef(pageNum: number, el: HTMLCanvasElement | null) {
    if (el) {
      canvasRefs.current.set(pageNum, el)
    } else {
      canvasRefs.current.delete(pageNum)
    }
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
            <div className="tool-section-label">Rotate All Pages</div>
            <div className="tool-actions">
              <select
                className="tool-select"
                value={rotateAll}
                onChange={e => setRotateAll(Number(e.target.value) as RotateDirection)}
              >
                <option value={90}>90° Clockwise</option>
                <option value={-90}>90° Counter-clockwise</option>
                <option value={180}>180°</option>
              </select>
              <button className="btn btn-ghost" onClick={rotateAllPages}>
                Rotate All
              </button>
            </div>
          </div>

          <div className="tool-section">
            <div className="tool-section-label">Pages ({pageCount})</div>
            <div className="pdf-page-grid">
              {Array.from({ length: pageCount }, (_, i) => (
                <div key={i} className="pdf-page-thumb">
                  <canvas
                    ref={el => setCanvasRef(i + 1, el)}
                    style={{ transform: `rotate(${rotations[i]}deg)` }}
                  />
                  <button
                    className="pdf-page-rotate-btn"
                    onClick={() => rotatePage(i, 90)}
                    title={`Rotate page ${i + 1}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6" />
                      <path d="M22 12A10 10 0 0 0 3.2 7.2" />
                    </svg>
                  </button>
                  <div className="pdf-page-thumb-label">
                    {i + 1} ({rotations[i]}°)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="tool-stat" style={{ color: '#f85149', marginTop: '0.5rem' }}>{error}</p>
          )}

          <div className="tool-actions">
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving\u2026' : 'Save Rotated PDF'}
            </button>
            <button className="btn btn-ghost" onClick={clear}>Clear</button>
          </div>
        </>
      )}
    </div>
  )
}
