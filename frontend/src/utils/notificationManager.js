/**
 * Push Notification Manager - Day 4 PWA Enhanced (Fixed)
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:23:48 UTC
 */

class NotificationManager {
  constructor() {
    this.swRegistration = null
    this.permission = Notification.permission
    // Fix: Use import.meta.env instead of process.env for Vite
    this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'demo-key'
    
    this.init()
  }

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.ready
        console.log('🔔 Notification Manager initialized')
      } catch (error) {
        console.error('❌ Failed to initialize notification manager:', error)
      }
    }
  }

  // Check if notifications are supported
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error('Notifications not supported')
    }

    if (this.permission === 'granted') {
      return true
    }

    if (this.permission === 'denied') {
      throw new Error('Notifications are blocked. Please enable them in browser settings.')
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted')
        return true
      } else {
        throw new Error('Notification permission denied')
      }
    } catch (error) {
      console.error('❌ Failed to request notification permission:', error)
      throw error
    }
  }

  // Subscribe to push notifications
  async subscribe() {
    if (!this.swRegistration) {
      throw new Error('Service Worker not available')
    }

    try {
      // Check if already subscribed
      let subscription = await this.swRegistration.pushManager.getSubscription()
      
      if (!subscription) {
        // Create new subscription
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        })
        
        console.log('📬 Push subscription created')
      } else {
        console.log('📬 Using existing push subscription')
      }

      // Send subscription to server (if backend supports it)
      await this.sendSubscriptionToServer(subscription)
      
      return subscription
      
    } catch (error) {
      console.error('❌ Failed to subscribe to push notifications:', error)
      throw error
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (!this.swRegistration) {
      return false
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        console.log('📭 Unsubscribed from push notifications')
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Failed to unsubscribe:', error)
      return false
    }
  }

  // Schedule mood reminder notifications
  scheduleMoodReminders(preferences = {}) {
    const {
      enabled = true,
      frequency = 'daily',
      time = '20:00',
      weekdays = [1, 2, 3, 4, 5, 6, 7] // Monday to Sunday
    } = preferences

    if (!enabled) {
      this.clearMoodReminders()
      return
    }

    // Clear existing reminders
    this.clearMoodReminders()

    // Schedule new reminders
    const [hours, minutes] = time.split(':').map(Number)
    
    weekdays.forEach(day => {
      const now = new Date()
      const reminderTime = new Date()
      
      // Set to next occurrence of this day and time
      reminderTime.setDate(now.getDate() + ((day - now.getDay() + 7) % 7))
      reminderTime.setHours(hours, minutes, 0, 0)
      
      // If the time has passed today, schedule for next week
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 7)
      }

      const timeoutId = setTimeout(() => {
        this.showMoodReminder()
        
        // Schedule recurring reminder based on frequency
        const interval = frequency === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
        setInterval(() => this.showMoodReminder(), interval)
        
      }, reminderTime.getTime() - now.getTime())

      // Store timeout ID for cleanup
      const reminderKey = `moodReminder_${day}`
      localStorage.setItem(reminderKey, timeoutId.toString())
    })

    console.log('⏰ Mood reminders scheduled')
  }

  // Clear all mood reminders
  clearMoodReminders() {
    for (let day = 1; day <= 7; day++) {
      const reminderKey = `moodReminder_${day}`
      const timeoutId = localStorage.getItem(reminderKey)
      
      if (timeoutId) {
        clearTimeout(parseInt(timeoutId))
        localStorage.removeItem(reminderKey)
      }
    }
    
    console.log('⏰ Mood reminders cleared')
  }

  // Show mood reminder notification
  async showMoodReminder() {
    if (this.permission !== 'granted') {
      return
    }

    const options = {
      body: 'Take a moment to check in with yourself. How are you feeling?',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'mood-reminder',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        url: '/mood-check',
        type: 'mood-reminder',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'track-mood',
          title: '📝 Track Mood',
          icon: '/icon-192x192.png'
        },
        {
          action: 'later',
          title: '⏰ Remind Later'
        },
        {
          action: 'dismiss',
          title: '✕ Dismiss'
        }
      ]
    }

    try {
      if (this.swRegistration) {
        await this.swRegistration.showNotification('🧠 Mood Check Reminder', options)
      } else {
        // Fallback to browser notification
        new Notification('🧠 Mood Check Reminder', options)
      }
      
      console.log('🔔 Mood reminder notification shown')
    } catch (error) {
      console.error('❌ Failed to show notification:', error)
    }
  }

  // Show crisis alert notification
  async showCrisisAlert(message = 'Crisis support may be needed') {
    if (this.permission !== 'granted') {
      return
    }

    const options = {
      body: message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'crisis-alert',
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300],
      data: {
        url: '/crisis-support',
        type: 'crisis-alert',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'crisis-resources',
          title: '🆘 Crisis Resources',
          icon: '/icon-192x192.png'
        },
        {
          action: 'call-988',
          title: '📞 Call 988'
        }
      ]
    }

    try {
      if (this.swRegistration) {
        await this.swRegistration.showNotification('🚨 Crisis Alert', options)
      } else {
        new Notification('🚨 Crisis Alert', options)
      }
      
      console.log('🚨 Crisis alert notification shown')
    } catch (error) {
      console.error('❌ Failed to show crisis alert:', error)
    }
  }

  // Show analytics update notification
  async showAnalyticsUpdate(insights = []) {
    if (this.permission !== 'granted' || insights.length === 0) {
      return
    }

    const options = {
      body: `New insights available: ${insights[0]}`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'analytics-update',
      data: {
        url: '/dashboard',
        type: 'analytics-update',
        insights: insights,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view-dashboard',
          title: '📊 View Dashboard',
          icon: '/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: '✕ Dismiss'
        }
      ]
    }

    try {
      if (this.swRegistration) {
        await this.swRegistration.showNotification('📈 New Insights Available', options)
      } else {
        new Notification('📈 New Insights Available', options)
      }
      
      console.log('📈 Analytics update notification shown')
    } catch (error) {
      console.error('❌ Failed to show analytics notification:', error)
    }
  }

  // Send subscription to server (placeholder for backend integration)
  async sendSubscriptionToServer(subscription) {
    try {
      // This would send the subscription to your backend
      // For now, we'll store it locally
      localStorage.setItem('pushSubscription', JSON.stringify(subscription))
      console.log('📤 Push subscription saved locally')
    } catch (error) {
      console.error('❌ Failed to save subscription:', error)
    }
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Get notification settings
  getSettings() {
    return {
      permission: this.permission,
      isSupported: this.isSupported(),
      isSubscribed: !!localStorage.getItem('pushSubscription')
    }
  }
}

// Create singleton instance
const notificationManager = new NotificationManager()

export default notificationManager