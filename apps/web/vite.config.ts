import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { inkWebPlugin } from 'ink-web/vite'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/super-insect-battle/' : '/',
  plugins: [react(), inkWebPlugin()],
  optimizeDeps: {
    exclude: ['@super-insect-battle/ui', '@super-insect-battle/engine'],
  },
})
