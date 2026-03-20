import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true, // ngrok / トンネル経由のアクセスを許可
    proxy: {
      // スマホ(ngrok) → Vite → ここで Rails(3000) に中継
      // ngrok は Vite(5174) だけトンネルすれば OK
      '/cable': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
