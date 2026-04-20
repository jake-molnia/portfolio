import { useEffect, useRef, useState, type CSSProperties } from 'react'

interface DuckProps {
  active?: boolean
}

type Mode = 'idle' | 'walk' | 'preen' | 'annoyed'

interface DuckState {
  x: number
  displayX: number
  dir: 1 | -1
  walkTarget: number
  mode: Mode
  actionUntil: number
  idleUntil: number
  walkPhase: number
  blink: number
  blinkStart: number
  blinkDuration: number
  blinkCountLeft: number
  nextBlinkAt: number
  headTrack: number
  headTrackDisplay: number
  microTilt: number
  microTiltTarget: number
  microTiltUntil: number
  nextMicroTiltAt: number
  clickStreak: number
}

interface Pose {
  bodyY: number
  bodyRot: number
  headRot: number
  wingRot: number
  tailRot: number
  thighFront: number
  thighBack: number
  shinFront: number
  shinBack: number
  footFront: number
  footBack: number
}

const DUCK_W = 58
const DUCK_H = 72
const STAGE_H = 92

const WALK_POSES: Pose[] = [
  { bodyY: 0.2, bodyRot: 0.6, headRot: 1.2, wingRot: 2.6, tailRot: 6.4, thighFront: 15, thighBack: -12, shinFront: -7, shinBack: 6, footFront: -7, footBack: 5 },
  { bodyY: -0.6, bodyRot: 1.2, headRot: 0.4, wingRot: 1.5, tailRot: 4.3, thighFront: 7, thighBack: -5, shinFront: -3, shinBack: 2, footFront: -3, footBack: 2 },
  { bodyY: -1.2, bodyRot: 1.7, headRot: -0.6, wingRot: 0.7, tailRot: 2.3, thighFront: -3, thighBack: 5, shinFront: 1, shinBack: -2, footFront: 1, footBack: -1 },
  { bodyY: -0.5, bodyRot: 0.8, headRot: -1.3, wingRot: 1.2, tailRot: 1.1, thighFront: -12, thighBack: 13, shinFront: 5, shinBack: -6, footFront: 6, footBack: -6 },
  { bodyY: 0.1, bodyRot: -0.4, headRot: -0.8, wingRot: 2.8, tailRot: 2.4, thighFront: -14, thighBack: 11, shinFront: 6, shinBack: -5, footFront: 5, footBack: -4 },
  { bodyY: -0.7, bodyRot: -1.2, headRot: 0.1, wingRot: 3.5, tailRot: 4.1, thighFront: -6, thighBack: 3, shinFront: 2, shinBack: -1, footFront: 2, footBack: -1 },
  { bodyY: -1.2, bodyRot: -1.7, headRot: 1.1, wingRot: 2.6, tailRot: 5.7, thighFront: 6, thighBack: -4, shinFront: -2, shinBack: 1, footFront: -2, footBack: 1 },
  { bodyY: -0.4, bodyRot: -0.8, headRot: 1.7, wingRot: 2.2, tailRot: 6.5, thighFront: 14, thighBack: -12, shinFront: -6, shinBack: 5, footFront: -6, footBack: 6 },
]

const rand = (min: number, max: number) => Math.random() * (max - min) + min
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function nextBlinkDelay() {
  const r = Math.random()
  if (r < 0.16) return rand(950, 1500)
  if (r < 0.74) return rand(2800, 5200)
  return rand(5400, 8400)
}

function nextBlinkDuration() {
  return Math.random() < 0.18 ? rand(220, 320) : rand(120, 190)
}

function playOnce(el: SVGElement | HTMLElement | null, animation: string) {
  if (!el) return
  el.style.animation = 'none'
  el.getBoundingClientRect()
  el.style.animation = animation
}

