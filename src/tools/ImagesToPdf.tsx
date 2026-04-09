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

interface ImageItem {
  file: File
  previewUrl: string
}

async function imageToEmbeddable(file: File): Promise<{ bytes: Uint8Array; mime: 'png' | 'jpg' }> {
  const type = file.type

  if (type === 'image/png') {
    const buf = await file.arrayBuffer()
    return { bytes: new Uint8Array(buf), mime: 'png' }
  }

  if (type === 'image/jpeg' || type === 'image/jpg') {
    const buf = await file.arrayBuffer()
    return { bytes: new Uint8Array(buf), mime: 'jpg' }
  }

  // For other formats (webp, avif, bmp, gif, etc.): draw to canvas, export as PNG
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        blob => {
          if (!blob) return reject(new Error(`Failed to convert ${file.name}`))
          blob.arrayBuffer().then(buf => {
            resolve({ bytes: new Uint8Array(buf), mime: 'png' })
          })
        },
        'image/png',
      )
    }
    img.onerror = () => reject(new Error(`Failed to load ${file.name}`))
    img.src = URL.createObjectURL(file)
  })
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error(`Failed to load ${file.name}`))
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function ImagesToPdf() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [resultSize, setResultSize] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files
    if (!selected || selected.length === 0) return
    setError('')
    setResultBlob(null)

    const newItems: ImageItem[] = Array.from(selected).map(f => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
    }))
    setImages(prev => [...prev, ...newItems])
    e.target.value = ''
  }

  function removeImage(index: number) {
    setImages(prev => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].previewUrl)
      next.splice(index, 1)
      return next
    })
    setResultBlob(null)
  }

  async function createPdf() {
    if (images.length === 0) return
    setError('')
    setCreating(true)
    try {
      const pdfDoc = await PDFDocument.create()

      for (const item of images) {
        const { bytes, mime } = await imageToEmbeddable(item.file)
        const embedded = mime === 'png'
          ? await pdfDoc.embedPng(bytes)
          : await pdfDoc.embedJpg(bytes)

        const { width, height } = await getImageDimensions(item.file)
        const page = pdfDoc.addPage([width, height])
        page.drawImage(embedded, {
          x: 0,
          y: 0,
          width,
          height,
        })
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
      setResultBlob(blob)
      setResultSize(blob.size)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  function clear() {
    for (const img of images) {
      URL.revokeObjectURL(img.previewUrl)
    }
    setImages([])
    setResultBlob(null)
    setResultSize(0)
    setError('')
  }

  return (
    <div>
      <div className="file-drop-zone" onClick={() => fileRef.current?.click()}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFiles}
        />
        <svg className="file-drop-zone-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="file-drop-zone-text"><strong>Drop images here or click to browse</strong></p>
        <p className="file-drop-zone-hint">Accepts: PNG, JPEG, WebP, and other image formats</p>
      </div>

      {images.length > 0 && (
        <>
          <div className="file-list">
            {images.map((item, i) => (
              <div key={i} className="file-list-item">
                <span className="file-list-item-name">{item.file.name}</span>
                <span className="file-list-item-size">{fmtSize(item.file.size)}</span>
                <button
                  className="file-list-item-remove"
                  onClick={() => removeImage(i)}
                  aria-label={`Remove ${item.file.name}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            ))}
          </div>

          <div className="tool-section">
            <div className="tool-section-label">Preview</div>
            <div className="pdf-page-grid">
              {images.map((item, i) => (
                <div key={i} className="pdf-page-thumb" style={{ aspectRatio: 'auto' }}>
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }}
                  />
                  <div className="pdf-page-thumb-label">{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {error && (
        <p className="tool-stat" style={{ color: '#f85149', marginTop: '0.5rem' }}>{error}</p>
      )}

      <div className="tool-actions">
        <button
          className="btn btn-primary"
          onClick={createPdf}
          disabled={creating || images.length === 0}
        >
          {creating ? 'Creating\u2026' : 'Create PDF'}
        </button>
        {images.length > 0 && (
          <button className="btn btn-ghost" onClick={clear}>Clear</button>
        )}
      </div>

      {resultBlob && (
        <div className="tool-section">
          <div className="tool-section-label">Result</div>
          <p className="tool-stat">
            {images.length} image{images.length !== 1 ? 's' : ''} &middot; {fmtSize(resultSize)}
          </p>
          <div className="tool-actions">
            <button
              className="btn btn-primary"
              onClick={() => downloadBlob(resultBlob, 'images.pdf')}
            >
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
