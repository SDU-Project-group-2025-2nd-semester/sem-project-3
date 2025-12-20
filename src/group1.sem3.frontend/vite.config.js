import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            "@app": "/src/app",
            "@features": "/src/features",
            "@shared": "/src/shared",
            "@assets": "/src/assets"
        }
    }

})
