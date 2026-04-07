import posthog from 'posthog-js'
import { useState, useEffect } from 'react'

const key  = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const host = import.meta.env.VITE_POSTHOG_HOST as string | undefined

if (key) {
  posthog.init(key, {
    api_host: host || 'https://us.i.posthog.com',
    autocapture: false,
    capture_pageview: false,
    persistence: 'localStorage',
  })
}

export function capture(event: string, properties?: Record<string, unknown>): void {
  if (key) posthog.capture(event, properties)
}

export function captureException(error: unknown, properties?: Record<string, unknown>): void {
  if (key) posthog.capture('$exception', { ...properties, $exception_message: String(error) })
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
    // No PostHog configured → keep default (everything visible)
    if (!key) return

    // Once flags load from PostHog, we have a definitive answer:
    //   flag present  → use its value (true/false)
    //   flag absent   → disabled in PostHog dashboard → false
    // Before this fires, state stays at `defaultValue` (true) to avoid FOUC.
    posthog.onFeatureFlags(() => {
      const val = posthog.getFeatureFlag(flag)
      setEnabled(val !== undefined ? Boolean(val) : false)
    })
  }, [flag, defaultValue])

  return enabled
}

export default posthog
