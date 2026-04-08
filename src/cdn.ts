// In dev, falls back to '/' so local public/ still works.
// In production, points to your R2 public bucket URL.
const BASE = import.meta.env.VITE_CDN_URL?.replace(/\/$/, '') ?? ''

export function cdn(path: string): string {
  return `${BASE}/${path.replace(/^\//, '')}`
}

/** Thrown when the response body is HTML (e.g. SPA fallback) or JSON is invalid. */
export class CdnContentError extends Error {
  readonly code: 'html_response' | 'invalid_json'

  constructor(code: 'html_response' | 'invalid_json') {
    super(code)
    this.name = 'CdnContentError'
    this.code = code
  }
}

function looksLikeHtml(text: string): boolean {
  const t = text.trimStart()
  return t.startsWith('<!') || t.startsWith('<html') || /^<!doctype/i.test(t)
}

/** Fetch a CDN path — throws on non-OK responses. */
export async function fetchCdn(path: string, init?: RequestInit): Promise<Response> {
  const url = cdn(path)
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res
}

export async function fetchCdnJson<T>(path: string): Promise<T> {
  const res = await fetchCdn(path)
  const text = await res.text()
  if (looksLikeHtml(text)) {
    throw new CdnContentError('html_response')
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new CdnContentError('invalid_json')
  }
}

export async function fetchCdnText(path: string): Promise<string> {
  const res = await fetchCdn(path)
  const text = await res.text()
  if (looksLikeHtml(text)) {
    throw new CdnContentError('html_response')
  }
  return text
}

export function userFacingCdnMessage(err: unknown): string {
  if (err instanceof CdnContentError) {
    if (err.code === 'invalid_json') {
      return 'The file exists but is not valid JSON. Check the asset in your bucket or under public/.'
    }
    return 'The server returned a web page instead of data. For local development, add files under public/ or set VITE_CDN_URL to your hosted assets.'
  }
  if (err instanceof Error && /^\d{3}\s/.test(err.message)) {
    return 'This file is missing or could not be reached. If you are offline or deploying, confirm the asset is uploaded.'
  }
  return 'Something went wrong while loading this content. Please try again later.'
}
