/**
 * Mood Tracking Context - Day 4 Enhanced
 * Author: Enthusiast-AD
 * Date: 2025-07-03 14:48:46 UTC
 * Features: Real-time analysis, crisis detection, database persistence
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const MoodContext = createContext()

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useMood = () => {
  const context = useContext(MoodContext)
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider')
  }
  return context
}

export const MoodProvider = ({ children }) => {
  const { getAuthHeaders, isAuthenticated } = useAuth()
  
  // State management
  const [moodHistory, setMoodHistory] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [insights, setInsights] = useState([])
  const [crisisIncidents, setCrisisIncidents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [websocket, setWebsocket] = useState(null)
  const [realtimeAnalysis, setRealtimeAnalysis] = useState(null)
  const [crisisAlert, setCrisisAlert] = useState(null)

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadMoodHistory()
      loadAnalytics()
      loadCrisisIncidents()
      connectWebSocket()
    } else {
      // Clear data when not authenticated
      resetMoodData()
    }

    return () => {
      if (websocket) {
        websocket.close()
      }
    }
  }, [isAuthenticated])

  const resetMoodData = () => {
    setMoodHistory([])
    setAnalytics(null)
    setInsights([])
    setCrisisIncidents([])
    setRealtimeAnalysis(null)
    setCrisisAlert(null)
  }

  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated) return

    try {
      const userId = `user_${Date.now()}`
      const wsUrl = `ws://localhost:8000/ws/mood-monitor/${userId}`
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('🔌 WebSocket connected for real-time mood monitoring')
        setWebsocket(ws)
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('📡 Real-time data received:', data)

        switch (data.type) {
          case 'connected_enhanced':
            console.log('✅ Enhanced monitoring active:', data.features)
            break
          
          case 'real_time_analysis':
            setRealtimeAnalysis(data.analysis)
            if (data.crisis_alert) {
              setCrisisAlert({
                level: 'high',
                message: 'Crisis indicators detected. Immediate support recommended.',
                recommendations: data.recommendations,
                timestamp: new Date().toISOString()
              })
            }
            break
          
          case 'mood_tracked_enhanced':
            // Update mood history with new entry
            setMoodHistory(prev => [data.data, ...prev])
            
            if (data.intervention_required) {
              setCrisisAlert({
                level: 'critical',
                message: 'Crisis intervention may be needed. Please seek immediate help.',
                recommendations: ['Call 988', 'Contact emergency services', 'Reach out to a trusted person'],
                timestamp: new Date().toISOString()
              })
            }
            break
        }
      }

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected')
        setWebsocket(null)
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (isAuthenticated) {
            connectWebSocket()
          }
        }, 5000)
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
      }

    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }, [isAuthenticated])

  const loadMoodHistory = async (days = 30) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(
        `${API_BASE_URL}/api/mood/history?days=${days}`,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setMoodHistory(data.history || [])
        setAnalytics(data.analytics)
        setInsights(data.insights || [])
        console.log('✅ Mood history loaded:', data.history?.length, 'entries')
      } else {
        throw new Error('Failed to load mood history')
      }
    } catch (error) {
      console.error('❌ Error loading mood history:', error)
      // Try to load from localStorage as fallback
      const offlineData = JSON.parse(localStorage.getItem('moodHistory') || '[]')
      setMoodHistory(offlineData)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnalytics = async (days = 30) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/analytics/dashboard?days=${days}`,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
        console.log('✅ Analytics loaded')
      }
    } catch (error) {
      console.error('❌ Error loading analytics:', error)
    }
  }

  const loadCrisisIncidents = async (days = 30) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/crisis/incidents?days=${days}`,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setCrisisIncidents(data)
        console.log('✅ Crisis incidents loaded:', data.length)
      }
    } catch (error) {
      console.error('❌ Error loading crisis incidents:', error)
    }
  }

  const trackMood = async (moodData) => {
    try {
      setIsSubmitting(true)

      // Send real-time data to WebSocket for immediate analysis
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          ...moodData,
          timestamp: new Date().toISOString()
        }))
      }

      // Submit to backend for database persistence
      const response = await fetch(`${API_BASE_URL}/api/mood/track`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(moodData)
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update local state
        setMoodHistory(prev => [result.data, ...prev])
        
        // Handle crisis response
        if (result.intervention_required || result.crisis_response) {
          setCrisisAlert({
            level: 'critical',
            message: 'Crisis intervention triggered. Please seek immediate help.',
            recommendations: result.recommendations || ['Call 988', 'Contact emergency services'],
            crisisResponse: result.crisis_response,
            timestamp: new Date().toISOString()
          })
        }

        // Refresh analytics
        await loadAnalytics()
        
        console.log('✅ Mood tracked successfully:', result.database_id)
        
        return {
          success: true,
          data: result.data,
          analysis: result.analysis,
          recommendations: result.recommendations,
          interventionRequired: result.intervention_required
        }

      } else {
        throw new Error('Failed to track mood')
      }

    } catch (error) {
      console.error('❌ Error tracking mood:', error)
      
      // Fallback to localStorage for offline functionality
      const moodEntry = {
        ...moodData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        offline: true
      }
      
      const offlineData = JSON.parse(localStorage.getItem('offlineMoods') || '[]')
      offlineData.push(moodEntry)
      localStorage.setItem('offlineMoods', JSON.stringify(offlineData))
      
      return {
        success: false,
        error: error.message,
        offline: true
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const dismissCrisisAlert = () => {
    setCrisisAlert(null)
  }

  const refreshData = async () => {
    await Promise.all([
      loadMoodHistory(),
      loadAnalytics(),
      loadCrisisIncidents()
    ])
  }

  const getMoodTrend = () => {
    if (moodHistory.length < 2) return 'insufficient_data'
    
    const recent = moodHistory.slice(0, 7).map(entry => entry.score)
    const older = moodHistory.slice(7, 14).map(entry => entry.score)
    
    if (older.length === 0) return 'insufficient_data'
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100
    
    if (change > 10) return 'improving'
    if (change < -10) return 'declining'
    return 'stable'
  }

  const getAverageMood = () => {
    if (moodHistory.length === 0) return 0
    
    const scores = moodHistory.map(entry => entry.score)
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
  }

  const value = {
    // State
    moodHistory,
    analytics,
    insights,
    crisisIncidents,
    isLoading,
    isSubmitting,
    realtimeAnalysis,
    crisisAlert,
    websocket: !!websocket,
    
    // Actions
    trackMood,
    loadMoodHistory,
    loadAnalytics,
    loadCrisisIncidents,
    refreshData,
    dismissCrisisAlert,
    
    // Computed values
    getMoodTrend,
    getAverageMood
  }

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  )
}