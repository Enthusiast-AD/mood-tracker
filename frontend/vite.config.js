import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      react({
        fastRefresh: !isProduction,
        jsxRuntime: 'automatic'
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'icon-*.png'],
        manifest: {
          name: 'Mental Health AI - Mood Tracker',
          short_name: 'MoodTracker AI',
          description: 'AI-powered mood tracking and mental health support with offline capabilities',
          theme_color: '#3b82f6',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/?utm_source=pwa',
          lang: 'en-US',
          categories: ['health', 'medical', 'lifestyle', 'productivity'],
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          shortcuts: [
            {
              name: 'Track Mood',
              short_name: 'Track',
              description: 'Quickly track your current mood',
              url: '/mood-check?utm_source=pwa_shortcut',
              icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'View Dashboard',
              short_name: 'Dashboard', 
              description: 'View your mood analytics',
              url: '/dashboard?utm_source=pwa_shortcut',
              icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'Crisis Support',
              short_name: 'Help',
              description: 'Access crisis support resources',
              url: '/crisis-support?utm_source=pwa_shortcut',
              icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,eot}'],
          runtimeCaching: [
            {
              urlPattern: /^https?:\/\/.*\/api\/.*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                cacheableResponse: {
                  statuses: [0, 200]
                },
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: !isProduction
        }
      })
    ],
    
    build: {
      target: 'es2015',
      minify: isProduction ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            auth: ['./src/contexts/AuthContext'],
            mood: ['./src/contexts/MoodContext']
          }
        }
      },
      sourcemap: !isProduction
    },
    
    server: {
      port: 3000,
      host: true,
      open: true
    },
    
    preview: {
      port: 3001,
      host: true
    },
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@contexts': resolve(__dirname, 'src/contexts'),
        '@hooks': resolve(__dirname, 'src/hooks')
      }
    },
    
    define: {
      __APP_VERSION__: JSON.stringify('4.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __BUILD_COMMIT__: JSON.stringify('dev')
    }
  }
})