/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sf-pro': ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        'sf-mono': ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      colors: {
        dark: {
          900: '#0a0a0a',
          800: '#141414',
          700: '#1a1a1a',
          600: '#262626',
          500: '#404040',
        },
        primary: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        }
      },
      animation: {
        'background-move': 'backgroundMove 20s linear infinite',
        'light-pulse': 'lightPulse 3s ease-in-out infinite alternate',
        'text-shimmer': 'textShimmer 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 1s ease-out',
        'pixel-dance': 'pixelDance 4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        backgroundMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(20px, 20px)' },
        },
        lightPulse: {
          '0%': { opacity: '0.3', transform: 'scaleX(1)' },
          '100%': { opacity: '0.8', transform: 'scaleX(1.5)' },
        },
        textShimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pixelDance: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.1) rotate(90deg)' },
          '50%': { transform: 'scale(0.9) rotate(180deg)' },
          '75%': { transform: 'scale(1.05) rotate(270deg)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 5px rgba(255, 255, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.3)' },
        },
      },
      backgroundImage: {
        'pixel-pattern': `
          radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px),
          radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'pixel': '20px 20px, 40px 40px',
      },
      backgroundPosition: {
        'pixel': '0 0, 10px 10px',
      },
    },
  },
  plugins: [],
}