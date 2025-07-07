import NotificationService from './NotificationService'

class SmartNotificationScheduler {
  constructor() {
    this.scheduledNotifications = new Map()
    this.userPatterns = this.loadUserPatterns()
    this.init()
  }

  init() {
    // Schedule daily mood reminders
    this.scheduleDailyReminders()
    
    // Schedule weekly insights
    this.scheduleWeeklyInsights()
    
    // Listen for user activity to optimize timing
    this.startActivityTracking()
  }

  loadUserPatterns() {
    const stored = localStorage.getItem('userMoodPatterns')
    return stored ? JSON.parse(stored) : {
      preferredTimes: [9, 14, 20], // 9am, 2pm, 8pm
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      streak: 0,
      lastMoodEntry: null,
      averageScore: 5,
      riskPatterns: []
    }
  }

  saveUserPatterns() {
    localStorage.setItem('userMoodPatterns', JSON.stringify(this.userPatterns))
  }

  // Schedule personalized daily reminders
  scheduleDailyReminders() {
    this.userPatterns.preferredTimes.forEach((hour, index) => {
      const now = new Date()
      const reminderTime = new Date()
      reminderTime.setHours(hour, 0, 0, 0)
      
      // If time has passed today, schedule for tomorrow
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1)
      }

      const delay = reminderTime.getTime() - now.getTime()
      
      setTimeout(() => {
        this.sendSmartMoodReminder(index)
        // Reschedule for next day
        setInterval(() => {
          this.sendSmartMoodReminder(index)
        }, 24 * 60 * 60 * 1000) // 24 hours
      }, delay)
    })
  }

  // Send personalized mood reminder
  async sendSmartMoodReminder(timeSlot) {
    if (!NotificationService.shouldSendNotification()) return

    const messages = this.generatePersonalizedMessages(timeSlot)
    const message = messages[Math.floor(Math.random() * messages.length)]

    await NotificationService.sendMoodReminder(this.userPatterns)
  }

  // Generate personalized reminder messages
  generatePersonalizedMessages(timeSlot) {
    const timeOfDay = timeSlot === 0 ? 'morning' : timeSlot === 1 ? 'afternoon' : 'evening'
    const baseMessages = {
      morning: [
        "🌅 Good morning! How are you starting your day?",
        "☀️ Morning check-in: What's your mood today?",
        "🌟 New day, new opportunities! How are you feeling?"
      ],
      afternoon: [
        "🌤️ Afternoon check-in! How's your day going?",
        "⏰ Mid-day mood check - how are you feeling?",
        "🔄 Time for a quick mood update!"
      ],
      evening: [
        "🌙 Evening reflection: How was your day?",
        "✨ End of day check-in - what's your mood?",
        "🌅 Time to reflect on today's emotions"
      ]
    }

    let messages = baseMessages[timeOfDay]

    // Personalize based on patterns
    if (this.userPatterns.streak > 7) {
      messages.push(`🔥 ${this.userPatterns.streak} day streak! Keep it going!`)
    }

    if (this.userPatterns.averageScore < 4) {
      messages.push("💙 Your mental health matters. How are you today?")
    }

    return messages
  }

  // Schedule weekly insights
  scheduleWeeklyInsights() {
    const now = new Date()
    const nextSunday = new Date()
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7)
    nextSunday.setHours(10, 0, 0, 0) // 10 AM Sunday

    const delay = nextSunday.getTime() - now.getTime()

    setTimeout(() => {
      this.sendWeeklyInsights()
      // Reschedule for next week
      setInterval(() => {
        this.sendWeeklyInsights()
      }, 7 * 24 * 60 * 60 * 1000) // 7 days
    }, delay)
  }

  async sendWeeklyInsights() {
    const insights = [
      `📊 Your average mood this week: ${this.userPatterns.averageScore}/10`,
      "🎯 You're building great self-awareness habits!",
      "📈 Check your dashboard for detailed patterns"
    ]

    await NotificationService.sendWeeklyInsights(insights)
  }

  // Track user activity for optimal notification timing
  startActivityTracking() {
    let lastActivity = Date.now()
    
    const trackActivity = () => {
      lastActivity = Date.now()
    }

    document.addEventListener('mousedown', trackActivity)
    document.addEventListener('keydown', trackActivity)
    document.addEventListener('scroll', trackActivity)
    document.addEventListener('touchstart', trackActivity)

    // Check for inactive periods
    setInterval(() => {
      const inactive = Date.now() - lastActivity
      const fiveMinutes = 5 * 60 * 1000

      if (inactive > fiveMinutes) {
        this.handleUserInactive()
      }
    }, 60 * 1000) // Check every minute
  }

  handleUserInactive() {
    // User has been inactive - good time for a gentle reminder
    const lastEntry = this.userPatterns.lastMoodEntry
    const now = Date.now()
    const fourHours = 4 * 60 * 60 * 1000

    if (lastEntry && (now - new Date(lastEntry).getTime()) > fourHours) {
      this.scheduleGentleReminder()
    }
  }

  scheduleGentleReminder() {
    // Wait 10 minutes after inactivity, then send reminder
    setTimeout(async () => {
      if (NotificationService.shouldSendNotification()) {
        await NotificationService.sendNotification(
          "💭 Taking a break?",
          {
            body: "When you're ready, consider checking in with your mood",
            tag: 'gentle-reminder',
            requireInteraction: false
          }
        )
      }
    }, 10 * 60 * 1000) // 10 minutes
  }

  // Update patterns when user tracks mood
  updateUserPatterns(moodData) {
    this.userPatterns.lastMoodEntry = new Date().toISOString()
    this.userPatterns.streak = this.calculateStreak()
    this.userPatterns.averageScore = this.calculateAverageScore(moodData.score)
    
    // Analyze for risk patterns
    if (moodData.score <= 3) {
      this.userPatterns.riskPatterns.push({
        date: new Date().toISOString(),
        score: moodData.score,
        emotions: moodData.emotions
      })
      
      this.scheduleCareCheckIn()
    }

    this.saveUserPatterns()
  }

  // Schedule extra care check-in for low mood
  scheduleCareCheckIn() {
    // Wait 2 hours, then send supportive message
    setTimeout(async () => {
      if (NotificationService.shouldSendNotification()) {
        await NotificationService.sendNotification(
          "💙 Checking in on you",
          {
            body: "How are you feeling now? Support is always available",
            data: { action: 'mood-check', url: '/mood-check' },
            actions: [
              { action: 'check-mood', title: '📝 Check Mood' },
              { action: 'get-support', title: '🆘 Get Support' }
            ]
          }
        )
      }
    }, 2 * 60 * 60 * 1000) // 2 hours
  }

  calculateStreak() {
    // Calculate consecutive days of mood tracking
    // This would need to check actual stored mood data
    const storedData = JSON.parse(localStorage.getItem('offlineMoods') || '[]')
    if (storedData.length === 0) return 0

    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      
      const hasEntry = storedData.some(entry => {
        const entryDate = new Date(entry.created_at || Date.now())
        return entryDate.toDateString() === checkDate.toDateString()
      })
      
      if (hasEntry) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  calculateAverageScore(newScore) {
    // Simple moving average calculation
    const currentAvg = this.userPatterns.averageScore || 5
    return Math.round(((currentAvg * 0.9) + (newScore * 0.1)) * 10) / 10
  }

  // Achievement notifications
  checkForAchievements() {
    const streak = this.userPatterns.streak

    if (streak === 7) {
      NotificationService.sendAchievementNotification({
        type: 'week-streak',
        description: '7-day tracking streak!'
      })
    }

    if (streak === 30) {
      NotificationService.sendAchievementNotification({
        type: 'month-streak',
        description: '30-day tracking streak!'
      })
    }
  }
}

export default new SmartNotificationScheduler()