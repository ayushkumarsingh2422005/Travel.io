import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    allowedHosts: ['proud-garlics-burn.loca.lt', 'fc1fe24121d826.lhr.life', '2be3a112d2b43f.lhr.life', 'predict-defense-dust-economics.trycloudflare.com']
  }
})
