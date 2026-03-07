import { useEffect, useRef } from 'react'

const COUNT      = 15000
const SPRING     = 0.0006
const DAMPING    = 0.96
const MOUSE_PUSH = 110
const PUSH_FORCE = 15
const WANDER     = 0.03
const DIST_DECAY = 0.6

function rand(min, max) { return Math.random() * (max - min) + min }

function sampleTextPositions(text, canvasW, canvasH, count) {
  const off = document.createElement('canvas')
  off.width  = canvasW
  off.height = canvasH
  const octx = off.getContext('2d')

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
  const pool = []
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

export default function NeuralCanvas({ name = 'Jacob Molnia' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx    = canvas.getContext('2d')
    let nodes = [], raf
    const mouse = { x: -9999, y: -9999 }

    function resize() {
      const p = canvas.parentElement
      canvas.width  = p.offsetWidth
      canvas.height = p.offsetHeight
    }

    function init() {
      const positions = sampleTextPositions(name, canvas.width, canvas.height, COUNT)
      nodes = Array.from({ length: COUNT }, (_, i) => {
        const home = positions
          ? positions[i]
          : { x: rand(30, canvas.width - 30), y: rand(30, canvas.height - 30) }
        return {
          x: home.x, y: home.y,
          hx: home.x, hy: home.y,
          vx: rand(-0.2, 0.2),
          vy: rand(-0.2, 0.2),
          r: rand(0.7, 2.0),
          push: 0,
        }
      })
    }

    function draw() {
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'lighter'

      nodes.forEach(n => {
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
        const t = n.push
        const rad = n.r * 5
        const a = t < 0.08 ? 0.15 : 0.05

        if (t < 0.08) {
          // idle — white
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, rad)
          g.addColorStop(0,   `rgba(255,255,255,${a})`)
          g.addColorStop(0.4, `rgba(255,255,255,${(a * 0.3).toFixed(3)})`)
          g.addColorStop(1,   `rgba(255,255,255,0)`)
          ctx.beginPath()
          ctx.arc(n.x, n.y, rad, 0, Math.PI * 2)
          ctx.fillStyle = g
          ctx.fill()
        } else {
          // moving — RGB split, no brightness change, just offset
          const off = t * n.r * 4

          ;[
            { dx: -off, dy: -off * 0.4, col: '255,30,30' },
            { dx:  0,   dy:  off * 0.5, col: '30,255,30' },
            { dx:  off, dy: -off * 0.3, col: '30,100,255' },
          ].forEach(ch => {
            const cx = n.x + ch.dx, cy = n.y + ch.dy
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
            g.addColorStop(0,   `rgba(${ch.col},${a})`)
            g.addColorStop(0.4, `rgba(${ch.col},${(a * 0.3).toFixed(3)})`)
            g.addColorStop(1,   `rgba(${ch.col},0)`)
            ctx.beginPath()
            ctx.arc(cx, cy, rad, 0, Math.PI * 2)
            ctx.fillStyle = g
            ctx.fill()
          })
        }
      })
    }

    function update() {
      const W = canvas.width, H = canvas.height
      nodes.forEach(n => {
        n.vx += (n.hx - n.x) * SPRING
        n.vy += (n.hy - n.y) * SPRING
        n.vx += rand(-WANDER, WANDER)
        n.vy += rand(-WANDER, WANDER)

        const dx = n.x - mouse.x, dy = n.y - mouse.y
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
      })
    }

    function loop() { update(); draw(); raf = requestAnimationFrame(loop) }

    function onMouse(e) {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    function onLeave() { mouse.x = -9999; mouse.y = -9999 }

    const ro = new ResizeObserver(() => { resize(); init() })
    ro.observe(canvas.parentElement)
    resize()
    document.fonts.ready.then(() => { init(); loop() })

    canvas.addEventListener('mousemove', onMouse)
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMouse)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
  <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} />
)
}