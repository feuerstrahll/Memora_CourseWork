import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Bind to all interfaces for Docker
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:3000', // Use Docker service name
        changeOrigin: true,
      },
    },
  },
})

