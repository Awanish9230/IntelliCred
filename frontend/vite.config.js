import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process',
      stream: 'stream-browserify',
      path: 'path-browserify',
      util: 'util',
      events: 'events',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'util', 'stream-browserify', 'path-browserify', 'events'],
  },
  define: {
    global: 'window',
    'process.env': {}
  }
})
