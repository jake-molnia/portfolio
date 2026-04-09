import { useState, useCallback, useEffect } from 'react'
import FileDropZone from './FileDropZone'
import { useImageProcessor, formatBytes } from './useImageProcessor'

const FORMATS = [
  { label: 'PNG', value: 'image/png', ext: 'png', lossy: false },
  { label: 'JPEG', value: 'image/jpeg', ext: 'jpg', lossy: true },
  { label: 'WebP', value: 'image/webp', ext: 'webp', lossy: true },
  { label: 'AVIF', value: 'image/avif', ext: 'avif', lossy: true },
] as const

type Format = (typeof FORMATS)[number]

function detectAvifSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    canvas.toBlob(
      (blob) => {
        // If the browser doesn't support AVIF, it typically returns null
        // or falls back to PNG (which would be larger / different type)
        resolve(blob !== null && blob.type === 'image/avif')
      },
      'image/avif',
      0.5,
    )
  })
}

export default function ImageConvert() {
  const {
    file,
    img,
    naturalWidth,
    naturalHeight,
    outputUrl,
    outputSize,
    processing,
    loadFile,
    processImage,
    clear,
  } = useImageProcessor()

  const [format, setFormat] = useState<Format>(FORMATS[0])
  const [quality, setQuality] = useState(0.85)
  const [avifSupported, setAvifSupported] = useState(true)

  useEffect(() => {
    detectAvifSupport().then(setAvifSupported)
  }, [])

  const handleFiles = useCallback(
    (files: File[]) => {
      if (files.length > 0) loadFile(files[0])
    },
    [loadFile],
  )

  const handleConvert = useCallback(() => {
    processImage({
      width: naturalWidth,
      height: naturalHeight,
      format: format.value,
      quality: format.lossy ? quality : undefined,
    })
  }, [processImage, naturalWidth, naturalHeight, format, quality])

  const availableFormats = avifSupported
    ? FORMATS
    : FORMATS.filter((f) => f.value !== 'image/avif')

  return (
    <div>
      {!img ? (
        <FileDropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Drop an image to convert"
        />
      ) : (
        <>
          <div className="tool-section">
            <div className="tool-section-label">Original</div>
            <p className="tool-stat">
              {file?.name} &mdash; {naturalWidth} x {naturalHeight} &mdash;{' '}
              {file ? formatBytes(file.size) : ''}
            </p>
          </div>

          <div className="tool-section">
            <div className="tool-section-label">Output Format</div>
            <select
              className="tool-select"
              value={format.value}
              onChange={(e) =>
                setFormat(
                  availableFormats.find((f) => f.value === e.target.value)!,
                )
              }
            >
              {availableFormats.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {format.lossy && (
            <div className="tool-section">
              <div className="tool-section-label">Quality</div>
              <div className="tool-range-group">
                <input
                  type="range"
                  className="tool-range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                />
                <span className="tool-range-value">
                  {Math.round(quality * 100)}%
                </span>
              </div>
            </div>
          )}

          <div className="tool-actions">
            <button
              className="btn btn-primary"
              onClick={handleConvert}
              disabled={processing}
            >
              {processing ? 'Converting\u2026' : 'Convert'}
            </button>
            <button className="btn btn-ghost" onClick={clear}>
              Clear
            </button>
          </div>

          {outputUrl && (
            <div className="tool-section">
              <div className="tool-section-label">Result</div>
              <div className="tool-preview-area">
                <img
                  src={outputUrl}
                  alt="Converted preview"
                  style={{ maxWidth: '100%', maxHeight: 320 }}
                />
              </div>
              <p className="tool-stat">
                {format.label} &mdash; {formatBytes(outputSize)}
                {file && <> (original {formatBytes(file.size)})</>}
              </p>
              <div className="tool-actions">
                <a
                  href={outputUrl}
                  download={`converted.${format.ext}`}
                  className="btn btn-primary"
                >
                  Download {format.label} ({formatBytes(outputSize)})
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
