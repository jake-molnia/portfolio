import { useState, useCallback } from 'react'
import FileDropZone from './FileDropZone'
import { formatBytes } from './useImageProcessor'

const SCALES = [1, 2, 3, 4] as const

export default function SvgToPng() {
  const [svgText, setSvgText] = useState<string | null>(null)
  const [svgFile, setSvgFile] = useState<File | null>(null)
  const [svgWidth, setSvgWidth] = useState(0)
  const [svgHeight, setSvgHeight] = useState(0)
  const [scale, setScale] = useState<number>(2)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [outputSize, setOutputSize] = useState(0)
  const [processing, setProcessing] = useState(false)

  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return
    const file = files[0]
    setSvgFile(file)

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      setSvgText(text)

      // Parse SVG to get intrinsic dimensions
      const img = new Image()
      const blob = new Blob([text], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      img.onload = () => {
        // naturalWidth/Height gives us the intrinsic SVG dimensions
        // If the SVG has no explicit width/height, the browser may default to 300x150
        setSvgWidth(img.naturalWidth)
        setSvgHeight(img.naturalHeight)
        URL.revokeObjectURL(url)
      }
      img.src = url
    }
    reader.readAsText(file)
  }, [])

  const handleExport = useCallback(() => {
    if (!svgText) return
    setProcessing(true)

    const outW = svgWidth * scale
    const outH = svgHeight * scale

    const img = new Image()
    const blob = new Blob([svgText], {
      type: 'image/svg+xml;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, outW, outH)
      URL.revokeObjectURL(url)

      canvas.toBlob((b) => {
        if (!b) {
          setProcessing(false)
          return
        }
        setOutputUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return URL.createObjectURL(b)
        })
        setOutputSize(b.size)
        setProcessing(false)
      }, 'image/png')
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      setProcessing(false)
    }

    img.src = url
  }, [svgText, svgWidth, svgHeight, scale])

  const handleClear = useCallback(() => {
    setOutputUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setSvgText(null)
    setSvgFile(null)
    setSvgWidth(0)
    setSvgHeight(0)
    setOutputSize(0)
  }, [])

  const outW = svgWidth * scale
  const outH = svgHeight * scale

  return (
    <div>
      {!svgText ? (
        <FileDropZone
          accept="image/svg+xml"
          onFiles={handleFiles}
          label="Drop an SVG file"
        />
      ) : (
        <>
          <div className="tool-section">
            <div className="tool-section-label">SVG Info</div>
            <p className="tool-stat">
              {svgFile?.name} &mdash; {svgWidth} x {svgHeight}
              {svgFile && <> &mdash; {formatBytes(svgFile.size)}</>}
            </p>
          </div>

          <div className="tool-section">
            <div className="tool-section-label">Scale</div>
            <select
              className="tool-select"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
            >
              {SCALES.map((s) => (
                <option key={s} value={s}>
                  {s}x ({svgWidth * s} x {svgHeight * s})
                </option>
              ))}
            </select>
          </div>

          <div className="tool-actions">
            <button
              className="btn btn-primary"
              onClick={handleExport}
              disabled={processing}
            >
              {processing ? 'Exporting\u2026' : 'Export PNG'}
            </button>
            <button className="btn btn-ghost" onClick={handleClear}>
              Clear
            </button>
          </div>

          {outputUrl && (
            <div className="tool-section">
              <div className="tool-section-label">Result</div>
              <div className="tool-preview-area">
                <img
                  src={outputUrl}
                  alt="PNG preview"
                  style={{ maxWidth: '100%', maxHeight: 320 }}
                />
              </div>
              <p className="tool-stat">
                {outW} x {outH} &mdash; {formatBytes(outputSize)}
              </p>
              <div className="tool-actions">
                <a
                  href={outputUrl}
                  download={`${svgFile?.name?.replace(/\.svg$/i, '') ?? 'output'}-${scale}x.png`}
                  className="btn btn-primary"
                >
                  Download PNG ({formatBytes(outputSize)})
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
