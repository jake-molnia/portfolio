'use client'

import { usePageParticles } from '@/components/ParticleProvider'

// Page-specific particle configuration
const homePageConfig = {
  particles: {
    count: 80,
    colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
    sizeRange: [1, 4] as [number, number],
    speedRange: [0.5, 1.5] as [number, number],
    whiteRatio: 0.8
  },
  interactions: [
    {
      selector: 'h1',
      type: 'attract' as const,
      radius: 150,
      strength: 0.8
    },
    {
      selector: '.hero-description',
      type: 'orbit' as const,
      radius: 100,
      strength: 0.4
    },
    {
      selector: '.cta-button',
      type: 'repel' as const,
      radius: 80,
      strength: 0.6
    }
  ]
}

export default function HomePage() {
  usePageParticles(homePageConfig)

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-4xl mx-auto pt-20">
        <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
          Welcome to My Portfolio
        </h1>
      </div>
    </div>
  )
}
