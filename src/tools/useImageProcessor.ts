import { useState, useCallback, useEffect } from 'react'

interface ImageState {
  file: File | null
  img: HTMLImageElement | null
  width: number
  height: number
  naturalWidth: number
  naturalHeight: number
}

const initialState: ImageState = {
  file: null,
  img: null,
  width: 0,
  height: 0,
  naturalWidth: 0,
  naturalHeight: 0,
}

export function useImageProcessor() {
  const [state, setState] = useState<ImageState>(initialState)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [outputSize, setOutputSize] = useState<number>(0)
  const [processing, setProcessing] = useState(false)

  const loadFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setState({
        file,
        img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      })
      URL.revokeObjectURL(url)
    }
    img.src = url
  }, [])

  const processImage = useCallback(
    async (opts: {
      width?: number
      height?: number
      format?: string
      quality?: number
    }): Promise<Blob | undefined> => {
      if (!state.img) return undefined
      setProcessing(true)

      const w = opts.width || state.naturalWidth
      const h = opts.height || state.naturalHeight
      const format = opts.format || 'image/png'
      const quality = opts.quality

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(state.img, 0, 0, w, h)

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b)
            else reject(new Error('Failed to create blob'))
          },
          format,
          quality,
        )
      })

      setOutputUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(blob)
      })
      setOutputSize(blob.size)
      setProcessing(false)
      return blob
    },
    [state.img, state.naturalWidth, state.naturalHeight],
  )

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl)
    }
    // Only revoke on unmount — not every time outputUrl changes,
    // because we already revoke the old URL inside processImage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clear = useCallback(() => {
    setOutputUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setState(initialState)
    setOutputSize(0)
  }, [])

  const setWidth = useCallback(
    (w: number) => setState((s) => ({ ...s, width: w })),
    [],
  )

  const setHeight = useCallback(
    (h: number) => setState((s) => ({ ...s, height: h })),
    [],
  )

  return {
    ...state,
    outputUrl,
    outputSize,
    processing,
    loadFile,
    processImage,
    clear,
    setWidth,
    setHeight,
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0)} ${sizes[i]}`
}
