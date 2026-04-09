import { useState, useCallback } from 'react'
import FileDropZone from './FileDropZone'
import { useImageProcessor, formatBytes } from './useImageProcessor'

export default function ImageResize() {
  const {
    file,
    img,
    width,
    height,
    naturalWidth,
    naturalHeight,
    outputUrl,
    outputSize,
    processing,
    loadFile,
    processImage,
    clear,
    setWidth,
    setHeight,
  } = useImageProcessor()

  const [lockAspect, setLockAspect] = useState(true)

  const handleFiles = useCallback(
    (files: File[]) => {
      if (files.length > 0) loadFile(files[0])
    },
    [loadFile],
  )

  const handleWidthChange = useCallback(
    (w: number) => {
      if (w < 1) return
      setWidth(w)
      if (lockAspect && naturalWidth > 0) {
        setHeight(Math.round((w / naturalWidth) * naturalHeight))
      }
    },
    [lockAspect, naturalWidth, naturalHeight, setWidth, setHeight],
  )

  const handleHeightChange = useCallback(
    (h: number) => {
      if (h < 1) return
      setHeight(h)
      if (lockAspect && naturalHeight > 0) {
        setWidth(Math.round((h / naturalHeight) * naturalWidth))
      }
    },
    [lockAspect, naturalWidth, naturalHeight, setWidth, setHeight],
  )

  const handleResize = useCallback(() => {
    processImage({ width, height, format: 'image/png' })
  }, [processImage, width, height])

  return (
    <div>
      {!img ? (
        <FileDropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Drop an image to resize"
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
            <div className="tool-section-label">New Dimensions</div>
            <div className="tool-range-group">
              <label>
                Width
                <input
                  type="number"
                  className="tool-number-input"
                  value={width}
                  min={1}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                />
              </label>
              <label>
                Height
                <input
                  type="number"
                  className="tool-number-input"
                  value={height}
                  min={1}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                />
              </label>
            </div>
            <label className="tool-checkbox-label">
              <input
                type="checkbox"
                checked={lockAspect}
                onChange={(e) => setLockAspect(e.target.checked)}
              />
              Lock aspect ratio
            </label>
          </div>

          <div className="tool-actions">
            <button
              className="btn btn-primary"
              onClick={handleResize}
              disabled={processing || width < 1 || height < 1}
            >
              {processing ? 'Resizing\u2026' : 'Resize'}
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
                  alt="Resized preview"
                  style={{ maxWidth: '100%', maxHeight: 320 }}
                />
              </div>
              <p className="tool-stat">
                {width} x {height} &mdash; {formatBytes(outputSize)}
                {file && (
                  <>
                    {' '}
                    (original {formatBytes(file.size)})
                  </>
                )}
              </p>
              <div className="tool-actions">
                <a
                  href={outputUrl}
                  download={`resized-${width}x${height}.png`}
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
