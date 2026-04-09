import { useState, useMemo } from 'react'

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testStr, setTestStr] = useState('')

  const result = useMemo(() => {
    if (!pattern || !testStr) return null

    try {
      const re = new RegExp(pattern, flags)
      const matches: { index: number; text: string; groups: string[] }[] = []

      if (flags.includes('g')) {
        let m: RegExpExecArray | null
        while ((m = re.exec(testStr)) !== null) {
          matches.push({
            index: m.index,
            text: m[0],
            groups: m.slice(1),
          })
          if (!m[0].length) re.lastIndex++
        }
      } else {
        const m = re.exec(testStr)
        if (m) {
          matches.push({
            index: m.index,
            text: m[0],
            groups: m.slice(1),
          })
        }
      }

      // Build highlighted string
      const parts: { text: string; highlight: boolean }[] = []
      let lastIdx = 0
      for (const m of matches) {
        if (m.index > lastIdx) {
          parts.push({ text: testStr.slice(lastIdx, m.index), highlight: false })
        }
        parts.push({ text: m.text, highlight: true })
        lastIdx = m.index + m.text.length
      }
      if (lastIdx < testStr.length) {
        parts.push({ text: testStr.slice(lastIdx), highlight: false })
      }

      return { matches, parts, error: null }
    } catch (e) {
      return { matches: [], parts: [], error: (e as Error).message }
    }
  }, [pattern, flags, testStr])

  const allGroups = result?.matches.flatMap((m, i) =>
    m.groups.map((g, gi) => `Match ${i + 1}, Group ${gi + 1}: ${g}`)
  ) ?? []

  return (
    <div>
      <div className="tool-section">
        <label className="tool-section-label">Pattern</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="tool-input"
            style={{ flex: 1 }}
            placeholder="Enter regex pattern..."
            value={pattern}
            onChange={e => setPattern(e.target.value)}
          />
          <input
            className="tool-input"
            style={{ width: '5rem' }}
            placeholder="flags"
            value={flags}
            onChange={e => setFlags(e.target.value)}
          />
        </div>
        {result?.error && (
          <p className="tool-stat" style={{ color: '#f85149', marginTop: '0.5rem' }}>{result.error}</p>
        )}
      </div>

      <div className="tool-section">
        <label className="tool-section-label">Test String</label>
        <textarea
          className="tool-textarea"
          rows={6}
          placeholder="Enter text to test against..."
          value={testStr}
          onChange={e => setTestStr(e.target.value)}
        />
      </div>

      {result && !result.error && testStr && (
        <div className="tool-section">
          <label className="tool-section-label">
            Matches ({result.matches.length})
          </label>
          <div
            className="tool-preview-area"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
          >
            {result.parts.map((p, i) =>
              p.highlight ? (
                <span key={i} className="regex-match">{p.text}</span>
              ) : (
                <span key={i}>{p.text}</span>
              )
            )}
          </div>

          {allGroups.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              <label className="tool-section-label">Captured Groups</label>
              <div className="tool-preview-area" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                {allGroups.map((g, i) => (
                  <div key={i}>{g}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
