import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  base: '/vuihoctiengtrung/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: resolve(process.cwd(), 'index.source.html'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
