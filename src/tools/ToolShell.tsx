import { useState, useCallback, useRef } from 'react'

/* ── Utility: formatBytes ── */

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ── Hook: useFileDrop ── */

export function useFileDrop(accept?: string) {
  const [file, setFile] = useState<File | null>(null)

  const handleFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return
      // If accept is specified, verify the first file matches
      if (accept) {
        const patterns = accept.split(',').map((s) => s.trim())
        const ok = patterns.some((pattern) => {
          if (pattern.endsWith('/*')) {
            return files[0].type.startsWith(pattern.replace('/*', '/'))
          }
          return files[0].type === pattern
        })
        if (!ok) return
      }
      setFile(files[0])
    },
    [accept],
  )

  const clearFile = useCallback(() => setFile(null), [])

  return { file, setFile, clearFile, handleFiles }
}

/* ── Component: CopyButton ── */

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
}

export function CopyButton({ text, label = 'Copy', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API may fail in insecure contexts; fall back silently
    }
  }

  return (
    <button
      type="button"
      className={`btn btn-ghost${className ? ` ${className}` : ''}`}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}

/* ── Component: DownloadButton ── */

interface DownloadButtonProps {
  blob: Blob | null
  filename: string
  label?: string
  className?: string
}

export function DownloadButton({
  blob,
  filename,
  label = 'Download',
  className,
}: DownloadButtonProps) {
  function handleDownload() {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    // Cleanup
    requestAnimationFrame(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  return (
    <button
      type="button"
      className={`btn btn-primary${className ? ` ${className}` : ''}`}
      disabled={!blob}
      onClick={handleDownload}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {label}
    </button>
  )
}
