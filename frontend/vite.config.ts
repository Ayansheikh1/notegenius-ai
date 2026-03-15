import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ─────────────────────────────────────────────────────────────────────────────
// Vite config — NoteGenius AI
//
// Dev proxy routes:
//   /groq/*  → https://api.groq.com/*   (avoids CORS for local dev)
//   /api/*   → VITE_API_URL             (AWS API Gateway in production)
// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3000,
    proxy: {
      // Groq proxy — routes /groq/... → https://api.groq.com/...
      '/groq': {
        target: 'https://api.groq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/groq/, ''),
        secure: true,
      },
      // AWS Lambda proxy (production)
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: { outDir:'dist', sourcemap:true },
})
