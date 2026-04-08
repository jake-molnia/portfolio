import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ThemePreference = 'system' | 'light' | 'dark'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (t: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function resolve(pref: ThemePreference): ResolvedTheme {
  return pref === 'system' ? getSystemTheme() : pref
}

function apply(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0a0a0a' : '#fafafa')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
    } catch { /* noop */ }
    return 'system'
  })

  const [resolvedTheme, setResolved] = useState<ResolvedTheme>(() =>
    document.documentElement.classList.contains('light') ? 'light' : 'dark',
  )

  function setTheme(next: ThemePreference) {
    setThemeState(next)
    try { localStorage.setItem('theme', next) } catch { /* noop */ }
    const r = resolve(next)
    setResolved(r)
    apply(r)
  }

  // Listen for OS-level preference changes when in system mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (theme !== 'system') return
      const r = getSystemTheme()
      setResolved(r)
      apply(r)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  return (
    <ThemeContext value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
