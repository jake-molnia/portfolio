import { useState, useEffect } from 'react'

/* ── Inline MD5 implementation (RFC 1321) ── */
function md5(input: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }
  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt))
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t)
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t)
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t)
  }

  function binlMD5(x: number[], len: number): number[] {
    x[len >> 5] |= 0x80 << (len % 32)
    x[(((len + 64) >>> 9) << 4) + 14] = len
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878
    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d
      a = md5ff(a, b, c, d, x[i] || 0, 7, -680876936)
      d = md5ff(d, a, b, c, x[i + 1] || 0, 12, -389564586)
      c = md5ff(c, d, a, b, x[i + 2] || 0, 17, 606105819)
      b = md5ff(b, c, d, a, x[i + 3] || 0, 22, -1044525330)
      a = md5ff(a, b, c, d, x[i + 4] || 0, 7, -176418897)
      d = md5ff(d, a, b, c, x[i + 5] || 0, 12, 1200080426)
      c = md5ff(c, d, a, b, x[i + 6] || 0, 17, -1473231341)
      b = md5ff(b, c, d, a, x[i + 7] || 0, 22, -45705983)
      a = md5ff(a, b, c, d, x[i + 8] || 0, 7, 1770035416)
      d = md5ff(d, a, b, c, x[i + 9] || 0, 12, -1958414417)
      c = md5ff(c, d, a, b, x[i + 10] || 0, 17, -42063)
      b = md5ff(b, c, d, a, x[i + 11] || 0, 22, -1990404162)
      a = md5ff(a, b, c, d, x[i + 12] || 0, 7, 1804603682)
      d = md5ff(d, a, b, c, x[i + 13] || 0, 12, -40341101)
      c = md5ff(c, d, a, b, x[i + 14] || 0, 17, -1502002290)
      b = md5ff(b, c, d, a, x[i + 15] || 0, 22, 1236535329)

      a = md5gg(a, b, c, d, x[i + 1] || 0, 5, -165796510)
      d = md5gg(d, a, b, c, x[i + 6] || 0, 9, -1069501632)
      c = md5gg(c, d, a, b, x[i + 11] || 0, 14, 643717713)
      b = md5gg(b, c, d, a, x[i] || 0, 20, -373897302)
      a = md5gg(a, b, c, d, x[i + 5] || 0, 5, -701558691)
      d = md5gg(d, a, b, c, x[i + 10] || 0, 9, 38016083)
      c = md5gg(c, d, a, b, x[i + 15] || 0, 14, -660478335)
      b = md5gg(b, c, d, a, x[i + 4] || 0, 20, -405537848)
      a = md5gg(a, b, c, d, x[i + 9] || 0, 5, 568446438)
      d = md5gg(d, a, b, c, x[i + 14] || 0, 9, -1019803690)
      c = md5gg(c, d, a, b, x[i + 3] || 0, 14, -187363961)
      b = md5gg(b, c, d, a, x[i + 8] || 0, 20, 1163531501)
      a = md5gg(a, b, c, d, x[i + 13] || 0, 5, -1444681467)
      d = md5gg(d, a, b, c, x[i + 2] || 0, 9, -51403784)
      c = md5gg(c, d, a, b, x[i + 7] || 0, 14, 1735328473)
      b = md5gg(b, c, d, a, x[i + 12] || 0, 20, -1926607734)

      a = md5hh(a, b, c, d, x[i + 5] || 0, 4, -378558)
      d = md5hh(d, a, b, c, x[i + 8] || 0, 11, -2022574463)
      c = md5hh(c, d, a, b, x[i + 11] || 0, 16, 1839030562)
      b = md5hh(b, c, d, a, x[i + 14] || 0, 23, -35309556)
      a = md5hh(a, b, c, d, x[i + 1] || 0, 4, -1530992060)
      d = md5hh(d, a, b, c, x[i + 4] || 0, 11, 1272893353)
      c = md5hh(c, d, a, b, x[i + 7] || 0, 16, -155497632)
      b = md5hh(b, c, d, a, x[i + 10] || 0, 23, -1094730640)
      a = md5hh(a, b, c, d, x[i + 13] || 0, 4, 681279174)
      d = md5hh(d, a, b, c, x[i + 0] || 0, 11, -358537222)
      c = md5hh(c, d, a, b, x[i + 3] || 0, 16, -722521979)
      b = md5hh(b, c, d, a, x[i + 6] || 0, 23, 76029189)
      a = md5hh(a, b, c, d, x[i + 9] || 0, 4, -640364487)
      d = md5hh(d, a, b, c, x[i + 12] || 0, 11, -421815835)
      c = md5hh(c, d, a, b, x[i + 15] || 0, 16, 530742520)
      b = md5hh(b, c, d, a, x[i + 2] || 0, 23, -995338651)

      a = md5ii(a, b, c, d, x[i] || 0, 6, -198630844)
      d = md5ii(d, a, b, c, x[i + 7] || 0, 10, 1126891415)
      c = md5ii(c, d, a, b, x[i + 14] || 0, 15, -1416354905)
      b = md5ii(b, c, d, a, x[i + 5] || 0, 21, -57434055)
      a = md5ii(a, b, c, d, x[i + 12] || 0, 6, 1700485571)
      d = md5ii(d, a, b, c, x[i + 3] || 0, 10, -1894986606)
      c = md5ii(c, d, a, b, x[i + 10] || 0, 15, -1051523)
      b = md5ii(b, c, d, a, x[i + 1] || 0, 21, -2054922799)
      a = md5ii(a, b, c, d, x[i + 8] || 0, 6, 1873313359)
      d = md5ii(d, a, b, c, x[i + 15] || 0, 10, -30611744)
      c = md5ii(c, d, a, b, x[i + 6] || 0, 15, -1560198380)
      b = md5ii(b, c, d, a, x[i + 13] || 0, 21, 1309151649)
      a = md5ii(a, b, c, d, x[i + 4] || 0, 6, -145523070)
      d = md5ii(d, a, b, c, x[i + 11] || 0, 10, -1120210379)
      c = md5ii(c, d, a, b, x[i + 2] || 0, 15, 718787259)
      b = md5ii(b, c, d, a, x[i + 9] || 0, 21, -343485551)

      a = safeAdd(a, olda)
      b = safeAdd(b, oldb)
      c = safeAdd(c, oldc)
      d = safeAdd(d, oldd)
    }
    return [a, b, c, d]
  }

  function str2binl(str: string): number[] {
    const bin: number[] = []
    const mask = (1 << 8) - 1
    for (let i = 0; i < str.length * 8; i += 8) {
      bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32)
    }
    return bin
  }

  function binl2hex(binarray: number[]): string {
    const hexTab = '0123456789abcdef'
    let str = ''
    for (let i = 0; i < binarray.length * 32; i += 8) {
      str += hexTab.charAt((binarray[i >> 5] >>> (i % 32)) & 0xf) +
             hexTab.charAt((binarray[i >> 5] >>> (i % 32 + 4)) & 0xf)
    }
    return str
  }

  const utf8 = unescape(encodeURIComponent(input))
  return binl2hex(binlMD5(str2binl(utf8), utf8.length * 8))
}

