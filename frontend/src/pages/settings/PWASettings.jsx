/**
 * PWA Settings Page - Day 4 Enhanced
 * Author: Enthusiast-AD
 * Date: 2025-07-03 14:56:38 UTC
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { usePWA } from '../../hooks/usePWA'
import notificationManager from '../../utils/notificationManager'

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

  const [isLoading, setIsLoading] = useState(false)

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
    }
  }, [preferences])

  const formatStorageSize = (bytes) => {
    if (!bytes) return '0 MB'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const handleNotificationSettingsChange = async (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value }
    setNotificationSettings(newSettings)
    
    // Update user preferences
    await updatePreferences({
      ...preferences,
      notifications: newSettings
    })

    // Apply notification scheduling
    if (key === 'moodReminders' || key === 'reminderTime' || key === 'reminderDays') {
      notificationManager.scheduleMoodReminders({
        enabled: newSettings.moodReminders,
        time: newSettings.reminderTime,
        weekdays: newSettings.reminderDays
      })
    }
  }

  const handleOfflineSettingsChange = async (key, value) => {
    const newSettings = { ...offlineSettings, [key]: value }
    setOfflineSettings(newSettings)
    
    // Update user preferences
    await updatePreferences({
      ...preferences,
      offline: newSettings
    })
  }

  const handleSubscribeNotifications = async () => {
    try {
      setIsLoading(true)
      await subscribeToNotifications()
      
      // Schedule mood reminders if enabled
      if (notificationSettings.moodReminders) {
        notificationManager.scheduleMoodReminders(notificationSettings)
      }
      
      alert('✅ Notifications enabled successfully!')
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
      notificationManager.clearMoodReminders()
      alert('✅ Notifications disabled successfully!')
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
      await notificationManager.showMoodReminder()
    } catch (error) {
      alert('❌ Failed to show test notification. Please enable notifications first.')
    }
  }

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">PWA Settings</h1>
        <p className="text-gray-600">
          Configure offline features, notifications, and app behavior
        </p>
      </div>

      {/* App Status */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📱 App Status</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl mb-2 ${isInstalled ? 'text-green-600' : 'text-gray-400'}`}>
              {isInstalled ? '📱' : '🌐'}
            </div>
            <div className="font-medium">
              {isInstalled ? 'Installed App' : 'Web Version'}
            </div>
            <div className="text-sm text-gray-600">
              {isInstalled ? 'Running as PWA' : 'Running in browser'}
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl mb-2 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? '🟢' : '🔴'}
            </div>
            <div className="font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="text-sm text-gray-600">
              Connection status
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl mb-2 ${notificationPermission === 'granted' ? 'text-green-600' : 'text-gray-400'}`}>
              {notificationPermission === 'granted' ? '🔔' : '🔕'}
            </div>
            <div className="font-medium">
              {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}
            </div>
            <div className="text-sm text-gray-600">
              Push notifications
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🔔 Notification Settings</h2>
        
        {notificationPermission !== 'granted' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <div>
                <div className="font-medium text-yellow-800">Notifications Disabled</div>
                <div className="text-sm text-yellow-700">
                  Enable notifications to receive mood reminders and crisis alerts.
                </div>
              </div>
            </div>
            <button
              onClick={handleSubscribeNotifications}
              disabled={isLoading}
              className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Mood Reminders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium">Mood Check Reminders</div>
                <div className="text-sm text-gray-600">Get reminded to track your mood</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.moodReminders}
                  onChange={(e) => handleNotificationSettingsChange('moodReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {notificationSettings.moodReminders && (
              <div className="ml-4 space-y-4">
                {/* Reminder Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Time
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
                    Reminder Days
                  </label>
                  <div className="flex space-x-2">
                    {dayNames.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const dayNumber = index + 1
                          const newDays = notificationSettings.reminderDays.includes(dayNumber)
                            ? notificationSettings.reminderDays.filter(d => d !== dayNumber)
                            : [...notificationSettings.reminderDays, dayNumber]
                          handleNotificationSettingsChange('reminderDays', newDays)
                        }}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                          notificationSettings.reminderDays.includes(index + 1)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Crisis Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Crisis Alerts</div>
              <div className="text-sm text-gray-600">Immediate notifications for crisis situations</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.crisisAlerts}
                onChange={(e) => handleNotificationSettingsChange('crisisAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Weekly Reports */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Weekly Reports</div>
              <div className="text-sm text-gray-600">Weekly mood summary notifications</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.weeklyReports}
                onChange={(e) => handleNotificationSettingsChange('weeklyReports', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Test Notification */}
          {notificationPermission === 'granted' && (
            <div className="pt-4 border-t">
              <button
                onClick={handleTestNotification}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                Test Notification
              </button>
            </div>
          )}

          {/* Disable Notifications */}
          {notificationPermission === 'granted' && (
            <div className="pt-4 border-t">
              <button
                onClick={handleUnsubscribeNotifications}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Disabling...' : 'Disable All Notifications'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Offline Settings */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">💾 Offline Settings</h2>
        
        <div className="space-y-6">
          {/* Storage Stats */}
          {storageStats && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Storage Usage</span>
                <span className="text-sm text-gray-600">
                  {formatStorageSize(storageStats.used)} / {formatStorageSize(storageStats.quota)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${storageStats.usedPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {storageStats.usedPercentage}% used
              </div>
            </div>
          )}

          {/* Cache Analytics */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Cache Analytics</div>
              <div className="text-sm text-gray-600">Store analytics data for offline viewing</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={offlineSettings.cacheAnalytics}
                onChange={(e) => handleOfflineSettingsChange('cacheAnalytics', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Cache Mood History */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Cache Mood History</div>
              <div className="text-sm text-gray-600">Store mood history for offline access</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={offlineSettings.cacheMoodHistory}
                onChange={(e) => handleOfflineSettingsChange('cacheMoodHistory', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Auto Sync */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto Sync</div>
              <div className="text-sm text-gray-600">Automatically sync data when online</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={offlineSettings.autoSync}
                onChange={(e) => handleOfflineSettingsChange('autoSync', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Clear Offline Data */}
          <div className="pt-4 border-t">
            <button
              onClick={handleClearOfflineData}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Clearing...' : 'Clear All Offline Data'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              This will remove all cached data and offline mood entries. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🔧 Advanced Settings</h2>
        
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Service Worker</h3>
              <p className="text-sm text-gray-600 mb-3">
                Manages offline functionality and caching
              </p>
              <button
                onClick={() => {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(registrations => {
                      alert(`Service Worker Status: ${registrations.length > 0 ? 'Active' : 'Inactive'}`)
                    })
                  }
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Check Status
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Cache Management</h3>
              <p className="text-sm text-gray-600 mb-3">
                Intelligent caching for optimal performance
              </p>
              <button
                onClick={loadStorageStats}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Refresh Stats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PWASettings