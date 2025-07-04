/**
 * PWA Install Prompt Component - Day 4 Enhanced
 * Author: Enthusiast-AD
 * Date: 2025-07-03 14:56:38 UTC
 */

import React, { useState } from 'react'
import { usePWA } from '../hooks/usePWA'

const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA()
  const [isDismissed, setIsDismissed] = useState(
    localStorage.getItem('pwa-install-dismissed') === 'true'
  )

  if (!isInstallable || isInstalled || isDismissed) {
    return null
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (!success) {
      // If installation failed, don't show prompt again for this session
      setIsDismissed(true)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Install Mental Health AI
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Get the full app experience with offline access, push notifications, and faster loading.
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallPrompt