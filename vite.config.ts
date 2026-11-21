import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: 'auto',
        includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon-180x180.png'],
        manifest: {
          name: 'MindCare',
          short_name: 'MindCare',
          description:
            'Ứng dụng chăm sóc sức khỏe tinh thần và đồng hành cảm xúc an toàn, riêng tư dành cho sinh viên.',
          lang: 'vi',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#FAF7EE',
          theme_color: '#1F5C43',
          icons: [
            {
              src: '/icons/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Precache only the static application shell & icons (no large unused reference assets or user data)
          globPatterns: ['**/*.{js,css,html,svg,woff2}', 'icons/*.png'],
          cleanupOutdatedCaches: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              // Static Google Fonts stylesheets
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              // Static Google Fonts font files
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                cacheableResponse: {
                  statuses: [0, 200],
                },
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
            {
              // Same-origin static mascot/artwork assets only; never cache API or user data
              urlPattern: ({sameOrigin, request, url}) =>
                sameOrigin &&
                request.method === 'GET' &&
                !url.pathname.startsWith('/api/') &&
                /\.(?:png|jpg|jpeg|gif|webp|svg)$/i.test(url.pathname),
              handler: 'CacheFirst',
              options: {
                cacheName: 'mindcare-static-images',
                cacheableResponse: {
                  statuses: [200],
                },
                expiration: {
                  maxEntries: 80,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