async function sha(algo: string, text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest(algo, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function HashGenerator() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<{ md5: string; sha1: string; sha256: string }>({
    md5: '',
    sha1: '',
    sha256: '',
  })
  const [copiedField, setCopiedField] = useState('')

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 1500)
  }

  useEffect(() => {
    if (!input) {
      setHashes({ md5: '', sha1: '', sha256: '' })
      return
    }

    const md5Hash = md5(input)

    let cancelled = false
    Promise.all([
      sha('SHA-1', input),
      sha('SHA-256', input),
    ]).then(([sha1, sha256]) => {
      if (!cancelled) {
        setHashes({ md5: md5Hash, sha1, sha256 })
      }
    })

    return () => { cancelled = true }
  }, [input])

  const rows = [
    { label: 'MD5', value: hashes.md5, key: 'md5' },
    { label: 'SHA-1', value: hashes.sha1, key: 'sha1' },
    { label: 'SHA-256', value: hashes.sha256, key: 'sha256' },
  ]

  return (
    <div>
      <div className="tool-section">
        <label className="tool-section-label">Input Text</label>
        <textarea
          className="tool-textarea"
          rows={6}
          placeholder="Enter text to hash..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>

      <div className="tool-section">
        <label className="tool-section-label">Hashes</label>
        {rows.map(row => (
          <div key={row.key} style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="tool-stat" style={{ minWidth: '4.5rem', fontWeight: 600 }}>
                {row.label}
              </span>
              <code
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: 'var(--muted2)',
                  wordBreak: 'break-all',
                }}
              >
                {row.value || '\u2014'}
              </code>
              <button
                className="btn btn-ghost"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                onClick={() => copy(row.value, row.key)}
                disabled={!row.value}
              >
                {copiedField === row.key ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
