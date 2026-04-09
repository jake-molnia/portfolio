import { useState, useEffect } from 'react'

interface DecodedJwt {
  header: string
  payload: string
  signature: string
  expiry?: { expired: boolean; date: string }
  issuedAt?: string
}

function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
}

function bytesToHex(str: string): string {
  return str
    .split('')
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
}

export default function JwtDecoder() {
  const [input, setInput] = useState('')
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!input.trim()) {
      setDecoded(null)
      setError('')
      return
    }

    try {
      const parts = input.trim().split('.')
      if (parts.length !== 3) throw new Error('JWT must have 3 parts separated by dots')

      const header = JSON.stringify(JSON.parse(decodeBase64Url(parts[0])), null, 2)
      const payloadObj = JSON.parse(decodeBase64Url(parts[1]))
      const payload = JSON.stringify(payloadObj, null, 2)

      let sigRaw: string
      try {
        sigRaw = atob(parts[2].replace(/-/g, '+').replace(/_/g, '/'))
      } catch {
        sigRaw = parts[2]
      }
      const signature = bytesToHex(sigRaw)

      const result: DecodedJwt = { header, payload, signature }

      if (typeof payloadObj.exp === 'number') {
        const date = new Date(payloadObj.exp * 1000)
        result.expiry = {
          expired: Date.now() > payloadObj.exp * 1000,
          date: date.toISOString(),
        }
      }

      if (typeof payloadObj.iat === 'number') {
        result.issuedAt = new Date(payloadObj.iat * 1000).toISOString()
      }

      setDecoded(result)
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setDecoded(null)
    }
  }, [input])

  return (
    <div>
      <div className="tool-section">
        <label className="tool-section-label">JWT Token</label>
        <textarea
          className="tool-textarea"
          rows={4}
          placeholder="Paste a JWT token (eyJhbG...)..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        {error && (
          <p className="tool-stat" style={{ color: '#f85149', marginTop: '0.5rem' }}>{error}</p>
        )}
      </div>

      {decoded && (
        <>
          <div className="tool-section">
            <label className="tool-section-label">Header</label>
            <pre className="tool-preview-area" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>
              {decoded.header}
            </pre>
          </div>

          <div className="tool-section">
            <label className="tool-section-label">Payload</label>
            <pre className="tool-preview-area" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>
              {decoded.payload}
            </pre>
            {decoded.expiry && (
              <p className="tool-stat" style={{ marginTop: '0.5rem', color: decoded.expiry.expired ? '#f85149' : '#3fb950' }}>
                {decoded.expiry.expired ? 'Expired' : 'Valid'} — expires {decoded.expiry.date}
              </p>
            )}
            {decoded.issuedAt && (
              <p className="tool-stat" style={{ marginTop: '0.25rem' }}>
                Issued at: {decoded.issuedAt}
              </p>
            )}
          </div>

          <div className="tool-section">
            <label className="tool-section-label">Signature (hex)</label>
            <pre
              className="tool-preview-area"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}
            >
              {decoded.signature}
            </pre>
          </div>
        </>
      )}
    </div>
  )
}
