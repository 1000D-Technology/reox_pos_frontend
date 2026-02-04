import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Use relative paths for Electron
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
        output: {
            manualChunks: {
                vendor: ['react', 'react-dom'],
                ui: ['lucide-react', 'framer-motion'],
                utils: ['xlsx', 'jspdf', 'html2canvas']
            }
        }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: '127.0.0.1',
  },
})
