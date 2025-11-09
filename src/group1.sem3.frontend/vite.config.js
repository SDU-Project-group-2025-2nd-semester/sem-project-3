import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '172.29.154.109',
    // host: '0.0.0.0',
    port: 5173
  }
})
