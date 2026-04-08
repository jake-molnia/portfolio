import { useEffect, useRef } from 'react'
import { useTheme } from './ThemeContext'
import { cdn } from './cdn'

// ── Physics ──
const SPRING     = 0.0005
const DAMPING    = 0.95
const MOUSE_PUSH = 100
const PUSH_FORCE = 2
const WANDER     = 0.015
const DIST_DECAY = 0.55

// ── Background grid ──
const GRID_STEP       = 32
const GRID_BASE_ALPHA = 0.04
const GRID_PULSE_AMP  = 0.03
const GRID_MOUSE_R    = 200
const GRID_MOUSE_GLOW = 0.18

// ── Text particles ──
const TEXT_MOUSE_R    = 200
const TEXT_MOUSE_GLOW = 0.3

interface Particle {
  x: number; y: number
  hx: number; hy: number
  vx: number; vy: number
  r: number
  push: number
  phase: number
}

function particleCount(w: number, h: number): number {
  const area = w * h
  return Math.min(15000, Math.max(800, Math.floor(area / 130)))
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function sampleTextPositions(
  text: string, canvasW: number, canvasH: number, count: number,
): Array<{ x: number; y: number }> | null {
  const off = document.createElement('canvas')
  off.width  = canvasW
  off.height = canvasH
  const octx = off.getContext('2d')!

  let lo = 10, hi = Math.floor(canvasH * 0.7), fontSize = lo
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    octx.font = `800 ${mid}px 'Violet Sans', sans-serif`
    if (octx.measureText(text).width <= canvasW * 0.78) { fontSize = mid; lo = mid + 1 }
    else hi = mid - 1
  }

  octx.clearRect(0, 0, canvasW, canvasH)
  octx.fillStyle    = '#fff'
  octx.font = `800 ${fontSize}px 'Violet Sans', sans-serif`
  octx.textAlign    = 'center'
  octx.textBaseline = 'middle'
  octx.fillText(text, canvasW / 2, canvasH / 2)

  const data = octx.getImageData(0, 0, canvasW, canvasH).data
  const pool: Array<{ x: number; y: number }> = []
  for (let y = 0; y < canvasH; y += 2)
    for (let x = 0; x < canvasW; x += 2)
      if (data[(y * canvasW + x) * 4 + 3] > 100) pool.push({ x, y })

  if (!pool.length) return null
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return Array.from({ length: count }, (_, i) => pool[i % pool.length])
}

interface NeuralCanvasProps {
  name?: string
}

export default function NeuralCanvas({ name = 'Jacob Molnia' }: NeuralCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const particleColorRef = useRef(resolvedTheme === 'dark' ? '#ffffff' : '#111111')

  // Update particle color ref whenever theme changes — no reinit needed
  useEffect(() => {
    particleColorRef.current = resolvedTheme === 'dark' ? '#ffffff' : '#111111'
  }, [resolvedTheme])

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!

    let nodes: Particle[] = []
    let raf: number
    let running = false
    const mouse = { x: -9999, y: -9999 }

    function resize() {
      const p = canvas.parentElement
      if (!p) return
      canvas.width  = p.offsetWidth
      canvas.height = p.offsetHeight
    }

    function init() {
      const count = particleCount(canvas.width, canvas.height)
      const positions = sampleTextPositions(name, canvas.width, canvas.height, count)
      nodes = Array.from({ length: count }, (_, i): Particle => {
        const home = positions
          ? positions[i]
          : { x: rand(30, canvas.width - 30), y: rand(30, canvas.height - 30) }
        return {
          x: home.x, y: home.y,
          hx: home.x, hy: home.y,
          vx: rand(-0.08, 0.08),
          vy: rand(-0.08, 0.08),
          r: rand(0.4, 1.3),
          push: 0,
          phase: rand(0, 6.2832),
        }
      })
    }

    function draw(time: number) {
      const W = canvas.width, H = canvas.height
      const mx = mouse.x, my = mouse.y
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = particleColorRef.current

      // ── Background dot grid with staggered pulse + mouse spotlight ──
      const gridMouseRSq = GRID_MOUSE_R * GRID_MOUSE_R
      for (let gy = GRID_STEP / 2; gy < H; gy += GRID_STEP) {
        for (let gx = GRID_STEP / 2; gx < W; gx += GRID_STEP) {
          // Staggered wave — each dot has a unique phase from its position
          const wave = Math.sin(time * 0.0006 + gx * 0.012 + gy * 0.018) * 0.5 + 0.5
          let a = GRID_BASE_ALPHA + wave * GRID_PULSE_AMP
          // Mouse spotlight
          const dx = gx - mx, dy = gy - my
          const dSq = dx * dx + dy * dy
          if (dSq < gridMouseRSq) {
            a += (1 - Math.sqrt(dSq) / GRID_MOUSE_R) * GRID_MOUSE_GLOW
          }
          ctx.globalAlpha = a
          ctx.fillRect(gx, gy, 1, 1)
        }
      }

      // ── Text particles with breathe + mouse spotlight ──
      const textMouseRSq = TEXT_MOUSE_R * TEXT_MOUSE_R
      for (let i = 0, len = nodes.length; i < len; i++) {
        const n = nodes[i]
        const breathe = Math.sin(time * 0.0008 + n.phase) * 0.04
        let a = 0.15 + n.r * 0.3 + breathe + n.push * 0.2
        // Mouse spotlight
        const dx = n.x - mx, dy = n.y - my
        const dSq = dx * dx + dy * dy
        if (dSq < textMouseRSq) {
          a += (1 - Math.sqrt(dSq) / TEXT_MOUSE_R) * TEXT_MOUSE_GLOW
        }
        ctx.globalAlpha = Math.min(a, 0.9)
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, 6.2832)
        ctx.fill()
      }

      ctx.globalAlpha = 1
    }

    function update() {
      const W = canvas.width, H = canvas.height
      const mx = mouse.x, my = mouse.y
      for (let i = 0, len = nodes.length; i < len; i++) {
        const n = nodes[i]
        n.vx += (n.hx - n.x) * SPRING
        n.vy += (n.hy - n.y) * SPRING
        n.vx += rand(-WANDER, WANDER)
        n.vy += rand(-WANDER, WANDER)

        const dx = n.x - mx, dy = n.y - my
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        if (dist < MOUSE_PUSH) {
          n.push = 1
          const force = (1 - dist / MOUSE_PUSH) * PUSH_FORCE
          n.vx += (dx / dist) * force
          n.vy += (dy / dist) * force
        }

        n.vx *= DAMPING
        n.vy *= DAMPING
        n.push *= DIST_DECAY
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
        if (spd > 12) { n.vx = (n.vx / spd) * 12; n.vy = (n.vy / spd) * 12 }

        n.x += n.vx; n.y += n.vy

        if (n.x < 1)     { n.x = 1;     n.vx =  Math.abs(n.vx) * 0.6 }
        if (n.x > W - 1) { n.x = W - 1; n.vx = -Math.abs(n.vx) * 0.6 }
        if (n.y < 1)     { n.y = 1;     n.vy =  Math.abs(n.vy) * 0.6 }
        if (n.y > H - 1) { n.y = H - 1; n.vy = -Math.abs(n.vy) * 0.6 }
      }
    }

    function loop(time: number) {
      if (!running) return
      update()
      draw(time)
      raf = requestAnimationFrame(loop)
    }

    function start() {
      if (running) return
      running = true
      raf = requestAnimationFrame(loop)
    }

    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    function onVisibility() {
      if (document.hidden) stop()
      else start()
    }

    function onMouse(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    function onTouch(e: TouchEvent) {
      const rect = canvas.getBoundingClientRect()
      const t = e.touches[0]
      mouse.x = t.clientX - rect.left
      mouse.y = t.clientY - rect.top
    }
    function onLeave() { mouse.x = -9999; mouse.y = -9999 }

    const ro = new ResizeObserver(() => { resize(); init() })
    ro.observe(canvas.parentElement!)
    resize()
    // Load Violet Sans from CDN, fall back to sans-serif after 2s
    const font = new FontFace('Violet Sans', `url(${cdn('fonts/VioletSans-Regular.woff2')})`, { weight: '800' })
    const timeout = new Promise<void>(r => setTimeout(r, 2000))
    font.load()
      .then(f => document.fonts.add(f))
      .catch(() => {}) // fall back to sans-serif
      .finally(() => { init(); start() })
    // If font load is slow, start with fallback anyway
    timeout.then(() => { if (!running) { init(); start() } })

    document.addEventListener('visibilitychange', onVisibility)
    canvas.addEventListener('mousemove', onMouse)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('touchmove', onTouch, { passive: true })
    canvas.addEventListener('touchend', onLeave)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMouse)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('touchmove', onTouch)
      canvas.removeEventListener('touchend', onLeave)
    }
  }, [name])

  return (
    <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} />
  )
}
