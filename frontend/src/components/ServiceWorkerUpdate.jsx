/**
 * Service Worker Update Component - Day 4 Enhanced
 * Author: Enthusiast-AD
 * Date: 2025-07-03 14:56:38 UTC
 */

import React from 'react'
import { usePWA } from '../hooks/usePWA'

const ServiceWorkerUpdate = () => {
  const { swUpdateAvailable, updateServiceWorker } = usePWA()

  if (!swUpdateAvailable) {
    return null
  }

  const handleUpdate = () => {
    if (confirm('A new version is available. Update now? The app will reload.')) {
      updateServiceWorker()
    }
  }

  return (
    <div className="fixed top-16 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">🔄</div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              Update Available
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              A new version of the app is ready to install with improvements and bug fixes.
            </p>
            
            <button
              onClick={handleUpdate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Update Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceWorkerUpdate