/**
 * Enhanced Service Worker - Day 4 PWA Advanced
 * Author: Enthusiast-AD
 * Date: 2025-07-03 14:53:19 UTC
 * Features: Intelligent caching, background sync, push notifications
 */

const CACHE_NAME = 'mental-health-ai-v4.0.0'
const STATIC_CACHE = 'static-v4.0.0'
const DYNAMIC_CACHE = 'dynamic-v4.0.0'
const API_CACHE = 'api-v4.0.0'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/auth/login',
  '/auth/register',
  '/mood-check',
  '/dashboard',
  '/crisis-support'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/crisis/resources',
  '/api/auth/preferences'
]

// Background sync tags
const SYNC_TAGS = {
  MOOD_SYNC: 'mood-sync',
  ANALYTICS_SYNC: 'analytics-sync',
  PREFERENCES_SYNC: 'preferences-sync'
}

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      
      // Cache API endpoints
      caches.open(API_CACHE).then(cache => {
        console.log('📦 Caching API endpoints')
        return Promise.all(
          API_ENDPOINTS.map(endpoint => 
            fetch(endpoint)
              .then(response => cache.put(endpoint, response))
              .catch(err => console.log(`Failed to cache ${endpoint}:`, err))
          )
        )
      })
    ]).then(() => {
      console.log('✅ Service Worker installed successfully')
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activated successfully')
    })
  )
})

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }
  
  // API requests - Network First with Cache Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }
  
  // Static assets - Cache First
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
    event.respondWith(handleStaticRequest(request))
    return
  }
  
  // Dynamic content - Network First with Cache Fallback
  event.respondWith(handleDynamicRequest(request))
})

// Handle API requests with intelligent caching
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Try network first
    const networkResponse = await fetch(request.clone())
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      
      // Cache specific endpoints for offline access
      if (url.pathname.includes('/crisis/resources') ||
          url.pathname.includes('/auth/preferences') ||
          url.pathname.includes('/mood/history')) {
        cache.put(request, networkResponse.clone())
      }
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('🔄 Network failed, trying cache for:', url.pathname)
    
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      console.log('✅ Serving from cache:', url.pathname)
      return cachedResponse
    }
    
    // Return offline fallback for critical endpoints
    if (url.pathname.includes('/crisis/resources')) {
      return new Response(JSON.stringify({
        immediate_help: [
          {
            name: "National Suicide Prevention Lifeline",
            phone: "988",
            available: "24/7",
            description: "Free confidential emotional support"
          }
        ],
        offline: true
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    throw error
  }
}

// Handle static requests - Cache First
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    const cache = await caches.open(STATIC_CACHE)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    console.log('❌ Failed to fetch static asset:', request.url)
    throw error
  }
}

// Handle dynamic requests - Network First with Cache Fallback
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('🔄 Network failed, trying cache for:', request.url)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline fallback page
    return caches.match('/') || new Response('Offline', { status: 503 })
  }
}

// Background Sync - Handle offline mood tracking
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag)
  
  switch (event.tag) {
    case SYNC_TAGS.MOOD_SYNC:
      event.waitUntil(syncOfflineMoods())
      break
    case SYNC_TAGS.ANALYTICS_SYNC:
      event.waitUntil(syncAnalytics())
      break
    case SYNC_TAGS.PREFERENCES_SYNC:
      event.waitUntil(syncPreferences())
      break
  }
})

// Sync offline mood entries
async function syncOfflineMoods() {
  try {
    console.log('📊 Syncing offline mood entries...')
    
    // Get offline moods from IndexedDB
    const offlineMoods = await getOfflineMoods()
    
    if (offlineMoods.length === 0) {
      console.log('✅ No offline moods to sync')
      return
    }
    
    let syncedCount = 0
    
    for (const mood of offlineMoods) {
      try {
        const response = await fetch('/api/mood/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mood.authToken}`
          },
          body: JSON.stringify({
            score: mood.score,
            emotions: mood.emotions,
            notes: mood.notes,
            activity: mood.activity,
            location: mood.location,
            weather: mood.weather
          })
        })
        
        if (response.ok) {
          await removeOfflineMood(mood.id)
          syncedCount++
          console.log('✅ Synced offline mood:', mood.id)
        }
        
      } catch (error) {
        console.error('❌ Failed to sync mood:', mood.id, error)
      }
    }
    
    if (syncedCount > 0) {
      // Notify all clients about successful sync
      const clients = await self.clients.matchAll()
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          data: { syncedMoods: syncedCount }
        })
      })
    }
    
  } catch (error) {
    console.error('❌ Background sync failed:', error)
  }
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('📬 Push notification received')
  
  const options = {
    body: 'How are you feeling today? Track your mood for personalized insights.',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/mood-check',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'track-mood',
        title: '📝 Track Mood',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: '✕ Dismiss'
      }
    ]
  }
  
  if (event.data) {
    const payload = event.data.json()
    options.body = payload.body || options.body
    options.data = { ...options.data, ...payload.data }
  }
  
  event.waitUntil(
    self.registration.showNotification('🧠 Mental Health AI', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.action)
  
  event.notification.close()
  
  let targetUrl = '/'
  
  switch (event.action) {
    case 'track-mood':
      targetUrl = '/mood-check'
      break
    case 'dismiss':
      return // Just close the notification
    default:
      targetUrl = event.notification.data?.url || '/dashboard'
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

// IndexedDB operations for offline storage
async function getOfflineMoods() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MentalHealthAI', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['offlineMoods'], 'readonly')
      const store = transaction.objectStore('offlineMoods')
      const getAllRequest = store.getAll()
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result)
      getAllRequest.onerror = () => reject(getAllRequest.error)
    }
    
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('offlineMoods')) {
        db.createObjectStore('offlineMoods', { keyPath: 'id' })
      }
    }
  })
}

async function removeOfflineMood(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MentalHealthAI', 1)
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['offlineMoods'], 'readwrite')
      const store = transaction.objectStore('offlineMoods')
      const deleteRequest = store.delete(id)
      
      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => reject(deleteRequest.error)
    }
  })
}

// Message handling for client communication
self.addEventListener('message', event => {
  console.log('📨 Message received:', event.data)
  
  switch (event.data.type) {
    case 'SCHEDULE_SYNC':
      // Schedule background sync
      self.registration.sync.register(event.data.tag)
      break
    
    case 'CACHE_MOOD':
      // Cache mood entry for offline access
      event.waitUntil(cacheMoodEntry(event.data.mood))
      break
  }
})

async function cacheMoodEntry(mood) {
  try {
    const request = indexedDB.open('MentalHealthAI', 1)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['offlineMoods'], 'readwrite')
      const store = transaction.objectStore('offlineMoods')
      store.add({ ...mood, id: Date.now() })
    }
  } catch (error) {
    console.error('Failed to cache mood entry:', error)
  }
}

console.log('🚀 Enhanced Service Worker loaded - Mental Health AI v4.0.0')