import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const AIInsightsDashboard = () => {
  const { isAuthenticated } = useAuth()
  const [realtimeAnalysis, setRealtimeAnalysis] = useState(null)
  const [moodHistory, setMoodHistory] = useState([])
  const [lastMoodEntry, setLastMoodEntry] = useState(null)
  const [analytics, setAnalytics] = useState(null) // Add analytics state
  const [isLoading, setIsLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState('checking')

  const API_BASE_URL = 'http://localhost:8000'

  // Fetch real data from backend
  useEffect(() => {
    if (isAuthenticated) {
      checkBackendConnection()
      fetchRealMoodHistory()
      fetchUserAnalytics() // Make sure this is called
      
      // Poll for updates every 30 seconds
      const interval = setInterval(() => {
        fetchRealMoodHistory()
        fetchUserAnalytics() // Also refresh analytics
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`)
      if (response.ok) {
        const data = await response.json()
        setBackendStatus('connected')
        console.log('✅ Backend connected:', data.service)
      } else {
        setBackendStatus('error')
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error)
      setBackendStatus('offline')
    }
  }

  const fetchUserAnalytics = async () => {
    console.log('📈 DASHBOARD: Fetching analytics...')
    
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.log('❌ DASHBOARD: No auth token for analytics')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/analytics/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📈 DASHBOARD: Analytics response status:', response.status)

      if (response.ok) {
        const analyticsData = await response.json()
        console.log('✅ DASHBOARD: Analytics data received:', analyticsData)
        setAnalytics(analyticsData) // Set the analytics state
        
        // Update real-time analysis with analytics data
        if (analyticsData) {
          setRealtimeAnalysis(prev => ({
            ...prev,
            ai_insights: analyticsData.ai_insights || [],
            sentiment: lastMoodEntry?.ai_analysis?.sentiment || 'neutral',
            energy_estimate: lastMoodEntry?.ai_analysis?.energy_level || 'moderate',
            risk_level: lastMoodEntry?.ai_analysis?.risk_level || 'low'
          }))
        }
      } else {
        const errorText = await response.text()
        console.log('❌ DASHBOARD: Analytics error:', errorText)
      }
    } catch (error) {
      console.error('💥 DASHBOARD: Analytics fetch failed:', error)
    }
  }

  const fetchRealMoodHistory = async () => {
    console.log('📊 DASHBOARD: Fetching mood history...')
    
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.log('❌ DASHBOARD: No auth token')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/mood/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📊 DASHBOARD: History response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ DASHBOARD: Mood history data:', data)
        setMoodHistory(data.entries || [])
        
        if (data.entries && data.entries.length > 0) {
          console.log('📝 DASHBOARD: Found entries, updating analysis')
          setLastMoodEntry(data.entries[0])
          updateAnalysisFromMoodEntry(data.entries[0])
        } else {
          console.log('📝 DASHBOARD: No mood entries found')
        }
      } else {
        const errorText = await response.text()
        console.log('❌ DASHBOARD: History API error:', errorText)
      }
    } catch (error) {
      console.error('💥 DASHBOARD: History fetch failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateAnalysisFromMoodEntry = (moodEntry) => {
    if (!moodEntry) return

    const analysis = {
      sentiment: moodEntry.ai_analysis?.sentiment || 'neutral',
      confidence: moodEntry.ai_analysis?.analysis_confidence || 0.7,
      energy_estimate: moodEntry.ai_analysis?.energy_level || 'moderate',
      risk_level: moodEntry.ai_analysis?.risk_level || 'low',
      ai_insights: [
        `Real mood entry: ${moodEntry.score}/10 with emotions: ${moodEntry.emotions?.join(', ') || 'none'}`,
        `Last tracked: ${new Date(moodEntry.created_at).toLocaleString()}`,
        `Analysis: ${moodEntry.ai_analysis?.sentiment || 'No AI analysis'} sentiment detected`
      ]
    }

    setRealtimeAnalysis(analysis)
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      case 'neutral': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getBackendStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'bg-green-500'
      case 'offline': return 'bg-red-500'
      case 'error': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getBackendStatusText = () => {
    switch (backendStatus) {
      case 'connected': return 'Backend Connected'
      case 'offline': return 'Backend Offline'
      case 'error': return 'Backend Error'
      default: return 'Checking Backend...'
    }
  }

  // Get insights from analytics or fallback to real-time analysis
  const getAIInsights = () => {
    if (analytics?.ai_insights && analytics.ai_insights.length > 0) {
      return analytics.ai_insights
    }
    if (realtimeAnalysis?.ai_insights && realtimeAnalysis.ai_insights.length > 0) {
      return realtimeAnalysis.ai_insights
    }
    return []
  }

  return (
    <div className="space-y-6">
      {/* Backend Status Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🧠</div>
            <div>
              <h1 className="text-2xl font-bold">Real AI Mental Health Assistant</h1>
              <p className="text-blue-100">
                {backendStatus === 'connected' 
                  ? 'Connected to live AI backend system' 
                  : 'Backend connection status'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getBackendStatusColor()}`}></div>
            <span className="text-sm font-medium">{getBackendStatusText()}</span>
          </div>
        </div>
      </div>

      {/* Real-time AI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Sentiment */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Current Sentiment</p>
              <div className={`text-2xl font-bold capitalize ${getSentimentColor(realtimeAnalysis?.sentiment)}`}>
                {realtimeAnalysis?.sentiment || 'No data yet'}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {realtimeAnalysis ? 
                  `${Math.round((realtimeAnalysis.confidence || 0) * 100)}% confidence` : 
                  'Track a mood to see analysis'
                }
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        {/* Energy Level */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Energy Level</p>
              <div className="text-2xl font-bold text-green-600 capitalize">
                {realtimeAnalysis?.energy_estimate || 'Unknown'}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {realtimeAnalysis ? 'From last mood entry' : 'No recent data'}
              </p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Risk Assessment</p>
              <div className={`text-2xl font-bold capitalize ${getRiskColor(realtimeAnalysis?.risk_level).split(' ')[0]}`}>
                {realtimeAnalysis?.risk_level || 'No assessment'}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {backendStatus === 'connected' ? 'AI monitoring active' : 'Backend disconnected'}
              </p>
            </div>
            <div className="text-3xl">🛡️</div>
          </div>
        </div>

        {/* Entries Analyzed */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Entries Tracked</p>
              <div className="text-2xl font-bold text-purple-600">
                {analytics?.total_entries || moodHistory?.length || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {isLoading ? 'Loading...' : 'Real database count'}
              </p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>
      </div>

      {/* Real AI Insights Feed - FIXED */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🔮</div>
            <h2 className="text-xl font-bold">Live AI Insights</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {backendStatus === 'connected' ? 'Real-time data' : 'No connection'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {getAIInsights().length > 0 ? (
            getAIInsights().map((insight, index) => (
              <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">{insight}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Real Backend AI Analysis - {new Date().toLocaleTimeString()}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">No AI Insights Yet</h3>
              <p className="text-gray-600 mb-4">
                {backendStatus === 'connected' 
                  ? 'Track a mood to see real AI analysis here' 
                  : 'Backend connection needed for real insights'
                }
              </p>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Status:</strong> {getBackendStatusText()}
                  {backendStatus === 'connected' && ' - Ready for real AI analysis!'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Summary - NEW */}
      {analytics && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">📊 Analytics Summary</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.total_entries}</div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.average_score}</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 capitalize">{analytics.mood_trend}</div>
              <div className="text-sm text-gray-600">Mood Trend</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{analytics.crisis_incidents}</div>
              <div className="text-sm text-gray-600">Crisis Incidents</div>
            </div>
          </div>
          
          {/* Most Common Emotions */}
          {analytics.most_common_emotions && analytics.most_common_emotions.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Most Common Emotions</h4>
              <div className="flex flex-wrap gap-2">
                {analytics.most_common_emotions.map((emotion, index) => (
                  <span 
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {emotion.emotion} ({emotion.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Real Mood History */}
      {moodHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">📊 Recent Real Mood Entries</h3>
          <div className="space-y-3">
            {moodHistory.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {entry.score >= 7 ? '😊' : entry.score >= 4 ? '😐' : '😔'}
                  </span>
                  <div>
                    <div className="font-semibold">Score: {entry.score}/10</div>
                    <div className="text-sm text-gray-600">
                      Emotions: {entry.emotions?.join(', ') || 'None recorded'}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">🔧 Debug Information</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Backend Status:</strong> {backendStatus}</p>
            <p><strong>Authentication:</strong> {isAuthenticated ? '✅ Logged in' : '❌ Not logged in'}</p>
            <p><strong>Mood Entries:</strong> {moodHistory.length} found</p>
            <p><strong>Analytics:</strong> {analytics ? '✅ Loaded' : '❌ Not loaded'}</p>
          </div>
          <div>
            <p><strong>Last Entry:</strong> {lastMoodEntry ? new Date(lastMoodEntry.created_at).toLocaleString() : 'None'}</p>
            <p><strong>Real Analysis:</strong> {realtimeAnalysis ? '✅ Available' : '❌ No data'}</p>
            <p><strong>AI Insights Count:</strong> {getAIInsights().length}</p>
            <p><strong>Data Source:</strong> {backendStatus === 'connected' ? 'Live Backend' : 'Mock/Offline'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIInsightsDashboard