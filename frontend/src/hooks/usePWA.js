/**
 * PWA Integration Hook - Day 4 Enhanced
 * Author: Enthusiast-AD
 * Date: 2025-07-03 14:56:38 UTC
 */

import { useState, useEffect, useCallback } from 'react'
import notificationManager from '../utils/notificationManager'
import offlineManager from '../utils/offlineManager'

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false)
  const [storageStats, setStorageStats] = useState(null)

  useEffect(() => {
    // Check if app is installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone ||
                        document.referrer.includes('android-app://')
    setIsInstalled(isStandalone)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsInstallable(true)
    }

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setInstallPrompt(null)
    }

    // Listen for connection changes
    const handleConnectionChange = (event) => {
      setIsOnline(event.detail.isOnline)
    }

    // Listen for service worker updates
    const handleSwUpdate = () => {
      setSwUpdateAvailable(true)
    }

    // Setup event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('connectionChanged', handleConnectionChange)
    window.addEventListener('swUpdateAvailable', handleSwUpdate)

    // Load storage stats
    loadStorageStats()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('connectionChanged', handleConnectionChange)
      window.removeEventListener('swUpdateAvailable', handleSwUpdate)
    }
  }, [])

  const loadStorageStats = useCallback(async () => {
    const stats = await offlineManager.getStorageStats()
    setStorageStats(stats)
  }, [])

  const installApp = useCallback(async () => {
    if (!installPrompt) return false

    try {
      const result = await installPrompt.prompt()
      if (result.outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setInstallPrompt(null)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to install app:', error)
      return false
    }
  }, [installPrompt])

  const requestNotificationPermission = useCallback(async () => {
    try {
      const granted = await notificationManager.requestPermission()
      setNotificationPermission(granted ? 'granted' : 'denied')
      return granted
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }, [])

  const subscribeToNotifications = useCallback(async () => {
    try {
      await notificationManager.subscribe()
      return true
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error)
      return false
    }
  }, [])

  const unsubscribeFromNotifications = useCallback(async () => {
    try {
      await notificationManager.unsubscribe()
      return true
    } catch (error) {
      console.error('Failed to unsubscribe from notifications:', error)
      return false
    }
  }, [])

  const updateServiceWorker = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        await registration.update()
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to update service worker:', error)
    }
  }, [])

  const clearOfflineData = useCallback(async () => {
    try {
      await offlineManager.clearAllData()
      await loadStorageStats()
      return true
    } catch (error) {
      console.error('Failed to clear offline data:', error)
      return false
    }
  }, [loadStorageStats])

  return {
    // State
    isInstallable,
    isInstalled,
    isOnline,
    notificationPermission,
    swUpdateAvailable,
    storageStats,
    
    // Actions
    installApp,
    requestNotificationPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    updateServiceWorker,
    clearOfflineData,
    loadStorageStats,
    
    // Utilities
    connectionStatus: offlineManager.getConnectionStatus(),
    notificationSettings: notificationManager.getSettings()
  }
}