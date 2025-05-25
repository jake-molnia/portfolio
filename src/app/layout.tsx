import './globals.css'
import type { Metadata } from 'next'
import { ParticleProvider } from '@/components/ParticleProvider'
import Sidebar from '@/components/Sidebar'

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
        <ParticleProvider>
          <div className="sidebar">
            {/* Sidebar */}
            <Sidebar />
                    </div>
            
            {/* Main Content */}
        <div className="main-content">
          {children}
        </div>
        </ParticleProvider>
      </body>
    </html>
  )
}