function mixPose(a: Pose, b: Pose, t: number): Pose {
  return {
    bodyY: lerp(a.bodyY, b.bodyY, t),
    bodyRot: lerp(a.bodyRot, b.bodyRot, t),
    headRot: lerp(a.headRot, b.headRot, t),
    wingRot: lerp(a.wingRot, b.wingRot, t),
    tailRot: lerp(a.tailRot, b.tailRot, t),
    thighFront: lerp(a.thighFront, b.thighFront, t),
    thighBack: lerp(a.thighBack, b.thighBack, t),
    shinFront: lerp(a.shinFront, b.shinFront, t),
    shinBack: lerp(a.shinBack, b.shinBack, t),
    footFront: lerp(a.footFront, b.footFront, t),
    footBack: lerp(a.footBack, b.footBack, t),
  }
}

function getWalkPose(phase: number) {
  const normalized = ((phase % WALK_POSES.length) + WALK_POSES.length) % WALK_POSES.length
  const i = Math.floor(normalized)
  const next = (i + 1) % WALK_POSES.length
  return mixPose(WALK_POSES[i], WALK_POSES[next], normalized - i)
}

export default function Duck({ active = true }: DuckProps) {
  const [reducedMotion, setReducedMotion] = useState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [navWidth, setNavWidth] = useState(560)
  const [themeWidth, setThemeWidth] = useState(48)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(true)

  const shellRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)

  const bodyRef = useRef<SVGGElement>(null)
  const bodyHighlightRef = useRef<SVGGElement>(null)
  const bellyRef = useRef<SVGGElement>(null)
  const shoulderRef = useRef<SVGGElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const crownRef = useRef<SVGGElement>(null)
  const faceRef = useRef<SVGGElement>(null)
  const cheekRef = useRef<SVGGElement>(null)
  const wingRef = useRef<SVGGElement>(null)
  const wingInsetRef = useRef<SVGGElement>(null)
  const wingFeatherRef = useRef<SVGGElement>(null)
  const tailRef = useRef<SVGGElement>(null)
  const tailTipRef = useRef<SVGGElement>(null)
  const thighFrontRef = useRef<SVGGElement>(null)
  const thighBackRef = useRef<SVGGElement>(null)
  const shinFrontRef = useRef<SVGGElement>(null)
  const shinBackRef = useRef<SVGGElement>(null)
  const footFrontRef = useRef<SVGGElement>(null)
  const footBackRef = useRef<SVGGElement>(null)
  const toeFrontRef = useRef<SVGGElement>(null)
  const toeBackRef = useRef<SVGGElement>(null)
  const eyeFrontRef = useRef<SVGGElement>(null)
  const eyeBackRef = useRef<SVGGElement>(null)
  const lidFrontRef = useRef<SVGGElement>(null)
  const lidBackRef = useRef<SVGGElement>(null)
  const beakUpperRef = useRef<SVGGElement>(null)
  const beakLowerRef = useRef<SVGGElement>(null)
  const beakShineRef = useRef<SVGGElement>(null)

  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef(0)
  const pointerRef = useRef({ x: 0, y: 0, active: false })
  const clickResetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const stateRef = useRef<DuckState>({
    x: 140,
    displayX: 140,
    dir: 1,
    walkTarget: 230,
    mode: 'idle',
    actionUntil: 0,
    idleUntil: 0,
    walkPhase: 0,
    blink: 0,
    blinkStart: 0,
    blinkDuration: 160,
    blinkCountLeft: 0,
    nextBlinkAt: 0,
    headTrack: 0,
    headTrackDisplay: 0,
    microTilt: 0,
    microTiltTarget: 0,
    microTiltUntil: 0,
    nextMicroTiltAt: 0,
    clickStreak: 0,
  })

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!active || !shellRef.current) return
    const nav = shellRef.current.closest('.mobile-nav')
    if (!nav) return

    const resize = () => {
      setNavWidth(nav.clientWidth)
      const theme = nav.querySelector<HTMLElement>('.mobile-nav-theme')
      setThemeWidth(theme?.offsetWidth ?? 48)
    }
    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(nav)

    const theme = nav.querySelector<HTMLElement>('.mobile-nav-theme')
    if (theme) resizeObserver.observe(theme)

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    )
    intersectionObserver.observe(nav)

    return () => {
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
    }
  }, [active])

  useEffect(() => {
    if (!active) return

    const S = stateRef.current
    const now = performance.now()
    lastTimeRef.current = now
    S.idleUntil = now + rand(900, 1800)
    S.nextBlinkAt = now + nextBlinkDelay()
    S.nextMicroTiltAt = now + rand(3800, 7600)

    const loop = (t: number) => {
      if (document.hidden || !visible) {
        lastTimeRef.current = t
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      const S = stateRef.current
      const dt = Math.min(t - lastTimeRef.current, 40) / 16.667
      lastTimeRef.current = t

      const roamLeft = 26
      const roamRight = Math.max(roamLeft + 100, navWidth - themeWidth - 34)

      S.x = clamp(S.x, roamLeft, roamRight)
      S.walkTarget = clamp(S.walkTarget, roamLeft, roamRight)

      if (t >= S.nextBlinkAt && S.blinkStart === 0) {
        S.blinkStart = t
        S.blinkDuration = nextBlinkDuration()
        S.blinkCountLeft = Math.random() < 0.2 ? 2 : 1
      }
      if (S.blinkStart) {
        const p = clamp((t - S.blinkStart) / S.blinkDuration, 0, 1)
        S.blink = Math.sin(p * Math.PI)
        if (p >= 1) {
          S.blink = 0
          S.blinkStart = 0
          S.blinkCountLeft -= 1
          S.nextBlinkAt = t + (S.blinkCountLeft > 0 ? rand(90, 160) : nextBlinkDelay())
        }
      }

      if (!reducedMotion) {
        if (S.mode === 'walk') {
          const dist = S.walkTarget - S.x
          S.dir = dist >= 0 ? 1 : -1
          const speed = clamp(Math.abs(dist) * 0.05, 0.26, 0.88)
          S.x += S.dir * speed * dt
          S.walkPhase += speed * dt * 0.64
          if (Math.abs(dist) < 1.6 || t >= S.actionUntil) {
            S.mode = 'idle'
            S.idleUntil = t + rand(1800, 3400)
          }
        } else if (S.mode === 'preen' || S.mode === 'annoyed') {
          if (t >= S.actionUntil) {
            S.mode = 'idle'
            S.idleUntil = t + rand(1700, 3000)
          }
        } else {
          if (!pointerRef.current.active && t >= S.nextMicroTiltAt) {
            S.microTiltTarget = rand(-5.5, 5.5)
            S.microTiltUntil = t + rand(900, 1500)
            S.nextMicroTiltAt = t + rand(6200, 9800)
          }
          if (t >= S.microTiltUntil) S.microTiltTarget *= 0.82
          S.microTilt += (S.microTiltTarget - S.microTilt) * (1 - Math.pow(0.82, dt))

          if (t >= S.idleUntil) {
            const r = Math.random()
            if (r < 0.22) {
              S.mode = 'preen'
              S.actionUntil = t + 1100
              playOnce(headRef.current, 'duck-preen-head 1.08s ease-in-out 1')
              playOnce(wingRef.current, 'duck-preen-wing 1.08s ease-in-out 1')
            } else {
              S.mode = 'walk'
              S.walkTarget = rand(roamLeft, roamRight)
              S.actionUntil = t + rand(1500, 2700)
            }
          }
        }
      } else {
        S.mode = 'idle'
        S.microTilt *= 0.84
      }

      const pointerTarget = pointerRef.current.active
        ? clamp((pointerRef.current.x - S.displayX) * 0.14 + (pointerRef.current.y - 34) * 0.03, -8, 8)
        : S.mode === 'annoyed'
          ? S.dir * -3.2
          : S.dir * 1.2 + S.microTilt

      S.headTrack = pointerTarget
      S.displayX += (S.x - S.displayX) * (1 - Math.pow(0.72, dt))
      S.headTrackDisplay += (S.headTrack - S.headTrackDisplay) * (1 - Math.pow(0.78, dt))

      const idleBodyY = reducedMotion ? 0 : Math.sin(t / 2600) * 0.52
      const idleBodyRot = reducedMotion ? 0 : Math.sin(t / 3400 + 0.2) * 0.5
      const idleWingRot = reducedMotion ? 0.3 : 0.7 + Math.sin(t / 3200 + 0.6) * 0.8
      const idleTailRot = reducedMotion ? 0.8 : 1.4 + Math.sin(t / 2400 + 0.4) * 1.2 + Math.sin(t / 5200) * 0.4

      const walkPose = getWalkPose(S.walkPhase)
      const bodyY = S.mode === 'walk' ? walkPose.bodyY : idleBodyY
      const bodyRot = S.mode === 'walk' ? walkPose.bodyRot : idleBodyRot
      const headRot = S.mode === 'walk' ? walkPose.headRot : 0
      const wingRot = S.mode === 'walk' ? walkPose.wingRot : idleWingRot
      const tailRot = S.mode === 'walk' ? walkPose.tailRot : idleTailRot
      const thighFrontRot = S.mode === 'walk' ? walkPose.thighFront : 0
      const thighBackRot = S.mode === 'walk' ? walkPose.thighBack : 0
      const shinFrontRot = S.mode === 'walk' ? walkPose.shinFront : 0
      const shinBackRot = S.mode === 'walk' ? walkPose.shinBack : 0
      const footFrontRot = S.mode === 'walk' ? walkPose.footFront : 0
      const footBackRot = S.mode === 'walk' ? walkPose.footBack : 0

      if (rootRef.current) {
        rootRef.current.style.transform = `translate3d(${(S.displayX - DUCK_W / 2).toFixed(2)}px, 16px, 0)`
      }
      if (mirrorRef.current) {
        mirrorRef.current.style.transform = `scaleX(${-S.dir})`
      }
      if (bodyRef.current) {
        bodyRef.current.setAttribute('transform', `translate(0 ${bodyY.toFixed(2)}) rotate(${bodyRot.toFixed(2)} 52 79)`)
      }
      if (bodyHighlightRef.current) {
        bodyHighlightRef.current.setAttribute('transform', `translate(${(Math.sin(t / 2800) * 0.18).toFixed(2)} ${(idleBodyY * 0.24).toFixed(2)})`)
      }
      if (bellyRef.current) {
        bellyRef.current.setAttribute('transform', `translate(${(Math.sin(t / 2200 + 0.7) * 0.22).toFixed(2)} ${(idleBodyY * 0.18).toFixed(2)})`)
      }
      if (shoulderRef.current) {
        shoulderRef.current.setAttribute('transform', `translate(${(bodyRot * 0.06).toFixed(2)} ${(bodyY * 0.16).toFixed(2)})`)
      }
      if (headRef.current) {
        headRef.current.setAttribute('transform', `rotate(${(headRot + S.headTrackDisplay).toFixed(2)} 40 45)`)
      }
      if (crownRef.current) {
        crownRef.current.setAttribute('transform', `translate(${(S.headTrackDisplay * -0.05).toFixed(2)} ${(Math.sin(t / 3100) * 0.14).toFixed(2)})`)
      }
      if (faceRef.current) {
        faceRef.current.setAttribute('transform', `translate(${(S.headTrackDisplay * 0.04).toFixed(2)} ${(S.blink * 0.2).toFixed(2)})`)
      }
      if (cheekRef.current) {
        cheekRef.current.setAttribute('transform', `translate(${(S.headTrackDisplay * 0.05).toFixed(2)} ${(S.blink * 0.08).toFixed(2)})`)
      }
      if (wingRef.current && S.mode !== 'preen') {
        wingRef.current.setAttribute('transform', `rotate(${wingRot.toFixed(2)} 60 74)`)
      }
      if (wingInsetRef.current) {
        wingInsetRef.current.setAttribute('transform', `rotate(${(wingRot * 0.36).toFixed(2)} 60 76)`)
      }
      if (wingFeatherRef.current) {
        wingFeatherRef.current.setAttribute('transform', `rotate(${(wingRot * 0.72).toFixed(2)} 62 80)`)
      }
      if (tailRef.current) {
        tailRef.current.setAttribute('transform', `rotate(${tailRot.toFixed(2)} 78 83)`)
      }
      if (tailTipRef.current) {
        tailTipRef.current.setAttribute('transform', `rotate(${(tailRot * 1.3).toFixed(2)} 84 82)`)
      }
      if (thighFrontRef.current) {
        thighFrontRef.current.setAttribute('transform', `rotate(${thighFrontRot.toFixed(2)} 44 95)`)
      }
      if (thighBackRef.current) {
        thighBackRef.current.setAttribute('transform', `rotate(${thighBackRot.toFixed(2)} 58 95)`)
      }
      if (shinFrontRef.current) {
        shinFrontRef.current.setAttribute('transform', `rotate(${shinFrontRot.toFixed(2)} 43 101)`)
      }
      if (shinBackRef.current) {
        shinBackRef.current.setAttribute('transform', `rotate(${shinBackRot.toFixed(2)} 59 101)`)
      }
      if (footFrontRef.current) {
        footFrontRef.current.setAttribute('transform', `rotate(${footFrontRot.toFixed(2)} 42 116)`)
      }
      if (footBackRef.current) {
        footBackRef.current.setAttribute('transform', `rotate(${footBackRot.toFixed(2)} 60 116)`)
      }
      if (toeFrontRef.current) {
        toeFrontRef.current.setAttribute('transform', `rotate(${(footFrontRot * 0.52).toFixed(2)} 41 116.5)`)
      }
      if (toeBackRef.current) {
        toeBackRef.current.setAttribute('transform', `rotate(${(footBackRot * 0.52).toFixed(2)} 61 116.5)`)
      }
      if (beakUpperRef.current) {
        beakUpperRef.current.setAttribute('transform', `rotate(${(S.headTrackDisplay * 0.18).toFixed(2)} 54 43)`)
      }
      if (beakLowerRef.current) {
        beakLowerRef.current.setAttribute('transform', `rotate(0 54 45)`)
      }
      if (beakShineRef.current) {
        beakShineRef.current.setAttribute('transform', `translate(${(S.headTrackDisplay * 0.07).toFixed(2)} 0)`)
      }

      const eyeScale = (1 - S.blink * 0.92).toFixed(3)
      eyeFrontRef.current?.setAttribute('transform', `translate(0 ${(S.blink * 0.8).toFixed(2)}) scale(1 ${eyeScale})`)
      eyeBackRef.current?.setAttribute('transform', `translate(0 ${(S.blink * 0.5).toFixed(2)}) scale(1 ${eyeScale})`)
      lidFrontRef.current?.setAttribute('transform', `translate(0 ${(S.blink * 6.5).toFixed(2)})`)
      lidBackRef.current?.setAttribute('transform', `translate(0 ${(S.blink * 4.8).toFixed(2)})`)

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, navWidth, reducedMotion, themeWidth, visible])

  useEffect(() => () => clearTimeout(clickResetTimerRef.current), [])

  if (!active) return null

  const shellStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 'calc(100% - 16px)',
    height: STAGE_H,
    pointerEvents: 'none',
    zIndex: 3,
    opacity: mounted ? 1 : 0,
  }

  const rootStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: DUCK_W,
    height: DUCK_H,
    pointerEvents: 'auto',
    cursor: 'pointer',
    outline: 'none',
    willChange: 'transform',
  }

  const mirrorStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    transformOrigin: '50% 64%',
    willChange: 'transform',
  }

  const react = () => {
    const S = stateRef.current
    clearTimeout(clickResetTimerRef.current)
    S.clickStreak = Math.min(S.clickStreak + 1, 4)
    clickResetTimerRef.current = setTimeout(() => {
      stateRef.current.clickStreak = 0
    }, 4200)
    playOnce(beakLowerRef.current, 'duck-beak-open 0.22s ease-out 1')
    if (S.clickStreak >= 3) {
      S.mode = 'annoyed'
      S.actionUntil = performance.now() + 760
      playOnce(headRef.current, 'duck-head-shake 0.62s ease-in-out 1')
    } else {
      playOnce(bodyRef.current, 'duck-perch-bob 0.34s cubic-bezier(.2,.9,.28,1.15) 1')
    }
  }

  return (
    <div ref={shellRef} className={`mobile-nav-duck ${mounted ? 'duck-mounted' : ''}`} style={shellStyle}>
      <div className="mobile-nav-duck-stage">
        <div className="mobile-nav-duck-rail" aria-hidden="true" />
        <div
          ref={rootRef}
          data-duck
          style={rootStyle}
          role="button"
          tabIndex={0}
          aria-label="Animated duck roaming along the navigation bar. Press to interact."
          onPointerMove={e => {
            const rect = e.currentTarget.parentElement?.getBoundingClientRect()
            if (!rect) return
            pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true }
          }}
          onPointerLeave={() => {
            pointerRef.current.active = false
          }}
          onClick={react}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              react()
            }
          }}
        >
          <div ref={mirrorRef} style={mirrorStyle}>
            <svg viewBox="0 0 104 132" width={DUCK_W} height={DUCK_H} style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
              <ellipse cx="52" cy="125.8" rx="23" ry="3.3" fill="rgba(39,28,18,0.12)" />

              <g ref={thighBackRef}>
                <path d="M58.2 90.3 C60.5 91.5 61.6 94 61.4 97.1 C60.7 98.8 59.5 99.2 58 98.5 C57.5 95.9 57.5 93.2 58.2 90.3 Z" fill="#f0a522" stroke="#2a1b12" strokeWidth="0.96" strokeLinejoin="round" />
                <g ref={shinBackRef}>
                  <path d="M57.7 97.9 C59.3 98.7 60.1 100.2 60.1 102.8 L59.8 113.8 C58.9 114.9 57.8 115 56.8 113.8 L56.5 102.4 C56.6 100.5 57 99.1 57.7 97.9 Z" fill="#efa125" stroke="#2a1b12" strokeWidth="0.96" strokeLinejoin="round" />
                </g>
                <g ref={footBackRef}>
                  <path d="M55.2 114.7 C57.2 113.6 60.4 113.4 63.9 114.6 C63.5 116.1 61.5 116.9 58 117 C56 116.9 55.1 116.1 55.2 114.7 Z" fill="#efa125" stroke="#2a1b12" strokeWidth="0.92" strokeLinejoin="round" />
                  <g ref={toeBackRef}>
                    <path d="M57.3 115.8 L57.1 117.1" stroke="#2a1b12" strokeWidth="0.7" strokeLinecap="round" />
                    <path d="M59.5 115.6 L59.3 117.2" stroke="#2a1b12" strokeWidth="0.7" strokeLinecap="round" />
                    <path d="M61.5 115.4 L61.6 116.8" stroke="#2a1b12" strokeWidth="0.7" strokeLinecap="round" />
                  </g>
                </g>
              </g>

              <g ref={tailRef}>
                <path d="M72 79.7 C78 74.4 84 75 88 80 C85.9 86 79.8 87.1 73.5 84.2 C71.8 82.9 71.3 81.2 72 79.7 Z" fill="#fbf5e8" stroke="#2a1b12" strokeWidth="1.1" strokeLinejoin="round" />
                <g ref={tailTipRef}>
                  <path d="M76.6 79.4 Q81 78 84.4 80.3" stroke="#d5c7b0" strokeWidth="0.74" fill="none" strokeLinecap="round" />
                  <path d="M77.8 82.2 Q81.1 81.7 83.2 83.5" stroke="#d5c7b0" strokeWidth="0.68" fill="none" strokeLinecap="round" />
                </g>
              </g>

              <g ref={bodyRef}>
                <path d="M27 59 C35.2 51.8 48.3 49.8 61 52.4 C72.6 55.2 79.7 62 81 71.6 C81 81.8 76.2 90.2 66.8 95.8 C55.1 102.1 39.7 102.4 28 97 C19.6 92.7 15.1 84.2 15.4 74.3 C15.8 66.4 20 60.6 27 59 Z" fill="#fbf5e8" stroke="#2a1b12" strokeWidth="1.4" strokeLinejoin="round" />

                <g ref={bodyHighlightRef}>
                  <path d="M25.6 67.6 C31.8 59.4 42.7 56.4 53.2 57.8 C46.6 63.6 42.7 69.6 42.5 75.7 C42.3 80.8 44.6 85.1 49.6 88.6 C39.8 89.2 29.4 81.7 25.6 67.6 Z" fill="#fffdf7" opacity="0.6" />
                </g>

                <g ref={bellyRef}>
                  <path d="M24.4 77 C28.4 69.4 37.8 65.1 48.1 66.3 C43.4 72 41.5 77.8 42.8 83.3 C44 88.6 48.2 92.8 54.4 96 C42.2 96.9 29.6 90.6 24.4 77 Z" fill="#eadfca" opacity="0.66" />
                </g>

                <g ref={shoulderRef}>
                  <path d="M36.5 56.2 C40.5 50.1 46.6 47.8 52.2 49.4 C54.9 52.4 54.7 56.7 51.6 60.6 C46.5 62.3 41.1 61 36.5 56.2 Z" fill="#f7efdf" stroke="#2a1b12" strokeWidth="1" strokeLinejoin="round" />
                </g>

                <g ref={wingRef}>
                  <path d="M52.6 67.6 C56.8 62.1 64.2 61.4 69.5 66.1 C69.7 74.1 65.1 79.3 58.8 80.8 C54.7 78.8 52.5 74.3 52.6 67.6 Z" fill="#e3ebe0" stroke="#2a1b12" strokeWidth="1.02" strokeLinejoin="round" />
                  <g ref={wingInsetRef}>
                    <path d="M54.7 68.6 C57.6 67.4 61.1 67.6 63.8 69.5 C63.8 73.2 61.5 76 58.2 76.9 C55.5 75.5 54.3 72.6 54.7 68.6 Z" fill="#f5f8f2" opacity="0.95" />
                  </g>
                  <g ref={wingFeatherRef}>
                    <path d="M57.2 70 Q60.5 72.4 62.6 76.6" stroke="#b7c3ab" strokeWidth="0.76" fill="none" strokeLinecap="round" />
                    <path d="M57.9 74.1 Q60.2 76 61.5 79.1" stroke="#b7c3ab" strokeWidth="0.72" fill="none" strokeLinecap="round" />
                  </g>
                </g>

                <g ref={headRef}>
                  <path d="M24.8 34.8 C29.7 28 39.4 24.9 49.2 26.8 C57.2 28.9 62.3 35.1 62.2 43 C61.9 51.5 55.9 57.4 46.6 59.2 C36.9 60.7 27.2 57.2 22.4 49.8 C18.7 43.6 19.4 38.1 24.8 34.8 Z" fill="#fbf5e8" stroke="#2a1b12" strokeWidth="1.36" strokeLinejoin="round" />
                  <g ref={crownRef}>
                    <path d="M28.3 34.5 C33.8 30.7 41.2 29.6 47.6 31.7" stroke="#ffffff" strokeWidth="0.88" fill="none" opacity="0.78" strokeLinecap="round" />
                  </g>
                  <g ref={faceRef}>
                    <ellipse cx="42.4" cy="43.8" rx="7.3" ry="5.1" fill="#eadfca" opacity="0.72" />
                  </g>
                  <g ref={cheekRef}>
                    <ellipse cx="46.8" cy="45.5" rx="3.2" ry="2.2" fill="#f2d8c0" opacity="0.75" />
                  </g>

                  <g ref={eyeBackRef}>
                    <ellipse cx="31.7" cy="37.5" rx="1.32" ry="1.94" fill="#22160e" />
                    <circle cx="32.1" cy="36.9" r="0.34" fill="#fff" />
                  </g>
                  <g ref={lidBackRef}>
                    <path d="M29.4 35 Q31.5 33.7 33.1 35.2 L33.1 38.2 Q31.4 37.3 29.4 38.2 Z" fill="#fbf5e8" />
                  </g>

                  <g ref={eyeFrontRef}>
                    <ellipse cx="43.1" cy="39.6" rx="2.7" ry="4.05" fill="#22160e" />
                    <circle cx="43.8" cy="38.2" r="0.72" fill="#fff" />
                    <circle cx="42.2" cy="41.1" r="0.46" fill="#fff" opacity="0.9" />
                  </g>
                  <g ref={lidFrontRef}>
                    <path d="M39 35 Q43.2 32.8 47 35.1 L47 41 Q43.1 39.6 39 41 Z" fill="#fbf5e8" />
                  </g>

                  <path d="M41.9 34.1 Q45 33.2 47.5 34.2" stroke="#2a1b12" strokeWidth="0.68" fill="none" opacity="0.38" strokeLinecap="round" />
                  <path d="M30 34.5 Q31.5 33.5 33.1 33.9" stroke="#2a1b12" strokeWidth="0.62" fill="none" opacity="0.34" strokeLinecap="round" />

                  <g ref={beakUpperRef}>
                    <path d="M51.5 39.8 C57.3 38.8 64.8 39.4 71.4 42.5 C65.9 45.5 57.8 46 51.5 44.7 Z" fill="#f1ab18" stroke="#2a1b12" strokeWidth="1.05" strokeLinejoin="round" />
                  </g>
                  <g ref={beakLowerRef} style={{ transformOrigin: '54px 44px' }}>
                    <path d="M51.5 44.2 C56.4 44.2 63.3 45.4 69.4 47.7 C63.7 49 56.2 48.8 51.8 46.6 Z" fill="#d58918" stroke="#2a1b12" strokeWidth="1.01" strokeLinejoin="round" />
                  </g>
                  <g ref={beakShineRef}>
                    <path d="M54.3 41.1 C58.9 40.4 63.2 40.7 66.9 42.2" stroke="#ffe7aa" strokeWidth="0.84" fill="none" opacity="0.82" strokeLinecap="round" />
                  </g>
                  <path d="M54.1 44.1 C58.3 44.3 62.7 45.2 66.8 46.7" stroke="#6d4511" strokeWidth="0.66" fill="none" opacity="0.56" />
                </g>
              </g>

              <g ref={thighFrontRef}>
                <path d="M43.4 90 C45.4 91.1 46.4 93.3 46.2 96.3 C45.5 97.9 44.3 98.4 42.9 97.7 C42.5 95 42.7 92.4 43.4 90 Z" fill="#f0a522" stroke="#2a1b12" strokeWidth="0.96" strokeLinejoin="round" />
                <g ref={shinFrontRef}>
                  <path d="M42.7 97.3 C44.1 98 44.9 99.6 44.9 102.1 L44.6 113.5 C43.7 114.5 42.5 114.6 41.5 113.4 L41.2 101.9 C41.3 100 41.8 98.4 42.7 97.3 Z" fill="#efa125" stroke="#2a1b12" strokeWidth="0.96" strokeLinejoin="round" />
                </g>
                <g ref={footFrontRef}>
                  <path d="M39.7 114.5 C41.6 113.4 44.8 113.2 48.4 114.4 C48 115.9 46 116.7 42.5 116.8 C40.5 116.7 39.6 116 39.7 114.5 Z" fill="#efa125" stroke="#2a1b12" strokeWidth="0.92" strokeLinejoin="round" />
                  <g ref={toeFrontRef}>
                    <path d="M41.6 115.6 L41.4 116.9" stroke="#2a1b12" strokeWidth="0.7" strokeLinecap="round" />
                    <path d="M43.8 115.4 L43.7 117" stroke="#2a1b12" strokeWidth="0.7" strokeLinecap="round" />
                    <path d="M45.8 115.2 L45.9 116.6" stroke="#2a1b12" strokeWidth="0.7" strokeLinecap="round" />
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
