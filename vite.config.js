import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Strip legacy font formats (woff, ttf) from KaTeX - modern browsers only need woff2
function stripLegacyFonts() {
  return {
    name: 'strip-legacy-fonts',
    generateBundle(_, bundle) {
      for (const key of Object.keys(bundle)) {
        if (/KaTeX.*\.(woff|ttf)$/.test(key)) {
          delete bundle[key]
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), stripLegacyFonts()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          katex: ['katex'],
          marked: ['marked'],
        },
      },
    },
  },
})
