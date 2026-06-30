import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/super-insect-battle/' : '/',
  optimizeDeps: {
    exclude: ['@super-insect-battle/engine'],
  },
})
