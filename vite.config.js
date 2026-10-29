import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // `npm run dev` for trying changes before they're committed: reachable from other
  // devices on the network, with Mealie and the bike bridge going through the deployed
  // FitPad's nginx, which adds their keys, so the dev server never needs them
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      '/mealie': 'http://localhost:8080',
      '/bike': 'http://localhost:8080',
    },
  },
})
