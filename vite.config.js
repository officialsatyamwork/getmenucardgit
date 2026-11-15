import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // 127.0.0.1 avoids Windows localhost → IPv6 (::1) ECONNREFUSED noise
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            console.warn(`[api] backend unreachable (${err.code || err.message}). Is it running on :4000?`)
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Backend unavailable' }))
            }
          })
        },
      },
    },
  },
})
