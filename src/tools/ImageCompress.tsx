import { useState, useCallback } from 'react'
import FileDropZone from './FileDropZone'
import { useImageProcessor, formatBytes } from './useImageProcessor'

const FORMATS = [
  { label: 'JPEG', value: 'image/jpeg', ext: 'jpg' },
  { label: 'WebP', value: 'image/webp', ext: 'webp' },
] as const

export default function ImageCompress() {
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

  const [format, setFormat] = useState<(typeof FORMATS)[number]>(FORMATS[0])
  const [quality, setQuality] = useState(0.8)

  const handleFiles = useCallback(
    (files: File[]) => {
      if (files.length > 0) loadFile(files[0])
    },
    [loadFile],
  )

  const handleCompress = useCallback(() => {
    processImage({
      width: naturalWidth,
      height: naturalHeight,
      format: format.value,
      quality,
    })
  }, [processImage, naturalWidth, naturalHeight, format, quality])

  const reduction =
    file && outputSize > 0
      ? Math.round((1 - outputSize / file.size) * 100)
      : 0

  return (
    <div>
      {!img ? (
        <FileDropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Drop an image to compress"
        />
      ) : (
        <>
          <div className="tool-section">
            <div className="tool-section-label">Original</div>
            <p className="tool-stat">
              {naturalWidth} x {naturalHeight} &mdash;{' '}
              {file ? formatBytes(file.size) : ''}
            </p>
          </div>

          <div className="tool-section">
            <div className="tool-section-label">Format</div>
            <select
              className="tool-select"
              value={format.value}
              onChange={(e) =>
                setFormat(FORMATS.find((f) => f.value === e.target.value)!)
              }
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

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

          <div className="tool-actions">
            <button
              className="btn btn-primary"
              onClick={handleCompress}
              disabled={processing}
            >
              {processing ? 'Compressing\u2026' : 'Compress'}
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
                  alt="Compressed preview"
                  style={{ maxWidth: '100%', maxHeight: 320 }}
                />
              </div>
              <p className="tool-stat">
                {formatBytes(outputSize)} (was {file ? formatBytes(file.size) : '?'})
                {reduction > 0 && <> &mdash; {reduction}% smaller</>}
                {reduction < 0 && <> &mdash; {Math.abs(reduction)}% larger</>}
              </p>
              <div className="tool-actions">
                <a
                  href={outputUrl}
                  download={`compressed.${format.ext}`}
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
