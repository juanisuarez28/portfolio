import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        // three.js + ecosistema R3F en un chunk propio: cambia poco y queda cacheado entre deploys.
        // Se carga en lazy junto con la escena, así el loader aparece al instante.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (/three|@react-three|postprocessing|n8ao|camera-controls|maath|troika/.test(id)) return 'vendor-3d'
        },
      },
    },
  },
})
