import { useState, useRef, useCallback } from 'react'
import QRCode from 'qrcode'

type ECLevel = 'L' | 'M' | 'Q' | 'H'

export default function QrGenerator() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(256)
  const [ecLevel, setEcLevel] = useState<ECLevel>('M')
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !text.trim()) return
    setError('')
    QRCode.toCanvas(canvas, text, {
      width: size,
      margin: 2,
      errorCorrectionLevel: ecLevel,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(() => setGenerated(true))
      .catch((e: Error) => {
        setError(e.message)
        setGenerated(false)
      })
  }, [text, size, ecLevel])

  const downloadPng = () => {
    const canvas = canvasRef.current
    if (!canvas || !generated) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'qrcode.png'
      a.click()
      URL.revokeObjectURL(a.href)
    }, 'image/png')
  }

  const clear = () => {
    setText('')
    setError('')
    setGenerated(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  return (
    <div>
      <div className="tool-section">
        <label className="tool-section-label">Content</label>
        <textarea
          className="tool-textarea"
          rows={4}
          placeholder="Enter a URL, text, or any data..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <div>
          <label className="tool-section-label">Size (px)</label>
          <select
            className="tool-select"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            <option value={256}>256</option>
            <option value={512}>512</option>
            <option value={1024}>1024</option>
          </select>
        </div>
        <div>
          <label className="tool-section-label">Error Correction</label>
          <select
            className="tool-select"
            value={ecLevel}
            onChange={(e) => setEcLevel(e.target.value as ECLevel)}
          >
            <option value="L">L (Low ~7%)</option>
            <option value="M">M (Medium ~15%)</option>
            <option value="Q">Q (Quartile ~25%)</option>
            <option value="H">H (High ~30%)</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="tool-stat" style={{ color: '#f85149', marginTop: '0.5rem' }}>{error}</p>
      )}

      <div className="tool-actions">
        <button className="btn btn-primary" onClick={generate} disabled={!text.trim()}>
          Generate
        </button>
        <button className="btn btn-ghost" onClick={downloadPng} disabled={!generated}>
          Download PNG
        </button>
        <button className="btn btn-ghost" onClick={clear}>Clear</button>
      </div>

      <div className="tool-preview-area" style={{ textAlign: 'center' }}>
        <canvas
          ref={canvasRef}
          style={{
            display: generated ? 'inline-block' : 'none',
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '4px',
          }}
        />
        {!generated && (
          <p className="tool-stat">QR code preview will appear here</p>
        )}
      </div>
    </div>
  )
}
