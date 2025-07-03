import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Dashboard() {
  const [moodHistory, setMoodHistory] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [insights, setInsights] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const [realtimeData, setRealtimeData] = useState(null)
  const [userId] = useState('user_' + Date.now())

  useEffect(() => {
    fetchMoodHistory()
    connectWebSocket()
    
    return () => {
      // Cleanup WebSocket on unmount
      if (window.moodWebSocket) {
        window.moodWebSocket.close()
      }
    }
  }, [])

  const fetchMoodHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mood/history/${userId}?days=30`)
      if (response.ok) {
        const data = await response.json()
        setMoodHistory(data.history || [])
        setAnalytics(data.analytics)
        setInsights(data.enhanced_insights || [])
      }
    } catch (error) {
      console.error('Failed to fetch mood history:', error)
      // Load from localStorage as fallback
      const offlineData = JSON.parse(localStorage.getItem('moodHistory') || '[]')
      setMoodHistory(offlineData)
    } finally {
      setIsLoading(false)
    }
  }

  const connectWebSocket = () => {
    try {
      const wsUrl = `ws://localhost:8000/ws/mood-monitor/${userId}`
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('🔌 WebSocket connected')
        setWsConnected(true)
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('📡 Real-time data:', data)
        setRealtimeData(data)
        
        // Update history if new mood tracked
        if (data.type === 'mood_tracked_enhanced') {
          setMoodHistory(prev => [...prev, data.data])
        }
      }
      
      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected')
        setWsConnected(false)
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000)
      }
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setWsConnected(false)
      }
      
      window.moodWebSocket = ws
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }

  const getRecentMood = () => {
    if (moodHistory.length === 0) return { score: 5, emoji: '😐', color: 'text-gray-600' }
    
    const recent = moodHistory[moodHistory.length - 1]
    const score = recent.score
    
    let emoji, color
    if (score >= 8) { emoji = '🤩'; color = 'text-green-600' }
    else if (score >= 6) { emoji = '😊'; color = 'text-green-500' }
    else if (score >= 4) { emoji = '😐'; color = 'text-yellow-500' }
    else if (score >= 2) { emoji = '😔'; color = 'text-orange-500' }
    else { emoji = '😢'; color = 'text-red-500' }
    
    return { score, emoji, color, timestamp: recent.timestamp }
  }

  const calculateTrend = () => {
    if (moodHistory.length < 2) return { trend: 'stable', percentage: 0 }
    
    const recent = moodHistory.slice(-7).map(entry => entry.score)
    const older = moodHistory.slice(-14, -7).map(entry => entry.score)
    
    if (older.length === 0) return { trend: 'stable', percentage: 0 }
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
    const change = ((recentAvg - olderAvg) / olderAvg) * 100
    
    if (change > 10) return { trend: 'improving', percentage: Math.round(change) }
    if (change < -10) return { trend: 'declining', percentage: Math.round(Math.abs(change)) }
    return { trend: 'stable', percentage: Math.round(Math.abs(change)) }
  }

  const getTrendEmoji = (trend) => {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      default: return '📊'
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return 'text-green-600'
      case 'declining': return 'text-red-600'
      default: return 'text-blue-600'
    }
  }

  const formatDate = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Recently'
    }
  }

  const recentMood = getRecentMood()
  const trend = calculateTrend()

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your mental health dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Your Mental Health Dashboard</h1>
        <p className="text-gray-600">
          AI-powered insights and real-time monitoring 
          {wsConnected && <span className="text-green-600 ml-2">🔴 Live</span>}
        </p>
      </div>

      {/* Real-time Alert */}
      {realtimeData && realtimeData.crisis_alert && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          🚨 Crisis support may be needed. Please consider reaching out for help.
          <Link to="/crisis-support" className="ml-4 underline font-semibold">
            View Crisis Resources
          </Link>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Recent Mood */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Mood</h2>
          <div className="text-center">
            <div className="text-5xl mb-3">{recentMood.emoji}</div>
            <div className={`text-3xl font-bold ${recentMood.color}`}>
              {recentMood.score}/10
            </div>
            <div className="text-gray-500 text-sm mt-2">
              {recentMood.timestamp ? formatDate(recentMood.timestamp) : 'No data yet'}
            </div>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Weekly Trend</h2>
          <div className="text-center">
            <div className="text-4xl mb-3">{getTrendEmoji(trend.trend)}</div>
            <div className={`text-lg font-semibold ${getTrendColor(trend.trend)}`}>
              {trend.trend.charAt(0).toUpperCase() + trend.trend.slice(1)}
            </div>
            <div className="text-gray-500 text-sm mt-2">
              {trend.percentage > 0 ? `${trend.percentage}% change` : 'Stable'}
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Entries:</span>
              <span className="font-semibold">{analytics?.total_entries || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Mood:</span>
              <span className="font-semibold">{analytics?.average_score || 'N/A'}/10</span>
            </div>
            <div className="flex justify-between">
              <span>Consistency:</span>
              <span className="font-semibold capitalize">
                {analytics?.consistency?.replace('_', ' ') || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Crisis Incidents:</span>
              <span className={`font-semibold ${analytics?.crisis_incidents > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {analytics?.crisis_incidents || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/mood-check"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-semibold transition-colors block"
            >
              📝 Track Mood
            </Link>
            <Link 
              to="/crisis-support"
              className="w-full bg-red-600 hover:bg-red-700 text-white text-center py-2 px-4 rounded-lg font-semibold transition-colors block"
            >
              🆘 Crisis Support
            </Link>
            <button 
              onClick={fetchMoodHistory}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg font-semibold transition-colors"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🔮 AI Insights</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood History Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Mood History</h2>
        {moodHistory.length > 0 ? (
          <div className="space-y-4">
            {/* Simple visualization */}
            <div className="h-64 flex items-end justify-between bg-gray-50 p-4 rounded-lg">
              {moodHistory.slice(-14).map((entry, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(entry.score / 10) * 200}px`,
                      width: '20px',
                      minHeight: '10px'
                    }}
                  ></div>
                  <div className="text-xs mt-2 text-gray-600">
                    {formatDate(entry.timestamp).split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Recent entries list */}
            <div className="space-y-2">
              <h3 className="font-semibold">Recent Entries:</h3>
              {moodHistory.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {entry.score >= 7 ? '😊' : entry.score >= 4 ? '😐' : '😔'}
                    </span>
                    <div>
                      <div className="font-semibold">{entry.score}/10</div>
                      <div className="text-sm text-gray-600">
                        {entry.emotions?.join(', ') || 'No emotions'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(entry.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <div className="text-gray-500 mb-4">No mood data yet</div>
            <Link 
              to="/mood-check"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Track Your First Mood
            </Link>
          </div>
        )}
      </div>

      {/* Real-time Connection Status */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              Real-time Monitoring: {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard