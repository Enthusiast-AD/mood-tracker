/**
 * PWA Settings Page - Phase 3 Enhanced with Voice & Smart Notifications
 * Author: Enthusiast-AD
 * Date: 2025-07-06 11:44:11 UTC
 * Enhanced: Voice Input, Smart Notifications, Advanced AI Features
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { usePWA } from '../../hooks/usePWA'
import notificationManager from '../../utils/notificationManager'
import NotificationService from '../../services/NotificationService'
import VoiceService from '../../services/VoiceService'
import SmartNotificationScheduler from '../../services/SmartNotificationScheduler'

const PWASettings = () => {
  const { user, preferences, updatePreferences } = useAuth()
  const { 
    isInstalled, 
    isOnline, 
    notificationPermission,
    storageStats,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    clearOfflineData,
    loadStorageStats
  } = usePWA()

  // Existing notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    moodReminders: true,
    crisisAlerts: true,
    weeklyReports: false,
    reminderTime: '20:00',
    reminderDays: [1, 2, 3, 4, 5, 6, 7]
  })
  
  const [offlineSettings, setOfflineSettings] = useState({
    cacheAnalytics: true,
    cacheMoodHistory: true,
    autoSync: true,
    maxCacheSize: 50 // MB
  })

  // New Phase 3 settings
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: false,
    language: 'en-US',
    autoTranscribe: true,
    voiceCommands: true,
    speechFeedback: true,
    noiseReduction: true
  })

  const [smartNotificationSettings, setSmartNotificationSettings] = useState({
    aiTiming: true,
    patternBased: true,
    achievementAlerts: true,
    insightsDelivery: true,
    quietHours: { start: 22, end: 8 },
    personalizedMessages: true
  })

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReader: false,
    voiceNavigation: false
  })

  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('notifications')
  const [voiceTestActive, setVoiceTestActive] = useState(false)

  const tabs = [
    { id: 'notifications', label: 'Smart Notifications', icon: '🔔' },
    { id: 'voice', label: 'Voice & AI', icon: '🎤' },
    { id: 'offline', label: 'Offline & Sync', icon: '💾' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' }
  ]

  useEffect(() => {
    // Load settings from user preferences
    if (preferences) {
      setNotificationSettings({
        ...notificationSettings,
        ...preferences.notifications
      })
      setOfflineSettings({
        ...offlineSettings,
        ...preferences.offline
      })
      setVoiceSettings({
        ...voiceSettings,
        ...preferences.voice
      })
      setSmartNotificationSettings({
        ...smartNotificationSettings,
        ...preferences.smartNotifications
      })
      setAccessibilitySettings({
        ...accessibilitySettings,
        ...preferences.accessibility
      })
    }
  }, [preferences])

  const formatStorageSize = (bytes) => {
    if (!bytes) return '0 MB'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  // Enhanced notification settings handler
  const handleNotificationSettingsChange = async (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value }
    setNotificationSettings(newSettings)
    
    // Update user preferences
    await updatePreferences({
      ...preferences,
      notifications: newSettings
    })

    // Apply to both old and new notification systems
    if (key === 'moodReminders' || key === 'reminderTime' || key === 'reminderDays') {
      // Legacy notification manager
      notificationManager.scheduleMoodReminders({
        enabled: newSettings.moodReminders,
        time: newSettings.reminderTime,
        weekdays: newSettings.reminderDays
      })
      
      // New smart notification service
      NotificationService.savePreferences({
        ...NotificationService.userPreferences,
        moodReminders: newSettings.moodReminders
      })
    }
  }

  // Voice settings handler
  const handleVoiceSettingsChange = async (key, value) => {
    const newSettings = { ...voiceSettings, [key]: value }
    setVoiceSettings(newSettings)
    
    await updatePreferences({
      ...preferences,
      voice: newSettings
    })

    // Apply voice settings
    if (key === 'enabled' && !value) {
      VoiceService.stopListening()
    }
  }

  // Smart notification settings handler
  const handleSmartNotificationSettingsChange = async (key, value) => {
    const newSettings = { ...smartNotificationSettings, [key]: value }
    setSmartNotificationSettings(newSettings)
    
    await updatePreferences({
      ...preferences,
      smartNotifications: newSettings
    })

    // Update NotificationService preferences
    NotificationService.savePreferences({
      ...NotificationService.userPreferences,
      [key]: value
    })
  }

  const handleOfflineSettingsChange = async (key, value) => {
    const newSettings = { ...offlineSettings, [key]: value }
    setOfflineSettings(newSettings)
    
    await updatePreferences({
      ...preferences,
      offline: newSettings
    })
  }

  const handleAccessibilitySettingsChange = async (key, value) => {
    const newSettings = { ...accessibilitySettings, [key]: value }
    setAccessibilitySettings(newSettings)
    
    await updatePreferences({
      ...preferences,
      accessibility: newSettings
    })

    // Apply accessibility changes immediately
    applyAccessibilitySettings(newSettings)
  }

  const applyAccessibilitySettings = (settings) => {
    const root = document.documentElement
    
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }
    
    if (settings.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }
  }

  // Enhanced notification subscription
  const handleSubscribeNotifications = async () => {
    try {
      setIsLoading(true)
      
      // Request permission through new service
      const granted = await NotificationService.requestPermission()
      
      if (granted) {
        // Legacy subscription
        await subscribeToNotifications()
        
        // Schedule mood reminders if enabled
        if (notificationSettings.moodReminders) {
          notificationManager.scheduleMoodReminders(notificationSettings)
        }
        
        alert('✅ Smart notifications enabled successfully!')
      } else {
        alert('❌ Notification permission denied')
      }
    } catch (error) {
      alert('❌ Failed to enable notifications. Please check browser settings.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribeNotifications = async () => {
    try {
      setIsLoading(true)
      await unsubscribeFromNotifications()
      await NotificationService.clearAllNotifications()
      notificationManager.clearMoodReminders()
      alert('✅ All notifications disabled successfully!')
    } catch (error) {
      alert('❌ Failed to disable notifications.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearOfflineData = async () => {
    if (confirm('Are you sure you want to clear all offline data? This action cannot be undone.')) {
      try {
        setIsLoading(true)
        await clearOfflineData()
        await loadStorageStats()
        alert('✅ Offline data cleared successfully!')
      } catch (error) {
        alert('❌ Failed to clear offline data.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleTestNotification = async () => {
    try {
      await NotificationService.sendNotification(
        '🧠 Test Notification from Mental Health AI',
        {
          body: 'Your smart notifications are working perfectly! 🎉',
          icon: '/icon-192x192.png'
        }
      )
    } catch (error) {
      alert('❌ Failed to show test notification. Please enable notifications first.')
    }
  }

  const handleTestVoice = async () => {
    if (!VoiceService.isVoiceSupported()) {
      alert('❌ Voice input not supported in this browser')
      return
    }

    setVoiceTestActive(true)
    
    VoiceService.onResult = (result) => {
      if (result.isFinal) {
        alert(`🎤 Voice test successful! You said: "${result.transcript}"`)
        setVoiceTestActive(false)
      }
    }

    VoiceService.onError = (error) => {
      alert(`❌ Voice test failed: ${error}`)
      setVoiceTestActive(false)
    }

    try {
      VoiceService.startListening()
      setTimeout(() => {
        if (voiceTestActive) {
          VoiceService.stopListening()
          setVoiceTestActive(false)
        }
      }, 5000)
    } catch (error) {
      alert('❌ Failed to start voice test')
      setVoiceTestActive(false)
    }
  }

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Enhanced Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-2">⚙️ Enhanced PWA Settings</h1>
        <p className="text-gray-600 text-lg">
          Configure voice input, smart notifications, offline features, and accessibility
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div 
        className="flex flex-wrap justify-center gap-2 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-md'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* App Status */}
      <motion.div 
        className="bg-white rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h2 className="text-xl font-semibold mb-4">📱 App Status</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <motion.div 
              className={`text-3xl mb-2 ${isInstalled ? 'text-green-600' : 'text-gray-400'}`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isInstalled ? '📱' : '🌐'}
            </motion.div>
            <div className="font-medium">
              {isInstalled ? 'Installed App' : 'Web Version'}
            </div>
            <div className="text-sm text-gray-600">
              {isInstalled ? 'Running as PWA' : 'Running in browser'}
            </div>
          </div>
          
          <div className="text-center">
            <motion.div 
              className={`text-3xl mb-2 ${isOnline ? 'text-green-600' : 'text-red-600'}`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              {isOnline ? '🟢' : '🔴'}
            </motion.div>
            <div className="font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="text-sm text-gray-600">
              Connection status
            </div>
          </div>
          
          <div className="text-center">
            <motion.div 
              className={`text-3xl mb-2 ${notificationPermission === 'granted' ? 'text-green-600' : 'text-gray-400'}`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              {notificationPermission === 'granted' ? '🔔' : '🔕'}
            </motion.div>
            <div className="font-medium">
              {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}
            </div>
            <div className="text-sm text-gray-600">
              Smart notifications
            </div>
          </div>

          <div className="text-center">
            <motion.div 
              className={`text-3xl mb-2 ${voiceSettings.enabled ? 'text-green-600' : 'text-gray-400'}`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            >
              {voiceSettings.enabled ? '🎤' : '🔇'}
            </motion.div>
            <div className="font-medium">
              {voiceSettings.enabled ? 'Voice Active' : 'Voice Disabled'}
            </div>
            <div className="text-sm text-gray-600">
              Voice input & AI
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
        >
          {/* Smart Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🔔 Smart Notification Settings</h2>
              
              {notificationPermission !== 'granted' && (
                <motion.div 
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center">
                    <span className="text-yellow-600 mr-2 text-2xl">⚠️</span>
                    <div>
                      <div className="font-medium text-yellow-800">Smart Notifications Disabled</div>
                      <div className="text-sm text-yellow-700">
                        Enable notifications to receive AI-powered reminders, crisis alerts, and personalized insights.
                      </div>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleSubscribeNotifications}
                    disabled={isLoading}
                    className="mt-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? 'Enabling...' : '🚀 Enable Smart Notifications'}
                  </motion.button>
                </motion.div>
              )}

              <div className="space-y-6">
                {/* Enhanced Mood Reminders */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">🧠 AI-Powered Mood Reminders</div>
                      <div className="text-sm text-gray-600">Personalized reminders based on your patterns</div>
                    </div>
                    <motion.label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.moodReminders}
                        onChange={(e) => handleNotificationSettingsChange('moodReminders', e.target.checked)}
                        className="sr-only peer"
                      />
                      <motion.div 
                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                        whileTap={{ scale: 0.95 }}
                      />
                    </motion.label>
                  </div>

                  {notificationSettings.moodReminders && (
                    <motion.div 
                      className="ml-4 space-y-4 p-4 bg-blue-50 rounded-lg"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      {/* Reminder Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Reminder Time
                        </label>
                        <input
                          type="time"
                          value={notificationSettings.reminderTime}
                          onChange={(e) => handleNotificationSettingsChange('reminderTime', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Reminder Days */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Active Days
                        </label>
                        <div className="flex space-x-2">
                          {dayNames.map((day, index) => (
                            <motion.button
                              key={day}
                              type="button"
                              onClick={() => {
                                const dayNumber = index + 1
                                const newDays = notificationSettings.reminderDays.includes(dayNumber)
                                  ? notificationSettings.reminderDays.filter(d => d !== dayNumber)
                                  : [...notificationSettings.reminderDays, dayNumber]
                                handleNotificationSettingsChange('reminderDays', newDays)
                              }}
                              className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                                notificationSettings.reminderDays.includes(index + 1)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {day}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Smart Timing */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">🤖 AI Smart Timing</div>
                          <div className="text-xs text-gray-600">Let AI optimize notification timing</div>
                        </div>
                        <motion.label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={smartNotificationSettings.aiTiming}
                            onChange={(e) => handleSmartNotificationSettingsChange('aiTiming', e.target.checked)}
                            className="sr-only peer"
                          />
                          <motion.div 
                            className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"
                            whileTap={{ scale: 0.95 }}
                          />
                        </motion.label>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Crisis Alerts */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">🆘 Crisis Alerts</div>
                    <div className="text-sm text-gray-600">Immediate notifications for crisis situations</div>
                  </div>
                  <motion.label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.crisisAlerts}
                      onChange={(e) => handleNotificationSettingsChange('crisisAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <motion.div 
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"
                      whileTap={{ scale: 0.95 }}
                    />
                  </motion.label>
                </div>

                {/* Achievement Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">🎉 Achievement Celebrations</div>
                    <div className="text-sm text-gray-600">Celebrate streaks and milestones</div>
                  </div>
                  <motion.label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smartNotificationSettings.achievementAlerts}
                      onChange={(e) => handleSmartNotificationSettingsChange('achievementAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <motion.div 
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
                      whileTap={{ scale: 0.95 }}
                    />
                  </motion.label>
                </div>

                {/* Weekly Reports */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">📊 AI Insights & Reports</div>
                    <div className="text-sm text-gray-600">Weekly patterns and predictions</div>
                  </div>
                  <motion.label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyReports}
                      onChange={(e) => handleNotificationSettingsChange('weeklyReports', e.target.checked)}
                      className="sr-only peer"
                    />
                    <motion.div 
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"
                      whileTap={{ scale: 0.95 }}
                    />
                  </motion.label>
                </div>

                {/* Quiet Hours */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">🌙 Quiet Hours</h4>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm text-gray-600">Start</label>
                      <select
                        value={smartNotificationSettings.quietHours.start}
                        onChange={(e) => handleSmartNotificationSettingsChange('quietHours', {
                          ...smartNotificationSettings.quietHours,
                          start: parseInt(e.target.value)
                        })}
                        className="mt-1 border border-gray-300 rounded px-2 py-1"
                      >
                        {[...Array(24)].map((_, i) => (
                          <option key={i} value={i}>{i}:00</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">End</label>
                      <select
                        value={smartNotificationSettings.quietHours.end}
                        onChange={(e) => handleSmartNotificationSettingsChange('quietHours', {
                          ...smartNotificationSettings.quietHours,
                          end: parseInt(e.target.value)
                        })}
                        className="mt-1 border border-gray-300 rounded px-2 py-1"
                      >
                        {[...Array(24)].map((_, i) => (
                          <option key={i} value={i}>{i}:00</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Test Notification */}
                {notificationPermission === 'granted' && (
                  <div className="pt-4 border-t">
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={handleTestNotification}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        🧪 Test Smart Notification
                      </motion.button>
                      <motion.button
                        onClick={handleUnsubscribeNotifications}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isLoading ? 'Disabling...' : '🚫 Disable All Notifications'}
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voice & AI Tab */}
          {activeTab === 'voice' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🎤 Voice & AI Settings</h2>
              
              {!VoiceService.isVoiceSupported() && (
                <motion.div 
                  className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2 text-2xl">⚠️</span>
                    <div>
                      <div className="font-medium text-red-800">Voice Input Not Supported</div>
                      <div className="text-sm text-red-700">
                        Your browser doesn't support voice input. Try Chrome or Edge for the best experience.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-6">
                {/* Voice Input Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">🎤 Voice Input</div>
                    <div className="text-sm text-gray-600">Enable voice commands and speech-to-text</div>
                  </div>
                  <motion.label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={voiceSettings.enabled}
                      onChange={(e) => handleVoiceSettingsChange('enabled', e.target.checked)}
                      disabled={!VoiceService.isVoiceSupported()}
                      className="sr-only peer"
                    />
                    <motion.div 
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"
                      whileTap={{ scale: 0.95 }}
                    />
                  </motion.label>
                </div>

                {voiceSettings.enabled && (
                  <motion.div 
                    className="ml-4 space-y-4 p-4 bg-purple-50 rounded-lg"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    {/* Voice Language */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🌐 Language
                      </label>
                      <select
                        value={voiceSettings.language}
                        onChange={(e) => handleVoiceSettingsChange('language', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="en-US">🇺🇸 English (US)</option>
                        <option value="en-GB">🇬🇧 English (UK)</option>
                        <option value="es-ES">🇪🇸 Spanish</option>
                        <option value="fr-FR">🇫🇷 French</option>
                        <option value="de-DE">🇩🇪 German</option>
                        <option value="it-IT">🇮🇹 Italian</option>
                      </select>
                    </div>

                    {/* Voice Commands */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">🗣️ Voice Commands</div>
                        <div className="text-xs text-gray-600">Enable "I feel happy" style commands</div>
                      </div>
                      <motion.label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={voiceSettings.voiceCommands}
                          onChange={(e) => handleVoiceSettingsChange('voiceCommands', e.target.checked)}
                          className="sr-only peer"
                        />
                        <motion.div 
                          className="w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600"
                          whileTap={{ scale: 0.95 }}
                        />
                      </motion.label>
                    </div>

                    {/* Auto Transcribe */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">📝 Auto Transcription</div>
                        <div className="text-xs text-gray-600">Automatically convert speech to text</div>
                      </div>
                      <motion.label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={voiceSettings.autoTranscribe}
                          onChange={(e) => handleVoiceSettingsChange('autoTranscribe', e.target.checked)}
                          className="sr-only peer"
                        />
                        <motion.div 
                          className="w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600"
                          whileTap={{ scale: 0.95 }}
                        />
                      </motion.label>
                    </div>

                    {/* Speech Feedback */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">🔊 Speech Feedback</div>
                        <div className="text-xs text-gray-600">AI speaks responses back to you</div>
                      </div>
                      <motion.label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={voiceSettings.speechFeedback}
                          onChange={(e) => handleVoiceSettingsChange('speechFeedback', e.target.checked)}
                          className="sr-only peer"
                        />
                        <motion.div 
                          className="w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600"
                          whileTap={{ scale: 0.95 }}
                        />
                      </motion.label>
                    </div>
                  </motion.div>
                )}

                {/* Test Voice Input */}
                {voiceSettings.enabled && VoiceService.isVoiceSupported() && (
                  <div className="pt-4 border-t">
                    <motion.button
                      onClick={handleTestVoice}
                      disabled={voiceTestActive}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        voiceTestActive 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {voiceTestActive ? '🎤 Listening... (5s)' : '🧪 Test Voice Input'}
                    </motion.button>
                    <p className="text-sm text-gray-600 mt-2">
                      Click and say something like "I feel happy today" to test voice recognition.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Offline & Sync Tab - Keep existing content */}
          {activeTab === 'offline' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">💾 Offline & Sync Settings</h2>
              
              <div className="space-y-6">
                {/* Storage Stats */}
                {storageStats && (
                  <motion.div 
                    className="bg-gray-50 rounded-lg p-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">💾 Storage Usage</span>
                      <span className="text-sm text-gray-600">
                        {formatStorageSize(storageStats.used)} / {formatStorageSize(storageStats.quota)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-blue-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${storageStats.usedPercentage}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {storageStats.usedPercentage}% used
                    </div>
                  </motion.div>
                )}

                {/* Rest of offline settings - keep existing implementation */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Cache Analytics</div>
                    <div className="text-sm text-gray-600">Store analytics data for offline viewing</div>
                  </div>
                  <motion.label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offlineSettings.cacheAnalytics}
                      onChange={(e) => handleOfflineSettingsChange('cacheAnalytics', e.target.checked)}
                      className="sr-only peer"
                    />
                    <motion.div 
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                      whileTap={{ scale: 0.95 }}
                    />
                  </motion.label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Cache Mood History</div>
                    <div className="text-sm text-gray-600">Store mood history for offline access</div>
                  </div>
                  <motion.label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offlineSettings.cacheMoodHistory}
                      onChange={(e) => handleOfflineSettingsChange('cacheMoodHistory', e.target.checked)}
                      className="sr-only peer"
                    />
                    <motion.div 
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                      whileTap={{ scale: 0.95 }}
                    />
                  </motion.label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto Sync</div>
                    <div className="text-sm text-gray-600">Automatically sync data when online</div>
                  </div>
                  <motion.label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offlineSettings.autoSync}
                      onChange={(e) => handleOfflineSettingsChange('autoSync', e.target.checked)}
                      className="sr-only peer"
                    />
                    <motion.div 
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                      whileTap={{ scale: 0.95 }}
                    />
                  </motion.label>
                </div>

                {/* Clear Offline Data */}
                <div className="pt-4 border-t">
                  <motion.button
                    onClick={handleClearOfflineData}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? 'Clearing...' : '🗑️ Clear All Offline Data'}
                  </motion.button>
                  <p className="text-sm text-gray-600 mt-2">
                    This will remove all cached data and offline mood entries. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Accessibility Tab */}
          {activeTab === 'accessibility' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">♿ Accessibility Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">🎤 Voice Navigation</div>
                    <div className="text-sm text-gray-600">Navigate the app using voice commands</div>
                  </div>
                  <motion.label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessibilitySettings.voiceNavigation}
                      onChange={(e) => handleAccessibilitySettingsChange('voiceNavigation', e.target.checked)}
                      className="sr-only peer"
                    />
                    <motion.div 
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                      whileTap={{ scale: 0.95 }}
                    />
                  </motion.label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">🔍 High Contrast</div>
                    <div className="text-sm text-gray-600">Increase contrast for better visibility</div>
                  </div>
                  <motion.label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessibilitySettings.highContrast}
                      onChange={(e) => handleAccessibilitySettingsChange('highContrast', e.target.checked)}
                      className="sr-only peer"
                    />
                    <motion.div 
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                      whileTap={{ scale: 0.95 }}
                    />
                  </motion.label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">🐌 Reduced Motion</div>
                    <div className="text-sm text-gray-600">Minimize animations for sensitivity</div>
                  </div>
                  <motion.label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessibilitySettings.reducedMotion}
                      onChange={(e) => handleAccessibilitySettingsChange('reducedMotion', e.target.checked)}
                      className="sr-only peer"
                    />
                    <motion.div 
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                      whileTap={{ scale: 0.95 }}
                    />
                  </motion.label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">📖 Large Text</div>
                    <div className="text-sm text-gray-600">Increase text size for better readability</div>
                  </div>
                  <motion.label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessibilitySettings.largeText}
                      onChange={(e) => handleAccessibilitySettingsChange('largeText', e.target.checked)}
                      className="sr-only peer"
                    />
                    <motion.div 
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                      whileTap={{ scale: 0.95 }}
                    />
                  </motion.label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">📢 Screen Reader Support</div>
                    <div className="text-sm text-gray-600">Enhanced screen reader compatibility</div>
                  </div>
                  <motion.label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessibilitySettings.screenReader}
                      onChange={(e) => handleAccessibilitySettingsChange('screenReader', e.target.checked)}
                      className="sr-only peer"
                    />
                    <motion.div 
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                      whileTap={{ scale: 0.95 }}
                    />
                  </motion.label>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab - Keep existing content */}
          {activeTab === 'advanced' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🔧 Advanced Settings</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div 
                    className="bg-gray-50 p-4 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="font-medium mb-2">⚙️ Service Worker</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Manages offline functionality and caching
                    </p>
                    <motion.button
                      onClick={() => {
                        if ('serviceWorker' in navigator) {
                          navigator.serviceWorker.getRegistrations().then(registrations => {
                            alert(`Service Worker Status: ${registrations.length > 0 ? 'Active' : 'Inactive'}`)
                          })
                        }
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Check Status
                    </motion.button>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gray-50 p-4 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="font-medium mb-2">🧠 AI Models</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Voice recognition and sentiment analysis
                    </p>
                    <motion.button
                      onClick={() => {
                        const status = VoiceService.isVoiceSupported() ? 'Supported' : 'Not Supported'
                        alert(`AI Models Status: ${status}`)
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Check AI Status
                    </motion.button>
                  </motion.div>

                  <motion.div 
                    className="bg-gray-50 p-4 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="font-medium mb-2">📊 Cache Management</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Intelligent caching for optimal performance
                    </p>
                    <motion.button
                      onClick={loadStorageStats}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Refresh Stats
                    </motion.button>
                  </motion.div>

                  <motion.div 
                    className="bg-gray-50 p-4 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="font-medium mb-2">🔔 Notification System</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Smart notification scheduling engine
                    </p>
                    <motion.button
                      onClick={() => {
                        const permission = NotificationService.getPermissionStatus()
                        alert(`Notification Status: ${permission.permission} (Supported: ${permission.supported})`)
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Check System
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default PWASettings