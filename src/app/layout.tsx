import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Modern Portfolio Website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Sidebar - Fixed Left */}
        <div className="sidebar">
          <h2>Portfolio</h2>
          <nav>
            <a href="/" className="active">
              <span>Home</span>
            </a>
            <a href="/about">
              <span>About</span>
            </a>
            <a href="/projects">
              <span>Projects</span>
            </a>
            <a href="/experience">
              <span>Experience</span>
            </a>
            <a href="/contact">
              <span>Contact</span>
            </a>
          </nav>
          
          {/* Bottom section with subtle accent */}
          <div className="absolute bottom-8 left-6 right-6">
            <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-6"></div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="main-content">
          {children}
        </div>
      </body>
    </html>
  )
}