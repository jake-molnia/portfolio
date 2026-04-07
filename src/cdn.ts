// In dev, falls back to '/' so local public/ still works.
// In production, points to your R2 public bucket URL.
const BASE = import.meta.env.VITE_CDN_URL?.replace(/\/$/, '') ?? ''

export function cdn(path: string): string {
  return `${BASE}/${path.replace(/^\//, '')}`
}

/** Fetch a CDN path — throws on non-OK responses. */
export async function fetchCdn(path: string, init?: RequestInit): Promise<Response> {
  const url = cdn(path)
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`)
  return res
}
