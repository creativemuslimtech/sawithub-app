import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:8000'

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['sawit-hero.png', 'icons/icon.svg'],
        manifest: {
          name: 'SawitHub - Manajemen Kebun Sawit',
          short_name: 'SawitHub',
          description: 'Aplikasi manajemen kebun kelapa sawit',
          theme_color: '#1e0050',
          background_color: '#111827',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /^\/api\/.*/i,
              handler: 'NetworkFirst',
              options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 300 } },
            },
          ],
        },
      }),
    ],
    build: {
      chunkSizeWarningLimit: 2000,
      modulePreload: {
        // Keep PDF/canvas libs fully on-demand (only when user exports PDF)
        resolveDependencies: (_url, deps) =>
          deps.filter((dep) => !dep.includes('vendor-jspdf') && !dep.includes('vendor-html2canvas')),
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('html2canvas')) return 'vendor-html2canvas'
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('dompurify')) return 'vendor-dompurify'
            if (id.includes('jspdf')) return 'vendor-jspdf'
            if (id.includes('react') || id.includes('scheduler')) return 'vendor-react'
            return 'vendor'
          },
        },
      },
    },
    server: {
      host: true,
      proxy: {
        '/api': { target: apiProxyTarget, changeOrigin: true },
      },
    },
  }
})
