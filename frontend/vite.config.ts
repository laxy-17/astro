import path from "path"
import { fileURLToPath } from "url"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/chart': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/charts': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/insights': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/mentor': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      }
    }
  }
})
