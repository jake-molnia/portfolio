import { useEffect, useRef } from 'react'

/* ── physics constants ── */
const SPRING     = 0.0006
const DAMPING    = 0.96
const MOUSE_PUSH = 60
const MOUSE_SQ   = MOUSE_PUSH * MOUSE_PUSH   // pre-squared for fast distance check
const PUSH_FORCE = 3
const WANDER     = 0.03
const DIST_DECAY = 0.6
const MAX_SPEED  = 12
const PUSH_VIS   = 0.08  // threshold below which push is visually negligible

/* ── GPU / hardware detection (runs once) ── */
let _hasGPU = null
function hasGPU() {
  if (_hasGPU !== null) return _hasGPU
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl')
    if (!gl) { _hasGPU = false; return false }
    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    if (dbg) {
      const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL).toLowerCase()
      // Software renderers / known-slow backends
      _hasGPU = !(renderer.includes('swiftshader') ||
                   renderer.includes('llvmpipe')    ||
                   renderer.includes('softpipe')    ||
                   renderer.includes('software'))
    } else {
      _hasGPU = true // WebGL works, assume hardware
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  } catch { _hasGPU = false }
  return _hasGPU
}

/* ── helpers ── */
function particleCount(w, h) {
  const area = w * h
  const mobile = w < 768
  const divisor = mobile ? 500 : 130
  const max     = mobile ? 1000 : 15000
  const min     = mobile ? 200 : 800
  return Math.min(max, Math.max(min, (area / divisor) | 0))
}

function rand(lo, hi) { return Math.random() * (hi - lo) + lo }

/* ── pre-rendered sprite cache ── */
// Instead of calling createRadialGradient per-particle per-frame,
// we draw a gradient once to a tiny offscreen canvas and drawImage it.
const _spriteCache = new Map()

function getSprite(r, g, b, radius) {
  const key = `${r},${g},${b},${radius}`
  let entry = _spriteCache.get(key)
  if (entry) return entry

  const size = radius * 2
  const off  = document.createElement('canvas')
  off.width  = size
  off.height = size
  const c = off.getContext('2d')
  const grad = c.createRadialGradient(radius, radius, 0, radius, radius, radius)
  grad.addColorStop(0,   `rgba(${r},${g},${b},1)`)
  grad.addColorStop(0.4, `rgba(${r},${g},${b},0.3)`)
  grad.addColorStop(1,   `rgba(${r},${g},${b},0)`)
  c.fillStyle = grad
  c.fillRect(0, 0, size, size)

  entry = { canvas: off, half: radius }
  _spriteCache.set(key, entry)
  return entry
}

/* ── text sampling ── */
function sampleTextPositions(text, canvasW, canvasH, count) {
  const off  = document.createElement('canvas')
  off.width  = canvasW
  off.height = canvasH
  const octx = off.getContext('2d')

  // binary-search best font size
  let lo = 10, hi = (canvasH * 0.7) | 0, fontSize = lo
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    octx.font = `800 ${mid}px 'Violet Sans', sans-serif`
    if (octx.measureText(text).width <= canvasW * 0.78) { fontSize = mid; lo = mid + 1 }
    else hi = mid - 1
  }

  octx.clearRect(0, 0, canvasW, canvasH)
  octx.fillStyle    = '#fff'
  octx.font         = `800 ${fontSize}px 'Violet Sans', sans-serif`
  octx.textAlign    = 'center'
  octx.textBaseline = 'middle'
  octx.fillText(text, canvasW / 2, canvasH / 2)

  const data = octx.getImageData(0, 0, canvasW, canvasH).data
  const pool = []
  const stride = canvasW * 4
  for (let y = 0; y < canvasH; y += 2) {
    const rowOff = y * stride
    for (let x = 0; x < canvasW; x += 2) {
      if (data[rowOff + x * 4 + 3] > 100) pool.push(x, y)  // flat array, 2 values per point
    }
  }

  const len = pool.length >> 1
  if (!len) return null

  // Fisher-Yates on pairs
  for (let i = len - 1; i > 0; i--) {
    const j  = (Math.random() * (i + 1)) | 0
    const i2 = i * 2, j2 = j * 2
    let tmp = pool[i2];     pool[i2]     = pool[j2];     pool[j2]     = tmp
    tmp     = pool[i2 + 1]; pool[i2 + 1] = pool[j2 + 1]; pool[j2 + 1] = tmp
  }

  // Return flat Float32Arrays for SoA layout
  const xs = new Float32Array(count)
  const ys = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const idx = (i % len) * 2
    xs[i] = pool[idx]
    ys[i] = pool[idx + 1]
  }
  return { xs, ys }
}

