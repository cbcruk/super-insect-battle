import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { inkWebPlugin } from 'ink-web/vite'

export default defineConfig({
  plugins: [react(), inkWebPlugin()],
  optimizeDeps: {
    exclude: ['@super-insect-battle/ui', '@super-insect-battle/engine'],
  },
})
