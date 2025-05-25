import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'My Portfolio Website',
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
          <h2>My Portfolio</h2>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/projects">Projects</a>
            <a href="/contact">Contact</a>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="main-content">
          {children}
        </div>
      </body>
    </html>
  )
}