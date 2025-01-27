import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      host: true,
      strictPort: true,
      port: 5173,
      watch: {
        usePolling: true
      }
    },
    define: {
      // Enable env variables
      '__VITE_GCLIENT_ID__': `"${env.VITE_GCLIENT_ID}"`,
      '__VITE_CLIENT_ID__': `"${env.VITE_CLIENT_ID}"`,
      '__VITE_HOST_URL__': `"${env.VITE_HOST_URL}"`,
      '__VITE_WEBSOCKET_URL__': `"${env.VITE_WEBSOCKET_URL}"`
    }
  }
})