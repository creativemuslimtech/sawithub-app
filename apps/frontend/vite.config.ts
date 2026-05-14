import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const trialDays = env.VITE_SUBSCRIPTION_TRIAL_DAYS ?? '14'

  return {
    plugins: [
      react(),
      {
        name: 'inject-index-copy',
        transformIndexHtml(html) {
          return html.replace(/__SUBSCRIPTION_TRIAL_DAYS__/g, trialDays)
        },
      },
    ],
    build: {
    // Safer than default “modules” for older mobile Safari / WebViews still in the wild.
    target: 'es2020',
    chunkSizeWarningLimit: 2000,
    // Fewer parallel chunk loads helps flaky mobile networks / strict browsers.
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          // Keep the anonymous landing path light. A catch-all vendor chunk makes
          // the public entry wait for heavy authenticated-page libraries
          // (recharts/xlsx/jsPDF/etc.) before React can render on mobile.
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('react') || id.includes('scheduler')) return 'vendor-react'
          if (id.includes('axios')) return 'vendor-axios'
          // Let route-only heavy dependencies stay with their lazy route chunks;
          // forcing them into named shared chunks can make the public entry import
          // their helper code eagerly.
        },
      },
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
  }
})
