import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) return 'vendor'
            if (id.includes('react-router')) return 'router'
            if (id.includes('@supabase')) return 'supabase'
            if (id.includes('framer-motion') || id.includes('gsap')) return 'animation'
            if (id.includes('lucide-react') || id.includes('zustand')) return 'ui'
          }
        },
      },
    },
  },
})
