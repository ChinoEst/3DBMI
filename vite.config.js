import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['web-ifc'],
    include: ['@thatopen/fragments', '@thatopen/components']
  },
  build: {
    target: 'esnext'
  }
})
