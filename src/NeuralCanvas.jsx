import { useEffect, useRef } from 'react'

const NODE_COUNT = 72
const MAX_DIST = 160
const SPEED = 0.35

function rand(min, max) { return Math.random() * (max - min) + min }

export default function NeuralCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let nodes = [], raf, mouse = { x: -9999, y: -9999 }

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    function init() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: rand(0, canvas.width),
        y: rand(0, canvas.height),
        vx: rand(-SPEED, SPEED),
        vy: rand(-SPEED, SPEED),
        r: rand(1.5, 3),
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.sqrt(dx*dx + dy*dy)
          if (d < MAX_DIST) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            const alpha = (1 - d / MAX_DIST) * 0.12
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // mouse repulsion edges
      nodes.forEach(n => {
        const dx = n.x - mouse.x
        const dy = n.y - mouse.y
        const d = Math.sqrt(dx*dx + dy*dy)
        if (d < MAX_DIST * 1.4) {
          ctx.beginPath()
          ctx.moveTo(n.x, n.y)
          ctx.lineTo(mouse.x, mouse.y)
          const alpha = (1 - d / (MAX_DIST * 1.4)) * 0.12
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        }
      })

      // nodes
      nodes.forEach(n => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.fill()
      })
    }

    function update() {
      nodes.forEach(n => {
        // mouse repulsion
        const dx = n.x - mouse.x
        const dy = n.y - mouse.y
        const d = Math.sqrt(dx*dx + dy*dy)
        if (d < 120) {
          const force = (120 - d) / 120 * 0.8
          n.vx += (dx / d) * force
          n.vy += (dy / d) * force
        }

        // dampen
        n.vx *= 0.99
        n.vy *= 0.99

        // clamp speed
        const spd = Math.sqrt(n.vx*n.vx + n.vy*n.vy)
        if (spd > SPEED * 3) { n.vx = (n.vx/spd)*SPEED*3; n.vy = (n.vy/spd)*SPEED*3 }

        n.x += n.vx
        n.y += n.vy

        // wrap
        if (n.x < 0) n.x = canvas.width
        if (n.x > canvas.width) n.x = 0
        if (n.y < 0) n.y = canvas.height
        if (n.y > canvas.height) n.y = 0
      })
    }

    function loop() {
      update()
      draw()
      raf = requestAnimationFrame(loop)
    }

    function onMouse(e) {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    function onLeave() { mouse.x = -9999; mouse.y = -9999 }

    const ro = new ResizeObserver(() => { resize(); init() })
    ro.observe(canvas)
    resize()
    init()
    loop()
    canvas.addEventListener('mousemove', onMouse)
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMouse)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} style={{ width:'100%', height:'100%', display:'block' }} />
}