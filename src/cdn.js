// In dev, falls back to '/' so local public/ still works.
// In production, points to your R2 public bucket URL.
const BASE = import.meta.env.VITE_CDN_URL?.replace(/\/$/, '') ?? ''

export function cdn(path) {
  return `${BASE}/${path.replace(/^\//, '')}`
}