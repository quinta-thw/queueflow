import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Strip trailing /api to get the bare server origin for the proxy target
  const backendOrigin = (env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api$/, '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
      watch: {
        // Ignore large/locked media files on Windows
        ignored: ['**/public/videos/**'],
      },
    },
  }
})
