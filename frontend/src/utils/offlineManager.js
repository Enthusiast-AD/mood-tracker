/**
 * Offline Storage Manager - Day 4 PWA Enhanced
 * Author: Enthusiast-AD
 * Date: 2025-07-03 14:53:19 UTC
 */

class OfflineManager {
  constructor() {
    this.dbName = 'MentalHealthAI'
    this.dbVersion = 4
    this.db = null
    this.isOnline = navigator.onLine
    
    this.init()
    this.setupEventListeners()
  }

  async init() {
    try {
      this.db = await this.openDatabase()
      console.log('💾 Offline storage initialized')
    } catch (error) {
      console.error('❌ Failed to initialize offline storage:', error)
    }
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('🔌 Connection restored')
      this.syncAllData()
      this.notifyConnectionChange(true)
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('📱 Connection lost - switching to offline mode')
      this.notifyConnectionChange(false)
    })
  }

  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Offline mood entries store
        if (!db.objectStoreNames.contains('offlineMoods')) {
          const moodStore = db.createObjectStore('offlineMoods', { keyPath: 'id' })
          moodStore.createIndex('timestamp', 'timestamp', { unique: false })
          moodStore.createIndex('synced', 'synced', { unique: false })
        }

        // Cached mood history store
        if (!db.objectStoreNames.contains('moodHistory')) {
          const historyStore = db.createObjectStore('moodHistory', { keyPath: 'id' })
          historyStore.createIndex('userId', 'userId', { unique: false })
          historyStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        // User preferences store
        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'userId' })
        }

        // Analytics cache store
        if (!db.objectStoreNames.contains('analyticsCache')) {
          const analyticsStore = db.createObjectStore('analyticsCache', { keyPath: 'key' })
          analyticsStore.createIndex('expiresAt', 'expiresAt', { unique: false })
        }

        // Crisis resources store
        if (!db.objectStoreNames.contains('crisisResources')) {
          db.createObjectStore('crisisResources', { keyPath: 'id' })
        }

        console.log('🔄 Database schema updated')
      }
    })
  }

  // Save mood entry offline
  async saveMoodOffline(moodData, authToken) {
    try {
      const offlineMood = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...moodData,
        authToken,
        timestamp: new Date().toISOString(),
        synced: false,
        offline: true
      }

      const transaction = this.db.transaction(['offlineMoods'], 'readwrite')
      const store = transaction.objectStore('offlineMoods')
      await store.add(offlineMood)

      console.log('💾 Mood saved offline:', offlineMood.id)
      
      // Schedule background sync if service worker is available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register('mood-sync')
      }

      return offlineMood
    } catch (error) {
      console.error('❌ Failed to save mood offline:', error)
      throw error
    }
  }

  // Get all offline mood entries
  async getOfflineMoods() {
    try {
      const transaction = this.db.transaction(['offlineMoods'], 'readonly')
      const store = transaction.objectStore('offlineMoods')
      const request = store.getAll()

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('❌ Failed to get offline moods:', error)
      return []
    }
  }

  // Remove synced offline mood
  async removeOfflineMood(id) {
    try {
      const transaction = this.db.transaction(['offlineMoods'], 'readwrite')
      const store = transaction.objectStore('offlineMoods')
      await store.delete(id)
      
      console.log('✅ Removed synced offline mood:', id)
    } catch (error) {
      console.error('❌ Failed to remove offline mood:', error)
    }
  }

  // Cache mood history for offline access
  async cacheMoodHistory(moodHistory, userId) {
    try {
      const transaction = this.db.transaction(['moodHistory'], 'readwrite')
      const store = transaction.objectStore('moodHistory')

      // Clear existing history for this user
      const index = store.index('userId')
      const request = index.openCursor(IDBKeyRange.only(userId))
      
      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      // Add new history entries
      for (const entry of moodHistory) {
        await store.add({ ...entry, userId, cachedAt: new Date().toISOString() })
      }

      console.log('💾 Mood history cached offline:', moodHistory.length, 'entries')
    } catch (error) {
      console.error('❌ Failed to cache mood history:', error)
    }
  }

  // Get cached mood history
  async getCachedMoodHistory(userId) {
    try {
      const transaction = this.db.transaction(['moodHistory'], 'readonly')
      const store = transaction.objectStore('moodHistory')
      const index = store.index('userId')
      const request = index.getAll(userId)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const history = request.result.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          )
          resolve(history)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('❌ Failed to get cached mood history:', error)
      return []
    }
  }

  // Cache user preferences
  async cacheUserPreferences(preferences, userId) {
    try {
      const transaction = this.db.transaction(['userPreferences'], 'readwrite')
      const store = transaction.objectStore('userPreferences')
      
      await store.put({
        userId,
        preferences,
        cachedAt: new Date().toISOString()
      })

      console.log('💾 User preferences cached offline')
    } catch (error) {
      console.error('❌ Failed to cache user preferences:', error)
    }
  }

  // Get cached user preferences
  async getCachedUserPreferences(userId) {
    try {
      const transaction = this.db.transaction(['userPreferences'], 'readonly')
      const store = transaction.objectStore('userPreferences')
      const request = store.get(userId)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result
          resolve(result ? result.preferences : null)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('❌ Failed to get cached preferences:', error)
      return null
    }
  }

  // Cache analytics data
  async cacheAnalytics(analyticsData, key, expirationHours = 6) {
    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + expirationHours)

      const transaction = this.db.transaction(['analyticsCache'], 'readwrite')
      const store = transaction.objectStore('analyticsCache')
      
      await store.put({
        key,
        data: analyticsData,
        cachedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      })

      console.log('💾 Analytics cached offline:', key)
    } catch (error) {
      console.error('❌ Failed to cache analytics:', error)
    }
  }

  // Get cached analytics
  async getCachedAnalytics(key) {
    try {
      const transaction = this.db.transaction(['analyticsCache'], 'readonly')
      const store = transaction.objectStore('analyticsCache')
      const request = store.get(key)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result
          
          if (!result) {
            resolve(null)
            return
          }

          // Check if cache has expired
          const expiresAt = new Date(result.expiresAt)
          if (new Date() > expiresAt) {
            // Cache expired, remove it
            store.delete(key)
            resolve(null)
            return
          }

          resolve(result.data)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('❌ Failed to get cached analytics:', error)
      return null
    }
  }

  // Cache crisis resources
  async cacheCrisisResources(resources) {
    try {
      const transaction = this.db.transaction(['crisisResources'], 'readwrite')
      const store = transaction.objectStore('crisisResources')
      
      // Clear existing resources
      await store.clear()
      
      // Add new resources
      await store.put({
        id: 'crisis_resources',
        resources,
        cachedAt: new Date().toISOString()
      })

      console.log('💾 Crisis resources cached offline')
    } catch (error) {
      console.error('❌ Failed to cache crisis resources:', error)
    }
  }

  // Get cached crisis resources
  async getCachedCrisisResources() {
    try {
      const transaction = this.db.transaction(['crisisResources'], 'readonly')
      const store = transaction.objectStore('crisisResources')
      const request = store.get('crisis_resources')

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result
          resolve(result ? result.resources : null)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('❌ Failed to get cached crisis resources:', error)
      return null
    }
  }

  // Sync all offline data when connection is restored
  async syncAllData() {
    try {
      console.log('🔄 Starting data synchronization...')
      
      // Sync offline moods
      const offlineMoods = await this.getOfflineMoods()
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
            await this.removeOfflineMood(mood.id)
            syncedCount++
            console.log('✅ Synced offline mood:', mood.id)
          }
        } catch (error) {
          console.error('❌ Failed to sync mood:', mood.id, error)
        }
      }

      if (syncedCount > 0) {
        console.log(`✅ Synchronization complete: ${syncedCount} entries synced`)
        
        // Notify app about successful sync
        window.dispatchEvent(new CustomEvent('offlineDataSynced', {
          detail: { syncedMoods: syncedCount }
        }))
      }

    } catch (error) {
      console.error('❌ Data synchronization failed:', error)
    }
  }

  // Clean up expired cache entries
  async cleanupExpiredCache() {
    try {
      const transaction = this.db.transaction(['analyticsCache'], 'readwrite')
      const store = transaction.objectStore('analyticsCache')
      const index = store.index('expiresAt')
      
      const now = new Date().toISOString()
      const request = index.openCursor(IDBKeyRange.upperBound(now))

      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      console.log('🧹 Expired cache entries cleaned up')
    } catch (error) {
      console.error('❌ Failed to cleanup expired cache:', error)
    }
  }

  // Notify app about connection changes
  notifyConnectionChange(isOnline) {
    window.dispatchEvent(new CustomEvent('connectionChanged', {
      detail: { isOnline }
    }))
  }

  // Get storage usage statistics
  async getStorageStats() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        return {
          used: estimate.usage,
          quota: estimate.quota,
          usedPercentage: Math.round((estimate.usage / estimate.quota) * 100)
        }
      }
      return null
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error)
      return null
    }
  }

  // Clear all offline data (for privacy/reset)
  async clearAllData() {
    try {
      const transaction = this.db.transaction(['offlineMoods', 'moodHistory', 'userPreferences', 'analyticsCache', 'crisisResources'], 'readwrite')
      
      const stores = ['offlineMoods', 'moodHistory', 'userPreferences', 'analyticsCache', 'crisisResources']
      
      for (const storeName of stores) {
        const store = transaction.objectStore(storeName)
        await store.clear()
      }

      console.log('🗑️ All offline data cleared')
    } catch (error) {
      console.error('❌ Failed to clear offline data:', error)
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      effectiveType: navigator.connection?.effectiveType || 'unknown',
      downlink: navigator.connection?.downlink || 0,
      rtt: navigator.connection?.rtt || 0
    }
  }
}

// Create singleton instance
const offlineManager = new OfflineManager()

export default offlineManager