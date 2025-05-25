'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'

// ==================== TYPES ====================

interface ParticleConfig {
  count?: number
  colors?: string[]
  sizeRange?: [number, number]
  speedRange?: [number, number]
  whiteRatio?: number
}

interface ContentInteraction {
  type?: 'attract' | 'repel' | 'orbit' | 'flow-around' | 'none'
  radius?: number
  strength?: number
  selector?: string
}

interface PageConfig {
  particles?: ParticleConfig
  interactions?: ContentInteraction[]
  background?: string
}

// Default configurations
const DEFAULT_PARTICLE_CONFIG: ParticleConfig = {
  count: 60,
  colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
  sizeRange: [1, 3],
  speedRange: [0.3, 1.2],
  whiteRatio: 0.85
}

const DEFAULT_PAGE_CONFIG: PageConfig = {
  particles: DEFAULT_PARTICLE_CONFIG,
  background: '#0a0a0a',
  interactions: []
}

// ==================== PARTICLE ENGINE ====================

class UniversalParticleEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: any[] = []
  private config: PageConfig
  private animationId: number | null = null
  private interactionElements: { element: Element, config: ContentInteraction }[] = []

  constructor(canvas: HTMLCanvasElement, config: PageConfig) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.config = { ...DEFAULT_PAGE_CONFIG, ...config }
    
    this.setupCanvas()
    this.initializeParticles()
    this.setupEventListeners()
    this.scanForInteractionElements()
  }

  private setupCanvas() {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    
    this.canvas.width = window.innerWidth * dpr
    this.canvas.height = window.innerHeight * dpr
    this.ctx.scale(dpr, dpr)
    
    // Make canvas fill the entire viewport as background
    this.canvas.style.width = '100vw'
    this.canvas.style.height = '100vh'
    this.canvas.style.position = 'fixed'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.zIndex = '-1'
    this.canvas.style.pointerEvents = 'none'
  }

  private initializeParticles() {
    const config = this.config.particles!
    this.particles = []
    
    for (let i = 0; i < config.count!; i++) {
      const isWhite = Math.random() < config.whiteRatio!
      const color = isWhite ? 'rgba(255, 255, 255, 0.8)' : 
                   config.colors![Math.floor(Math.random() * config.colors!.length)]
      
      const size = config.sizeRange![0] + Math.random() * (config.sizeRange![1] - config.sizeRange![0])
      const speed = config.speedRange![0] + Math.random() * (config.speedRange![1] - config.speedRange![0])
      const angle = Math.random() * Math.PI * 2
      
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        color,
        opacity: 0.4 + Math.random() * 0.3
      })
    }
  }

  private scanForInteractionElements() {
    this.interactionElements = []
    
    // Scan for elements with data-particle-* attributes
    const elements = document.querySelectorAll('[data-particle-interaction]')
    elements.forEach(element => {
      const interactionType = element.getAttribute('data-particle-interaction') as any
      const radius = parseInt(element.getAttribute('data-particle-radius') || '100')
      const strength = parseFloat(element.getAttribute('data-particle-strength') || '0.5')
      
      if (interactionType !== 'none') {
        this.interactionElements.push({
          element,
          config: { type: interactionType, radius, strength }
        })
      }
    })

    // Also scan for configured selectors
    if (this.config.interactions) {
      this.config.interactions.forEach(interaction => {
        if (interaction.selector) {
          const elements = document.querySelectorAll(interaction.selector)
          elements.forEach(element => {
            this.interactionElements.push({ element, config: interaction })
          })
        }
      })
    }
  }

  private updateParticles() {
    for (const particle of this.particles) {
      // Apply interactions from DOM elements
      this.interactionElements.forEach(({ element, config }) => {
        const rect = element.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        const dx = particle.x - centerX
        const dy = particle.y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < (config.radius || 100)) {
          const force = ((config.radius || 100) - distance) / (config.radius || 100) * (config.strength || 0.5)
          
          switch (config.type) {
            case 'attract':
              particle.vx += -dx * force * 0.001
              particle.vy += -dy * force * 0.001
              break
            case 'repel':
              particle.vx += dx * force * 0.001
              particle.vy += dy * force * 0.001
              break
            case 'orbit':
              const perpX = -dy / distance
              const perpY = dx / distance
              particle.vx += perpX * force * 0.001
              particle.vy += perpY * force * 0.001
              break
            case 'flow-around':
              const flowStrength = force * 0.0005
              if (Math.abs(dx) > Math.abs(dy)) {
                particle.vy += dy > 0 ? flowStrength : -flowStrength
              } else {
                particle.vx += dx > 0 ? flowStrength : -flowStrength
              }
              break
          }
        }
      })
      
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy
      particle.rotation += particle.rotationSpeed
      
      // Boundary wrapping
      if (particle.x < -10) particle.x = window.innerWidth + 10
      if (particle.x > window.innerWidth + 10) particle.x = -10
      if (particle.y < -10) particle.y = window.innerHeight + 10
      if (particle.y > window.innerHeight + 10) particle.y = -10
    }
  }

  private render() {
    // Clear canvas with background color
    this.ctx.fillStyle = this.config.background || '#0a0a0a'
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
    
    // Update and render particles
    this.updateParticles()
    
    for (const particle of this.particles) {
      this.ctx.save()
      this.ctx.globalAlpha = particle.opacity
      this.ctx.translate(particle.x, particle.y)
      this.ctx.rotate(particle.rotation)
      this.ctx.fillStyle = particle.color
      this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
      this.ctx.restore()
    }
  }

  private setupEventListeners() {
    window.addEventListener('resize', () => {
      this.setupCanvas()
    })
  }

  public start() {
    const animate = () => {
      this.render()
      this.animationId = requestAnimationFrame(animate)
    }
    animate()
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  public updateConfig(config: PageConfig) {
    this.config = { ...this.config, ...config }
    this.initializeParticles()
    this.scanForInteractionElements()
  }

  public rescan() {
    this.scanForInteractionElements()
  }
}

// ==================== CONTEXT ====================

interface ParticleContextType {
  engine: UniversalParticleEngine | null
  updateConfig: (config: PageConfig) => void
  rescan: () => void
}

const ParticleContext = createContext<ParticleContextType | null>(null)

export function ParticleProvider({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<UniversalParticleEngine | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    engineRef.current = new UniversalParticleEngine(canvasRef.current, DEFAULT_PAGE_CONFIG)
    engineRef.current.start()

    return () => {
      if (engineRef.current) {
        engineRef.current.stop()
      }
    }
  }, [])

  const updateConfig = (config: PageConfig) => {
    if (engineRef.current) {
      engineRef.current.updateConfig(config)
    }
  }

  const rescan = () => {
    if (engineRef.current) {
      engineRef.current.rescan()
    }
  }

  return (
    <ParticleContext.Provider value={{ engine: engineRef.current, updateConfig, rescan }}>
      {/* Canvas Background - Fixed behind everything */}
      <canvas ref={canvasRef} />
      
      {/* All HTML content renders normally on top */}
      {children}
    </ParticleContext.Provider>
  )
}

export function useParticles() {
  const context = useContext(ParticleContext)
  if (!context) {
    throw new Error('useParticles must be used within ParticleProvider')
  }
  return context
}

// ==================== HOOK FOR PAGES ====================

export function usePageParticles(config: PageConfig) {
  const { updateConfig, rescan } = useParticles()

  useEffect(() => {
    updateConfig(config)
    
    // Rescan after DOM updates
    const timer = setTimeout(() => rescan(), 100)
    
    return () => clearTimeout(timer)
  }, [updateConfig, rescan])
}