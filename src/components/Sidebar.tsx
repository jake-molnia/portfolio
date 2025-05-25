'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Projects', href: '/projects' },
  { name: 'Experience', href: '/experience' },
  { name: 'Contact', href: '/contact' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div 
      className="fixed left-0 top-0 w-[280px] h-full bg-gradient-to-b from-dark-700 to-dark-800 border-r border-dark-600 p-6 z-20"
      data-particle-interaction="flow-around"
      data-particle-radius="50"
      data-particle-strength="0.3"
    >
      {/* Logo/Title */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Portfolio
        </h2>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
              data-particle-interaction={isActive ? "attract" : "none"}
              data-particle-radius="60"
              data-particle-strength="0.4"
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Accent */}
      <div className="absolute bottom-8 left-6 right-6">
        <div className="h-px bg-gradient-to-r from-transparent via-dark-500 to-transparent"></div>
      </div>
    </div>
  )
}
