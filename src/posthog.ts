import { useState, useEffect } from 'react'

const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined

// Minimal interface — avoids importing the full posthog-js bundle at load time
interface PH {
  init(key: string, opts: Record<string, unknown>): void
  capture(event: string, properties?: Record<string, unknown>): void
  onFeatureFlags(cb: () => void): void
  getFeatureFlag(flag: string): string | boolean | undefined
}

// ── Lazy-load PostHog so it stays out of the critical bundle ──
let instance: PH | null = null
const waiting: Array<(ph: PH) => void> = []

if (key) {
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: 'https://m.molnia.net',
      ui_host: 'https://us.posthog.com',
      defaults: '2026-01-30',
      person_profiles: 'identified_only',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: true,
      persistence: 'localStorage',
    })
    instance = posthog
    for (const cb of waiting) cb(posthog)
    waiting.length = 0
  })
}

function onReady(cb: (ph: PH) => void): void {
  if (instance) cb(instance)
  else waiting.push(cb)
}

export function capture(event: string, properties?: Record<string, unknown>): void {
  if (key) onReady(ph => ph.capture(event, properties))
}

export function captureException(error: unknown, properties?: Record<string, unknown>): void {
  if (key) onReady(ph => ph.capture('$exception', { ...properties, $exception_message: String(error) }))
}

// ── Flag cache — stale-while-revalidate in localStorage ──
const FLAG_CACHE_KEY = 'ph_flag_cache'

function readCache(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(FLAG_CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeCache(flag: string, value: boolean): void {
  try {
    const cache = readCache()
    cache[flag] = value
    localStorage.setItem(FLAG_CACHE_KEY, JSON.stringify(cache))
  } catch { /* quota exceeded — ignore */ }
}

/**
 * React hook for PostHog feature flags.
 *
 * Uses a stale-while-revalidate strategy:
 *   1st visit  — no cache, uses `defaultValue` (true) until PostHog responds
 *   2nd+ visit — reads the cached value from localStorage (instant), then
 *                revalidates from PostHog in the background
 *
 * Uses `getFeatureFlag` (not `isFeatureEnabled`) so we can distinguish
 * "flag explicitly disabled" (`false`) from "flag unknown" (`undefined`).
 */
export function useFeatureFlag(flag: string, defaultValue = true): boolean {
  const cached = readCache()[flag]
  const [enabled, setEnabled] = useState(cached ?? defaultValue)

  useEffect(() => {
    if (!key) return

    onReady(ph => {
      ph.onFeatureFlags(() => {
        const val = ph.getFeatureFlag(flag)
        const resolved = val !== undefined ? Boolean(val) : false
        setEnabled(resolved)
        writeCache(flag, resolved)
      })
    })
  }, [flag])

  return enabled
}
