import { defineConfig } from 'vite'
import react from '@vitejs/react-vite'
import tailwindcss from '@tailwindcss/vite' // 1. Import the plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Add it to the plugins array
  ],
})