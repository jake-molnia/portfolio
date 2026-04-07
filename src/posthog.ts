import { useState, useEffect } from 'react'

const key  = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const host = import.meta.env.VITE_POSTHOG_HOST as string | undefined

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
      api_host: host || 'https://us.i.posthog.com',
      autocapture: false,
      capture_pageview: false,
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

/**
 * React hook for PostHog feature flags.
 * Returns `defaultValue` when PostHog isn't configured or the flag doesn't exist.
 *
 * Uses `getFeatureFlag` (not `isFeatureEnabled`) so we can distinguish
 * "flag explicitly disabled" (`false`) from "flag unknown" (`undefined`).
 * Unknown flags keep the default — the site never breaks because of a
 * missing or newly-created flag.
 */
export function useFeatureFlag(flag: string, defaultValue = true): boolean {
  const [enabled, setEnabled] = useState(defaultValue)

  useEffect(() => {
    // No PostHog configured -> keep default (everything visible)
    if (!key) return

    onReady(ph => {
      // Once flags load from PostHog, we have a definitive answer:
      //   flag present  -> use its value (true/false)
      //   flag absent   -> disabled in PostHog dashboard -> false
      // Before this fires, state stays at `defaultValue` (true) to avoid FOUC.
      ph.onFeatureFlags(() => {
        const val = ph.getFeatureFlag(flag)
        setEnabled(val !== undefined ? Boolean(val) : false)
      })
    })
  }, [flag, defaultValue])

  return enabled
}
