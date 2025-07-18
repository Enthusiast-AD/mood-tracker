import React, { createContext, useContext, useState, useEffect } from 'react'

const MoodContext = createContext()

export const useMood = () => {
  const context = useContext(MoodContext)
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider')
  }
  return context
}

export const MoodProvider = ({ children }) => {
  const [moodHistory, setMoodHistory] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [insights, setInsights] = useState([])
  const [crisisIncidents, setCrisisIncidents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [realtimeAnalysis, setRealtimeAnalysis] = useState(null)
  const [websocket, setWebsocket] = useState(null)

  // Enhanced real-time analysis state
  const [aiDashboardData, setAiDashboardData] = useState({
    currentSentiment: null,
    energyLevel: null,
    riskAssessment: null,
    modelStatus: {
      sentiment: 'active',
      emotion: 'active',
      crisis: 'active',
      prediction: 'active'
    },
    liveInsights: [],
    analysisHistory: []
  })

  // WebSocket connection - DISABLED FOR NOW
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      // TODO: Enable when backend WebSocket is ready
      console.log('🔗 WebSocket connection disabled - will enable when backend supports it')
      // connectWebSocket(token)
    }

    return () => {
      if (websocket) {
        websocket.close()
      }
    }
  }, [])

  const connectWebSocket = (token) => {
    try {
      // Check if backend WebSocket endpoint exists first
      fetch('http://localhost:8000/ws')
        .then(response => {
          if (response.status === 404) {
            console.log('📡 WebSocket endpoint not available yet - using polling fallback')
            return
          }

          const ws = new WebSocket(`ws://localhost:8000/ws/${token}`)

          ws.onopen = () => {
            console.log('🔗 WebSocket connected for real-time AI updates')
            setWebsocket(ws)
          }

          ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log('📡 Real-time AI update received:', data)

            if (data.type === 'complete_ai_mood_tracked') {
              setRealtimeAnalysis(data.complete_ai_analysis)
              updateAIDashboard(data)
            }
          }

          ws.onclose = () => {
            console.log('🔌 WebSocket disconnected')
            setWebsocket(null)
          }

          ws.onerror = (error) => {
            console.log('⚠️ WebSocket not available - using fallback mode')
          }
        })
        .catch(() => {
          console.log('📡 Backend not available for WebSocket - continuing without real-time updates')
        })

    } catch (error) {
      console.log('⚠️ WebSocket initialization skipped:', error.message)
    }
  }

  const updateAIDashboard = (analysisData) => {
    setAiDashboardData(prev => ({
      ...prev,
      currentSentiment: analysisData.complete_ai_analysis?.sentiment_analysis?.sentiment,
      energyLevel: analysisData.complete_ai_analysis?.sentiment_analysis?.energy_level,
      riskAssessment: analysisData.complete_ai_analysis?.crisis_assessment?.risk_level,
      liveInsights: [
        ...analysisData.complete_ai_analysis?.ai_insights || [],
        ...prev.liveInsights.slice(0, 9)
      ]
    }))
  }

  const getMoodTrend = () => {
    if (moodHistory.length < 2) return 'stable'

    const recent = moodHistory.slice(0, 5)
    const older = moodHistory.slice(5, 10)

    const recentAvg = recent.reduce((sum, entry) => sum + entry.score, 0) / recent.length
    const olderAvg = older.length > 0 ? older.reduce((sum, entry) => sum + entry.score, 0) / older.length : recentAvg

    if (recentAvg > olderAvg + 0.5) return 'improving'
    if (recentAvg < olderAvg - 0.5) return 'declining'
    return 'stable'
  }

  const getAverageMood = () => {
    if (moodHistory.length === 0) return 5
    return Math.round(moodHistory.reduce((sum, entry) => sum + entry.score, 0) / moodHistory.length * 10) / 10
  }

  const refreshData = async () => {
    setIsLoading(true)
    try {
      // Fetch updated mood history, analytics, etc.
      await fetchMoodHistory()
      await fetchAnalytics()
    } catch (error) {
      console.error('❌ Error refreshing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMoodHistory = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch('http://localhost:8000/api/mood/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMoodHistory(data.entries || [])
      }
    } catch (error) {
      console.log('📊 Mood history not available yet')
    }
  }

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch('http://localhost:8000/api/analytics/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.log('📈 Analytics not available yet')
    }
  }

  const value = {
    moodHistory,
    moods: moodHistory, // Add this line
    analytics,
    insights,
    crisisIncidents,
    isLoading,
    websocket,
    realtimeAnalysis,
    aiDashboardData,
    getMoodTrend,
    getAverageMood,
    refreshData
  }

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  )
}