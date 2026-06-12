import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // GitHub Pages: https://github.com/Paul734734/CouturePro => repo name = CouturePro
  // Ajuste si tu changes le nom du repo.
  base: '/CouturePro/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

