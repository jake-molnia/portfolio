import { useState, useMemo } from 'react'

interface DiffLine {
  type: '+' | '-' | ' '
  text: string
  lineNum: number | null
}

function computeDiff(original: string, modified: string): DiffLine[] {
  const a = original.split('\n')
  const b = modified.split('\n')
  const m = a.length
  const n = b.length

  // LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to build diff
  const result: DiffLine[] = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.push({ type: ' ', text: a[i - 1], lineNum: i })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: '+', text: b[j - 1], lineNum: j })
      j--
    } else {
      result.push({ type: '-', text: a[i - 1], lineNum: i })
      i--
    }
  }

  return result.reverse()
}

export default function DiffTool() {
  const [original, setOriginal] = useState('')
  const [modified, setModified] = useState('')

  const diff = useMemo(() => {
    if (!original && !modified) return []
    return computeDiff(original, modified)
  }, [original, modified])

  return (
    <div>
      <div className="tool-row">
        <div className="tool-section">
          <label className="tool-section-label">Original</label>
          <textarea
            className="tool-textarea"
            rows={12}
            placeholder="Paste original text..."
            value={original}
            onChange={e => setOriginal(e.target.value)}
          />
        </div>
        <div className="tool-section">
          <label className="tool-section-label">Modified</label>
          <textarea
            className="tool-textarea"
            rows={12}
            placeholder="Paste modified text..."
            value={modified}
            onChange={e => setModified(e.target.value)}
          />
        </div>
      </div>

      {diff.length > 0 && (
        <div className="tool-section">
          <label className="tool-section-label">Diff Output</label>
          <div className="tool-preview-area" style={{ padding: 0, overflow: 'auto' }}>
            {diff.map((line, i) => {
              let cls = 'diff-line'
              if (line.type === '+') cls += ' diff-added'
              if (line.type === '-') cls += ' diff-removed'
              return (
                <div key={i} className={cls}>
                  <span className="diff-line-number">
                    {line.lineNum ?? ' '}
                  </span>
                  {line.type !== ' ' ? line.type : ' '} {line.text}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
