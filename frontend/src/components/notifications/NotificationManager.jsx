import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationService from '../../services/NotificationService'
import { showToast } from '../ui/EnhancedToast'
import AnimatedButton from '../ui/AnimatedButton'

const NotificationManager = () => {
  const [permissionStatus, setPermissionStatus] = useState('default')
  const [preferences, setPreferences] = useState(NotificationService.userPreferences)
  const [showSettings, setShowSettings] = useState(false)
  const [testNotification, setTestNotification] = useState(false)

  useEffect(() => {
    updatePermissionStatus()
  }, [])

  const updatePermissionStatus = () => {
    const status = NotificationService.getPermissionStatus()
    setPermissionStatus(status.permission)
  }

  const requestPermission = async () => {
    try {
      const granted = await NotificationService.requestPermission()
      if (granted) {
        showToast.success('🔔 Notifications enabled! You\'ll receive personalized reminders.')
        updatePermissionStatus()
      } else {
        showToast.warning('🔔 Notifications disabled. You can enable them in settings.')
      }
    } catch (error) {
      showToast.error('🔔 Notification setup failed. Please try again.')
    }
  }

  const updatePreferences = (newPreferences) => {
    setPreferences(newPreferences)
    NotificationService.savePreferences(newPreferences)
    showToast.success('💾 Notification preferences saved!')
  }

  const sendTestNotification = async () => {
    setTestNotification(true)
    const success = await NotificationService.sendNotification(
      '🧠 Test Notification',
      {
        body: 'Your notifications are working perfectly!',
        icon: '/icon-192x192.png'
      }
    )
    
    if (success) {
      showToast.success('🔔 Test notification sent!')
    } else {
      showToast.error('🔔 Failed to send test notification')
    }
    
    setTimeout(() => setTestNotification(false), 2000)
  }

  const getPermissionIcon = () => {
    switch (permissionStatus) {
      case 'granted': return '✅'
      case 'denied': return '❌'
      default: return '❓'
    }
  }

  const getPermissionMessage = () => {
    switch (permissionStatus) {
      case 'granted': return 'Notifications are enabled'
      case 'denied': return 'Notifications are blocked'
      default: return 'Notification permission not set'
    }
  }

  return (
    <div className="notification-manager">
      {/* Permission Status Card */}
      <motion.div
        className={`p-6 rounded-xl border-2 ${
          permissionStatus === 'granted' 
            ? 'bg-green-50 border-green-200' 
            : permissionStatus === 'denied'
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.span 
              className="text-3xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {getPermissionIcon()}
            </motion.span>
            <div>
              <h3 className="font-bold text-lg">Smart Notifications</h3>
              <p className="text-sm opacity-75">{getPermissionMessage()}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {permissionStatus !== 'granted' && (
              <AnimatedButton
                onClick={requestPermission}
                variant="primary"
                size="sm"
                icon="🔔"
              >
                Enable
              </AnimatedButton>
            )}
            
            <AnimatedButton
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              icon="⚙️"
            >
              Settings
            </AnimatedButton>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4 className="font-bold text-lg mb-4 flex items-center">
              <span className="mr-2">⚙️</span>
              Notification Preferences
            </h4>

            {/* Notification Types */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Mood Reminders</label>
                  <p className="text-sm text-gray-600">Get gentle reminders to track your mood</p>
                </div>
                <motion.button
                  className={`w-12 h-6 rounded-full ${
                    preferences.moodReminders ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  onClick={() => updatePreferences({
                    ...preferences,
                    moodReminders: !preferences.moodReminders
                  })}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                    animate={{
                      x: preferences.moodReminders ? 28 : 4
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Achievement Celebrations</label>
                  <p className="text-sm text-gray-600">Celebrate milestones and streaks</p>
                </div>
                <motion.button
                  className={`w-12 h-6 rounded-full ${
                    preferences.achievements ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  onClick={() => updatePreferences({
                    ...preferences,
                    achievements: !preferences.achievements
                  })}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                    animate={{
                      x: preferences.achievements ? 28 : 4
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">AI Insights</label>
                  <p className="text-sm text-gray-600">Weekly patterns and predictions</p>
                </div>
                <motion.button
                  className={`w-12 h-6 rounded-full ${
                    preferences.insights ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  onClick={() => updatePreferences({
                    ...preferences,
                    insights: !preferences.insights
                  })}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                    animate={{
                      x: preferences.insights ? 28 : 4
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Crisis Alerts</label>
                  <p className="text-sm text-gray-600">Important safety notifications</p>
                </div>
                <motion.button
                  className={`w-12 h-6 rounded-full ${
                    preferences.crisisAlerts ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                  onClick={() => updatePreferences({
                    ...preferences,
                    crisisAlerts: !preferences.crisisAlerts
                  })}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                    animate={{
                      x: preferences.crisisAlerts ? 28 : 4
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h5 className="font-medium mb-3">Quiet Hours</h5>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm text-gray-600">Start</label>
                  <select
                    value={preferences.quietHours.start}
                    onChange={(e) => updatePreferences({
                      ...preferences,
                      quietHours: {
                        ...preferences.quietHours,
                        start: parseInt(e.target.value)
                      }
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
                    value={preferences.quietHours.end}
                    onChange={(e) => updatePreferences({
                      ...preferences,
                      quietHours: {
                        ...preferences.quietHours,
                        end: parseInt(e.target.value)
                      }
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
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
              <div>
                <h5 className="font-medium">Test Notifications</h5>
                <p className="text-sm text-gray-600">Send a test notification to verify setup</p>
              </div>
              <AnimatedButton
                onClick={sendTestNotification}
                disabled={permissionStatus !== 'granted' || testNotification}
                variant="outline"
                size="sm"
                loading={testNotification}
                icon="🧪"
              >
                Send Test
              </AnimatedButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationManager