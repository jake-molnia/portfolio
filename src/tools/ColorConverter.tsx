import { useState, useEffect } from 'react'

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function rgbToHex(rgb: RGB): string {
  const r = clamp(Math.round(rgb.r), 0, 255)
  const g = clamp(Math.round(rgb.g), 0, 255)
  const b = clamp(Math.round(rgb.b), 0, 255)
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100
  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  }
}

function hexToRgb(hex: string): RGB | null {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) {
    const short = hex.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i)
    if (!short) return null
    return {
      r: parseInt(short[1] + short[1], 16),
      g: parseInt(short[2] + short[2], 16),
      b: parseInt(short[3] + short[3], 16),
    }
  }
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

function parseColor(input: string): RGB | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // HEX
  if (/^#?[a-f\d]{3,6}$/i.test(trimmed)) {
    return hexToRgb(trimmed)
  }

  // rgb(r, g, b)
  const rgbMatch = trimmed.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)
  if (rgbMatch) {
    return {
      r: clamp(parseInt(rgbMatch[1]), 0, 255),
      g: clamp(parseInt(rgbMatch[2]), 0, 255),
      b: clamp(parseInt(rgbMatch[3]), 0, 255),
    }
  }

  // hsl(h, s%, l%)
  const hslMatch = trimmed.match(/^hsl\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i)
  if (hslMatch) {
    return hslToRgb({
      h: parseInt(hslMatch[1]) % 360,
      s: clamp(parseInt(hslMatch[2]), 0, 100),
      l: clamp(parseInt(hslMatch[3]), 0, 100),
    })
  }

  return null
}

export default function ColorConverter() {
  const [input, setInput] = useState('#ff5733')
  const [rgb, setRgb] = useState<RGB | null>(null)
  const [hsl, setHsl] = useState<HSL | null>(null)
  const [hex, setHex] = useState('')
  const [copiedField, setCopiedField] = useState('')

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 1500)
  }

  useEffect(() => {
    const parsed = parseColor(input)
    if (parsed) {
      setRgb(parsed)
      setHex(rgbToHex(parsed))
      setHsl(rgbToHsl(parsed))
    } else {
      setRgb(null)
      setHex('')
      setHsl(null)
    }
  }, [input])

  const hexStr = hex
  const rgbStr = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : ''
  const hslStr = hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : ''

  const fields = [
    { label: 'HEX', value: hexStr, key: 'hex' },
    { label: 'RGB', value: rgbStr, key: 'rgb' },
    { label: 'HSL', value: hslStr, key: 'hsl' },
  ]

  return (
    <div>
      <div className="tool-section">
        <label className="tool-section-label">Color Input</label>
        <input
          className="tool-input"
          placeholder="#ff5733, rgb(255,87,51), or hsl(11,100%,60%)"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>

      {rgb && (
        <div className="tool-section">
          <div
            className="color-swatch"
            style={{ backgroundColor: hexStr }}
          />
        </div>
      )}

      <div className="tool-section">
        <label className="tool-section-label">Conversions</label>
        {fields.map(f => (
          <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="tool-stat" style={{ minWidth: '3rem', fontWeight: 600 }}>{f.label}</span>
            <input
              className="tool-input"
              style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
              readOnly
              value={f.value}
            />
            <button
              className="btn btn-ghost"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
              onClick={() => copy(f.value, f.key)}
              disabled={!f.value}
            >
              {copiedField === f.key ? 'Copied!' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
