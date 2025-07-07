class NotificationService {
  constructor() {
    this.permission = 'default'
    this.registration = null
    this.notificationQueue = []
    this.userPreferences = this.loadPreferences()
    this.init()
  }

  async init() {
    if ('Notification' in window) {
      this.permission = Notification.permission
      
      // Register service worker for notifications
      if ('serviceWorker' in navigator) {
        try {
          this.registration = await navigator.serviceWorker.ready
          console.log('✅ Service Worker ready for notifications')
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error)
        }
      }
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications')
    }

    if (this.permission === 'granted') {
      return true
    }

    const permission = await Notification.requestPermission()
    this.permission = permission
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted')
      return true
    } else {
      console.log('❌ Notification permission denied')
      return false
    }
  }

  // Load user notification preferences
  loadPreferences() {
    const stored = localStorage.getItem('notificationPreferences')
    return stored ? JSON.parse(stored) : {
      enabled: true,
      moodReminders: true,
      achievements: true,
      insights: true,
      crisisAlerts: true,
      quietHours: { start: 22, end: 8 },
      frequency: 'daily',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  // Save user notification preferences
  savePreferences(preferences) {
    this.userPreferences = { ...this.userPreferences, ...preferences }
    localStorage.setItem('notificationPreferences', JSON.stringify(this.userPreferences))
  }

  // Check if notifications should be sent (quiet hours, etc.)
  shouldSendNotification() {
    if (!this.userPreferences.enabled) return false
    
    const now = new Date()
    const hour = now.getHours()
    const { start, end } = this.userPreferences.quietHours
    
    // Check quiet hours
    if (start > end) { // Spans midnight
      if (hour >= start || hour < end) return false
    } else {
      if (hour >= start && hour < end) return false
    }
    
    return true
  }

  // Send notification
  async sendNotification(title, options = {}) {
    if (this.permission !== 'granted' || !this.shouldSendNotification()) {
      return false
    }

    const defaultOptions = {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200],
      tag: 'mood-tracker',
      requireInteraction: false,
      silent: false,
      ...options
    }

    try {
      if (this.registration && this.registration.showNotification) {
        // Use service worker for better notification handling
        await this.registration.showNotification(title, defaultOptions)
      } else {
        // Fallback to basic notification
        new Notification(title, defaultOptions)
      }
      
      console.log('✅ Notification sent:', title)
      return true
    } catch (error) {
      console.error('❌ Failed to send notification:', error)
      return false
    }
  }

  // Smart mood reminder notifications
  async sendMoodReminder(userPattern = null) {
    if (!this.userPreferences.moodReminders) return false

    const messages = [
      "🌟 How are you feeling today?",
      "💙 Take a moment to check in with yourself",
      "🧠 Your mental health matters - track your mood",
      "✨ A quick mood check can help you understand yourself better",
      "🌈 What emotions are you experiencing right now?"
    ]

    let message = messages[Math.floor(Math.random() * messages.length)]
    
    // Personalize based on user patterns
    if (userPattern) {
      if (userPattern.lastMoodLow) {
        message = "💙 Checking in - how are you feeling today? You're not alone."
      } else if (userPattern.streak > 0) {
        message = `🔥 ${userPattern.streak} day streak! How are you feeling today?`
      }
    }

    return await this.sendNotification(message, {
      body: "Tap to track your mood with AI-powered insights",
      data: { action: 'mood-check', url: '/mood-check' },
      actions: [
        { action: 'track', title: '📝 Track Mood' },
        { action: 'remind-later', title: '⏰ Remind Later' }
      ]
    })
  }

  // Achievement notifications
  async sendAchievementNotification(achievement) {
    if (!this.userPreferences.achievements) return false

    const achievementMessages = {
      'first-entry': {
        title: '🎉 Welcome to your mental health journey!',
        body: 'You tracked your first mood. Great start!'
      },
      'week-streak': {
        title: '🔥 7-day streak achieved!',
        body: 'Consistency is key to understanding your patterns'
      },
      'month-streak': {
        title: '🏆 30-day streak! Amazing dedication!',
        body: 'You\'re building powerful self-awareness habits'
      },
      'crisis-support': {
        title: '💪 You reached out for support',
        body: 'Taking care of your mental health shows strength'
      }
    }

    const message = achievementMessages[achievement.type] || {
      title: '🌟 Achievement unlocked!',
      body: achievement.description
    }

    return await this.sendNotification(message.title, {
      body: message.body,
      data: { action: 'dashboard', url: '/dashboard' },
      requireInteraction: true
    })
  }

  // Crisis alert notifications
  async sendCrisisAlert() {
    if (!this.userPreferences.crisisAlerts) return false

    return await this.sendNotification('🆘 Crisis Support Available', {
      body: 'Immediate help is available 24/7. You\'re not alone.',
      requireInteraction: true,
      silent: false,
      vibrate: [200, 100, 200, 100, 200],
      data: { action: 'crisis-support', url: '/crisis-support' },
      actions: [
        { action: 'call-988', title: '📞 Call 988' },
        { action: 'crisis-text', title: '💬 Crisis Text' },
        { action: 'view-resources', title: '🆘 Resources' }
      ]
    })
  }

  // Weekly insights notification
  async sendWeeklyInsights(insights) {
    if (!this.userPreferences.insights) return false

    const insight = insights[0] || "Keep tracking your mood to discover patterns"
    
    return await this.sendNotification('📊 Your Weekly Mental Health Insights', {
      body: insight,
      data: { action: 'dashboard', url: '/dashboard' },
      icon: '/icon-512x512.png'
    })
  }

  // Predictive mood alert
  async sendPredictiveAlert(prediction) {
    if (!this.userPreferences.insights) return false

    const messages = {
      'challenging-day': '💙 Today might be challenging - extra self-care recommended',
      'positive-trend': '🌟 Your mood patterns suggest a positive day ahead!',
      'support-needed': '🤝 Consider reaching out to your support network today'
    }

    const title = messages[prediction.type] || '🧠 AI Mood Insight'
    
    return await this.sendNotification(title, {
      body: prediction.message,
      data: { action: 'mood-check', url: '/mood-check' }
    })
  }

  // Schedule notifications
  scheduleNotification(title, options, delay) {
    setTimeout(() => {
      this.sendNotification(title, options)
    }, delay)
  }

  // Handle notification clicks
  handleNotificationClick(event) {
    const data = event.notification.data
    
    if (data && data.url) {
      // Open the app to the specified URL
      if ('clients' in self) {
        self.clients.openWindow(data.url)
      } else {
        window.open(data.url, '_blank')
      }
    }
    
    event.notification.close()
  }

  // Get notification permission status
  getPermissionStatus() {
    return {
      supported: 'Notification' in window,
      permission: this.permission,
      enabled: this.userPreferences.enabled
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    if (this.registration && this.registration.getNotifications) {
      const notifications = await this.registration.getNotifications()
      notifications.forEach(notification => notification.close())
    }
  }
}

export default new NotificationService()