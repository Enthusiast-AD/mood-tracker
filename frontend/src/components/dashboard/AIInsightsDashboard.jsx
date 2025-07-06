import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import MoodTrendChart from '../charts/MoodTrendChart'
import EmotionDistributionChart from '../charts/EmotionDistributionChart'
import EnhancedMetricCard from './EnhancedMetricCard'
import StaggeredCards from '../animations/StaggeredCards'
import { DashboardSkeleton } from '../ui/LoadingStates'
import { showToast } from '../ui/EnhancedToast'

const AIInsightsDashboard = () => {
  const { isAuthenticated } = useAuth()
  const [realtimeAnalysis, setRealtimeAnalysis] = useState(null)
  const [moodHistory, setMoodHistory] = useState([])
  const [lastMoodEntry, setLastMoodEntry] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState('checking')

  const API_BASE_URL = 'http://localhost:8000'

  // Fetch real data from backend
  useEffect(() => {
    if (isAuthenticated) {
      checkBackendConnection()
      fetchRealMoodHistory()
      fetchUserAnalytics()
      
      // Poll for updates every 30 seconds
      const interval = setInterval(() => {
        fetchRealMoodHistory()
        fetchUserAnalytics()
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
        showToast.success('🎉 AI Backend Connected Successfully!')
      } else {
        setBackendStatus('error')
        showToast.error('⚠️ Backend Connection Error')
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error)
      setBackendStatus('offline')
      showToast.warning('📡 Backend Offline - Using Local Data')
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
        setAnalytics(analyticsData)
        
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

  // Helper function to get trend direction
  const getTrendDirection = (value, type) => {
    if (type === 'sentiment') {
      return value === 'positive' ? 'up' : value === 'negative' ? 'down' : 'stable'
    }
    if (type === 'energy') {
      return value === 'high' ? 'up' : value === 'low' ? 'down' : 'stable'
    }
    if (type === 'risk') {
      return value === 'low' ? 'up' : value === 'high' ? 'down' : 'stable'
    }
    return 'up' // Default for entries count
  }

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Backend Status Header with Animation */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="text-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              🧠
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">Enhanced AI Mental Health Assistant</h1>
              <p className="text-blue-100">
                {backendStatus === 'connected' 
                  ? 'Connected to live AI backend system with beautiful visualizations' 
                  : 'Backend connection status'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.div 
              className={`w-3 h-3 rounded-full ${getBackendStatusColor()}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium">{getBackendStatusText()}</span>
          </div>
        </div>
      </motion.div>

      {/* Enhanced AI Metrics with Staggered Animation */}
      <StaggeredCards className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedMetricCard
          title="Current Sentiment"
          value={realtimeAnalysis?.sentiment || 'No data'}
          subtitle={realtimeAnalysis ? 
            `${Math.round((realtimeAnalysis.confidence || 0) * 100)}% confidence` : 
            'Track a mood to see analysis'
          }
          icon="📊"
          color="blue"
          trend={getTrendDirection(realtimeAnalysis?.sentiment, 'sentiment')}
        />

        <EnhancedMetricCard
          title="Energy Level"
          value={realtimeAnalysis?.energy_estimate || 'Unknown'}
          subtitle={realtimeAnalysis ? 'From last mood entry' : 'No recent data'}
          icon="⚡"
          color="green"
          trend={getTrendDirection(realtimeAnalysis?.energy_estimate, 'energy')}
        />

        <EnhancedMetricCard
          title="Risk Assessment"
          value={realtimeAnalysis?.risk_level || 'No assessment'}
          subtitle={backendStatus === 'connected' ? 'AI monitoring active' : 'Backend disconnected'}
          icon="🛡️"
          color={realtimeAnalysis?.risk_level === 'high' ? 'red' : realtimeAnalysis?.risk_level === 'medium' ? 'yellow' : 'green'}
          trend={getTrendDirection(realtimeAnalysis?.risk_level, 'risk')}
        />

        <EnhancedMetricCard
          title="Entries Tracked"
          value={analytics?.total_entries || moodHistory?.length || 0}
          subtitle={isLoading ? 'Loading...' : 'Real database count'}
          icon="📈"
          color="purple"
          trend="up"
        />
      </StaggeredCards>

      {/* Beautiful Charts Section with Staggered Animation */}
      <StaggeredCards className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <MoodTrendChart moodHistory={moodHistory} />
        <EmotionDistributionChart moodHistory={moodHistory} />
      </StaggeredCards>

      {/* Enhanced AI Insights Feed with Animations */}
      <motion.div 
        className="bg-white rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <motion.div 
              className="text-2xl"
              animate={{ 
                y: [0, -5, 0],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              🔮
            </motion.div>
            <h2 className="text-xl font-bold text-gray-800">Live AI Insights</h2>
          </div>
          <div className="flex items-center space-x-2">
            <motion.div 
              className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-green-500' : 'bg-gray-400'}`}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-gray-600">
              {backendStatus === 'connected' ? 'Real-time data' : 'No connection'}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <div className="space-y-3">
            {getAIInsights().length > 0 ? (
              getAIInsights().map((insight, index) => (
                <motion.div 
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <p className="text-blue-800 font-medium">{insight}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Real Backend AI Analysis - {new Date().toLocaleTimeString()}
                  </p>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="text-6xl mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎯
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">No AI Insights Yet</h3>
                <p className="text-gray-600 mb-4">
                  {backendStatus === 'connected' 
                    ? 'Track a mood to see real AI analysis here' 
                    : 'Backend connection needed for real insights'
                  }
                </p>
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Status:</strong> {getBackendStatusText()}
                    {backendStatus === 'connected' && ' - Ready for real AI analysis!'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </AnimatePresence>
      </motion.div>

      {/* Enhanced Analytics Summary with Staggered Cards */}
      {analytics && (
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            Analytics Summary
          </h3>
          <StaggeredCards className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div 
              className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {analytics.total_entries}
              </div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </motion.div>
            <motion.div 
              className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="text-3xl font-bold text-green-600 mb-1">
                {analytics.average_score}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </motion.div>
            <motion.div 
              className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="text-3xl font-bold text-yellow-600 capitalize mb-1">
                {analytics.mood_trend}
              </div>
              <div className="text-sm text-gray-600">Mood Trend</div>
            </motion.div>
            <motion.div 
              className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="text-3xl font-bold text-red-600 mb-1">
                {analytics.crisis_incidents}
              </div>
              <div className="text-sm text-gray-600">Crisis Incidents</div>
            </motion.div>
          </StaggeredCards>
          
          {/* Enhanced Most Common Emotions with Staggered Animation */}
          {analytics.most_common_emotions && analytics.most_common_emotions.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-4 text-gray-700 flex items-center">
                <span className="mr-2">🎭</span>
                Most Common Emotions
              </h4>
              <motion.div 
                className="flex flex-wrap gap-3"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {analytics.most_common_emotions.map((emotion, index) => (
                  <motion.span 
                    key={index}
                    className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      show: { opacity: 1, scale: 1 }
                    }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {emotion.emotion} ({emotion.count})
                  </motion.span>
                ))}
              </motion.div>
            </div>
          )}
        </motion.div>
      )}

      {/* Enhanced Real Mood History with Staggered Animations */}
      {moodHistory.length > 0 && (
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📝</span>
            Recent Mood Entries
          </h3>
          <motion.div 
            className="space-y-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            {moodHistory.slice(0, 5).map((entry, index) => (
              <motion.div 
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 }
                }}
                whileHover={{ x: 5, scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-4">
                  <motion.span 
                    className="text-3xl"
                    whileHover={{ scale: 1.3, rotate: 15 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {entry.score >= 7 ? '😊' : entry.score >= 4 ? '😐' : '😔'}
                  </motion.span>
                  <div>
                    <div className="font-semibold text-lg">Score: {entry.score}/10</div>
                    <div className="text-sm text-gray-600">
                      Emotions: {entry.emotions?.join(', ') || 'None recorded'}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                  {new Date(entry.created_at).toLocaleString()}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced Debug Information */}
      <motion.div 
        className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🔧</span>
          System Debug Information
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p><strong>Backend Status:</strong> 
              <motion.span 
                className={`ml-2 px-2 py-1 rounded text-xs ${
                  backendStatus === 'connected' ? 'bg-green-100 text-green-800' : 
                  backendStatus === 'offline' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 }}
              >
                {backendStatus}
              </motion.span>
            </p>
            <p><strong>Authentication:</strong> {isAuthenticated ? '✅ Logged in' : '❌ Not logged in'}</p>
            <p><strong>Mood Entries:</strong> <span className="text-blue-600 font-semibold">{moodHistory.length}</span> found</p>
            <p><strong>Analytics:</strong> {analytics ? '✅ Loaded' : '❌ Not loaded'}</p>
          </div>
          <div className="space-y-2">
            <p><strong>Last Entry:</strong> {lastMoodEntry ? new Date(lastMoodEntry.created_at).toLocaleString() : 'None'}</p>
            <p><strong>Real Analysis:</strong> {realtimeAnalysis ? '✅ Available' : '❌ No data'}</p>
            <p><strong>AI Insights Count:</strong> <span className="text-purple-600 font-semibold">{getAIInsights().length}</span></p>
            <p><strong>Data Source:</strong> 
              <motion.span 
                className={`ml-2 px-2 py-1 rounded text-xs ${
                  backendStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.4 }}
              >
                {backendStatus === 'connected' ? 'Live Backend' : 'Mock/Offline'}
              </motion.span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AIInsightsDashboard