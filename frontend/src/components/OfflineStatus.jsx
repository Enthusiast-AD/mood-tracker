/**
 * Offline Status Component - Day 4 PWA Enhanced
 * Author: Enthusiast-AD
 * Date: 2025-07-03 14:56:38 UTC
 */

import React, { useState, useEffect } from 'react'
import { usePWA } from '../hooks/usePWA'

const OfflineStatus = () => {
  const { isOnline, connectionStatus } = usePWA()
  const [showDetails, setShowDetails] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null)

  useEffect(() => {
    // Listen for sync events
    const handleOfflineDataSynced = (event) => {
      setSyncStatus({
        type: 'success',
        message: `Synced ${event.detail.syncedMoods} mood entries`,
        timestamp: new Date()
      })
      
      // Clear status after 5 seconds
      setTimeout(() => setSyncStatus(null), 5000)
    }

    window.addEventListener('offlineDataSynced', handleOfflineDataSynced)
    
    return () => {
      window.removeEventListener('offlineDataSynced', handleOfflineDataSynced)
    }
  }, [])

  if (isOnline && !syncStatus) {
    return null // Don't show anything when online and no sync status
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <span className="animate-pulse">📱</span>
            <span>You're offline. Some features may be limited.</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="underline hover:no-underline ml-2"
            >
              Details
            </button>
          </div>
          
          {showDetails && (
            <div className="mt-2 text-xs bg-yellow-600 rounded p-2 max-w-md mx-auto">
              <div className="space-y-1">
                <div>📡 Connection: {connectionStatus.effectiveType}</div>
                <div>⚡ Status: Offline mode active</div>
                <div>💾 Data will sync when connection is restored</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sync Status */}
      {syncStatus && (
        <div className={`px-4 py-2 text-center text-sm font-medium ${
          syncStatus.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            <span>✅</span>
            <span>{syncStatus.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default OfflineStatus