/* ── component ── */
export default function NeuralCanvas({ name = 'Jacob Molnia' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx    = canvas.getContext('2d', { alpha: true })
    const gpu    = hasGPU()
    let raf

    /* ── SoA particle arrays (cache-friendly) ── */
    let N = 0
    let px, py, hx, hy, vx, vy, pr, push

    const mouse = { x: -9999, y: -9999 }

    function resize() {
      const p = canvas.parentElement
      canvas.width  = p.offsetWidth
      canvas.height = p.offsetHeight
    }

    function init() {
      N = particleCount(canvas.width, canvas.height)
      const positions = sampleTextPositions(name, canvas.width, canvas.height, N)

      px   = new Float32Array(N)
      py   = new Float32Array(N)
      hx   = new Float32Array(N)
      hy   = new Float32Array(N)
      vx   = new Float32Array(N)
      vy   = new Float32Array(N)
      pr   = new Float32Array(N)
      push = new Float32Array(N)

      for (let i = 0; i < N; i++) {
        const homeX = positions ? positions.xs[i] : rand(30, canvas.width  - 30)
        const homeY = positions ? positions.ys[i] : rand(30, canvas.height - 30)
        px[i] = hx[i] = homeX
        py[i] = hy[i] = homeY
        vx[i] = rand(-0.2, 0.2)
        vy[i] = rand(-0.2, 0.2)
        pr[i] = rand(0.7, 2.0)
        push[i] = 0
      }

      // Clear sprite cache on resize (radii may differ)
      _spriteCache.clear()
    }

    /* ── update (physics) ── */
    function update() {
      const W = canvas.width, H = canvas.height
      const mx = mouse.x, my = mouse.y

      for (let i = 0; i < N; i++) {
        // spring toward home
        vx[i] += (hx[i] - px[i]) * SPRING
        vy[i] += (hy[i] - py[i]) * SPRING

        // wander
        vx[i] += rand(-WANDER, WANDER)
        vy[i] += rand(-WANDER, WANDER)

        // mouse repulsion (squared-distance check avoids sqrt in common case)
        const dx = px[i] - mx
        const dy = py[i] - my
        const dSq = dx * dx + dy * dy
        if (dSq < MOUSE_SQ && dSq > 0.001) {
          push[i] = 1
          const dist  = Math.sqrt(dSq)
          const force = (1 - dist / MOUSE_PUSH) * PUSH_FORCE
          const inv   = force / dist          // combine division
          vx[i] += dx * inv
          vy[i] += dy * inv
        }

        // damping & push decay
        vx[i]   *= DAMPING
        vy[i]   *= DAMPING
        push[i] *= DIST_DECAY

        // speed cap
        const spd = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i])
        if (spd > MAX_SPEED) {
          const s = MAX_SPEED / spd
          vx[i] *= s
          vy[i] *= s
        }

        // integrate
        px[i] += vx[i]
        py[i] += vy[i]

        // boundary bounce
        if (px[i] < 1)     { px[i] = 1;     vx[i] =  Math.abs(vx[i]) * 0.6 }
        if (px[i] > W - 1) { px[i] = W - 1; vx[i] = -Math.abs(vx[i]) * 0.6 }
        if (py[i] < 1)     { py[i] = 1;     vy[i] =  Math.abs(vy[i]) * 0.6 }
        if (py[i] > H - 1) { py[i] = H - 1; vy[i] = -Math.abs(vy[i]) * 0.6 }
      }
    }

    /* ── draw (GPU path: RGB split, non-GPU: tinted white glow) ── */
    function draw() {
      const W = canvas.width, H = canvas.height
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'

      if (gpu) {
        drawGPU()
      } else {
        drawFallback()
      }
    }

    /* GPU path — full RGB chromatic split via cached sprites */
    function drawGPU() {
      for (let i = 0; i < N; i++) {
        const t   = push[i]
        const rad = (pr[i] * 5) | 0 || 1   // integer radius for cache hits
        const a   = t < PUSH_VIS ? 0.15 : 0.05

        if (t < PUSH_VIS) {
          // white glow (single sprite)
          const sp = getSprite(255, 255, 255, rad)
          ctx.globalAlpha = a
          ctx.drawImage(sp.canvas, px[i] - sp.half, py[i] - sp.half)
        } else {
          // RGB chromatic split (3 sprites)
          const off = t * pr[i] * 4
          ctx.globalAlpha = a

          const sr = getSprite(255, 30, 30, rad)
          ctx.drawImage(sr.canvas, px[i] - off - sr.half, py[i] - off * 0.4 - sr.half)

          const sg = getSprite(30, 255, 30, rad)
          ctx.drawImage(sg.canvas, px[i] - sg.half, py[i] + off * 0.5 - sg.half)

          const sb = getSprite(30, 100, 255, rad)
          ctx.drawImage(sb.canvas, px[i] + off - sb.half, py[i] - off * 0.3 - sb.half)
        }
      }
      ctx.globalAlpha = 1
    }

    /* Non-GPU fallback — single tinted glow, color shifts toward warm on push.
       Uses the same sprite cache (1 drawImage vs 3), avoids expensive
       radial gradient calls entirely. Visually similar: particles turn
       pinkish-warm when pushed instead of full RGB split. */
    function drawFallback() {
      for (let i = 0; i < N; i++) {
        const t   = push[i]
        const rad = (pr[i] * 5) | 0 || 1
        const a   = t < PUSH_VIS ? 0.15 : 0.05

        if (t < PUSH_VIS) {
          const sp = getSprite(255, 255, 255, rad)
          ctx.globalAlpha = a
          ctx.drawImage(sp.canvas, px[i] - sp.half, py[i] - sp.half)
        } else {
          // Blend white → warm pink/magenta based on push intensity
          // This gives a similar "energy burst" feel without 3× draw calls
          const blend = Math.min(t, 1)
          const r = 255
          const g = (255 - blend * 155) | 0   // 255 → 100
          const b = (255 - blend * 55)  | 0   // 255 → 200
          const sp = getSprite(r, g, b, rad)
          ctx.globalAlpha = a + blend * 0.06   // slightly brighter when pushed
          ctx.drawImage(sp.canvas, px[i] - sp.half, py[i] - sp.half)
        }
      }
      ctx.globalAlpha = 1
    }

    /* ── loop ── */
    function loop() {
      update()
      draw()
      raf = requestAnimationFrame(loop)
    }

    /* ── events ── */
    function onMouse(e) {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    function onTouch(e) {
      const rect = canvas.getBoundingClientRect()
      const t = e.touches[0]
      mouse.x = t.clientX - rect.left
      mouse.y = t.clientY - rect.top
    }
    function onLeave() { mouse.x = -9999; mouse.y = -9999 }

    /* ── lifecycle ── */
    const ro = new ResizeObserver(() => { resize(); init() })
    ro.observe(canvas.parentElement)
    resize()
    document.fonts.ready.then(() => { init(); loop() })

    canvas.addEventListener('mousemove', onMouse)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('touchmove', onTouch, { passive: true })
    canvas.addEventListener('touchend', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMouse)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('touchmove', onTouch)
      canvas.removeEventListener('touchend', onLeave)
    }
  }, [])

  return (
    <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} />
  )
}
