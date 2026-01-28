import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/super-insect-battle/' : '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@super-insect-battle/engine'],
  },
})
