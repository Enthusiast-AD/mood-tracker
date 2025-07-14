import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Heart, 
  Activity,
  Shield,
  Sparkles,
  RefreshCw,
  BarChart3,
  PieChart,
  AlertCircle,
  Zap,
  Target
} from 'lucide-react'
import { showToast } from '../ui/EnhancedToast'
import MoodTrendChart from '../charts/MoodTrendChart'
import EmotionDistributionChart from '../charts/EmotionDistributionChart'

const AIInsightsDashboard = () => {
  const { isAuthenticated } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [moodHistory, setMoodHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState('checking')
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const API_BASE_URL = 'http://localhost:8000'

  useEffect(() => {
    if (isAuthenticated) {
      initializeDashboard()
      
      // Refresh every 2 minutes
      const interval = setInterval(() => {
        refreshData()
      }, 120000)

      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const initializeDashboard = async () => {
    await checkBackendConnection()
    await Promise.all([
      fetchUserAnalytics(),
      fetchMoodHistory()
    ])
    setIsLoading(false)
  }

  const refreshData = async () => {
    await Promise.all([
      fetchUserAnalytics(),
      fetchMoodHistory()
    ])
    setLastRefresh(new Date())
    showToast.success('📊 Dashboard updated!')
  }

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
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/analytics/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Analytics fetch failed:', error)
    }
  }

  const fetchMoodHistory = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/mood/history?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMoodHistory(data.entries || [])
      }
    } catch (error) {
      console.error('Mood history fetch failed:', error)
    }
  }

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'from-green-500 to-emerald-500'
      case 'offline': return 'from-red-500 to-pink-500'
      case 'error': return 'from-yellow-500 to-orange-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return 'AI Backend Online'
      case 'offline': return 'Backend Offline'
      case 'error': return 'Connection Error'
      default: return 'Connecting...'
    }
  }

  const getMoodEmoji = (score) => {
    if (score >= 8) return '😊'
    if (score >= 6) return '🙂'
    if (score >= 4) return '😐'
    if (score >= 2) return '😔'
    return '😢'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 animate-pulse">
          <div className="h-8 bg-white bg-opacity-20 rounded mb-2"></div>
          <div className="h-4 bg-white bg-opacity-20 rounded w-3/4"></div>
        </div>
        
        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Clean Header */}
      <motion.div 
        className={`bg-gradient-to-r ${getStatusColor()} text-white rounded-2xl p-6 shadow-xl`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              className="p-3 bg-white bg-opacity-20 rounded-xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-8 h-8" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold">AI Mental Health Assistant</h1>
              <p className="text-white text-opacity-90">
                Powered by advanced AI with real-time insights
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <motion.div 
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="font-semibold">{getStatusText()}</span>
              </div>
              <p className="text-sm text-white text-opacity-75">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
            
            <motion.button
              onClick={refreshData}
              className="p-3 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Clean Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Sentiment"
          value={analytics?.mood_trend === 'improving' ? 'Positive' : 
                analytics?.mood_trend === 'declining' ? 'Concerning' : 'Neutral'}
          subtitle={`${analytics?.total_entries || 0} entries analyzed`}
          icon={<BarChart3 className="w-6 h-6" />}
          color="blue"
          trend={analytics?.mood_trend}
        />
        
        <MetricCard
          title="Average Mood"
          value={`${analytics?.average_score || 0}/10`}
          subtitle="Last 30 days"
          icon={<Heart className="w-6 h-6" />}
          color="green"
          trend={analytics?.mood_trend}
        />
        
        <MetricCard
          title="Risk Assessment"
          value={analytics?.crisis_incidents > 0 ? 'Elevated' : 'Low'}
          subtitle={`${analytics?.crisis_incidents || 0} incidents`}
          icon={<Shield className="w-6 h-6" />}
          color={analytics?.crisis_incidents > 0 ? 'red' : 'green'}
          trend="stable"
        />
        
        <MetricCard
          title="Tracking Progress"
          value={analytics?.total_entries || 0}
          subtitle="Total mood entries"
          icon={<Target className="w-6 h-6" />}
          color="purple"
          trend="up"
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <MoodTrendChart 
          moodHistory={moodHistory}
          title="30-Day Mood Trend"
        />
        
        <EmotionDistributionChart 
          moodHistory={moodHistory}
          title="Emotion Distribution"
        />
      </div>

      {/* AI Insights Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <InsightsCard insights={analytics?.ai_insights || []} />
        </div>
        
        <div className="space-y-6">
          <RecentMoodsCard moods={moodHistory.slice(0, 3)} />
          <QuickStatsCard analytics={analytics} />
        </div>
      </div>
    </div>
  )
}

// Clean Insights Card
const InsightsCard = ({ insights }) => (
  <motion.div
    className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <div className="flex items-center space-x-2 mb-6">
      <Sparkles className="w-5 h-5 text-purple-500" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Insights</h3>
    </div>
    
    <div className="space-y-4">
      {insights.length > 0 ? (
        insights.map((insight, index) => (
          <motion.div
            key={index}
            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-30 dark:from-indigo-900 dark:to-indigo-850 rounded-lg border-l-4 border-blue-500"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <p className="text-blue-800 dark:text-blue-200 font-medium">{insight}</p>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Track your mood to see AI insights</p>
        </div>
      )}
    </div>
  </motion.div>
)

// Clean Metric Card Component
const MetricCard = ({ title, value, subtitle, icon, color, trend }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 dark:from-blue-800 dark:to-blue-900',
    green: 'from-green-500 to-green-600 dark:from-green-800 dark:to-green-900', 
    red: 'from-red-500 to-red-600 dark:from-red-800 dark:to-red-900',
    purple: 'from-purple-500 to-purple-600 dark:from-purple-800 dark:to-purple-900'
  }

  const getTrendIcon = () => {
    if (trend === 'improving' || trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend === 'declining' || trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-r ${colorClasses[color]} rounded-xl text-white`}>
          {icon}
        </div>
        {getTrendIcon()}
      </div>
      
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
    </motion.div>
  )
}

// Clean Chart Card Component
const ChartCard = ({ title, icon, data, type }) => (
  <motion.div
    className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <div className="flex items-center space-x-2 mb-6">
      {icon}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
    </div>
    
    <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
      {type === 'trend' ? (
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-300">Mood trend visualization</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.length || 0} data points</p>
        </div>
      ) : (
        <div className="text-center">
          <PieChart className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-300">Emotion distribution</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.length || 0} emotions</p>
        </div>
      )}
    </div>
  </motion.div>
)

// Recent Moods Card
const RecentMoodsCard = ({ moods }) => (
  <motion.div
    className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Moods</h3>
    
    <div className="space-y-3">
      {moods.length > 0 ? (
        moods.map((mood, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-2xl">
              {mood.score >= 7 ? '😊' : mood.score >= 4 ? '😐' : '😔'}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{mood.score}/10</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(mood.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent entries</p>
      )}
    </div>
  </motion.div>
)

// Quick Stats Card
const QuickStatsCard = ({ analytics }) => (
  <motion.div
    className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-900 dark:to-purple-900 text-white rounded-xl p-6 shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
  >
    <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
    
    <div className="space-y-3">
      <div className="flex justify-between">
        <span>Total Entries:</span>
        <span className="font-bold">{analytics?.total_entries || 0}</span>
      </div>
      <div className="flex justify-between">
        <span>Average Score:</span>
        <span className="font-bold">{analytics?.average_score || 0}/10</span>
      </div>
      <div className="flex justify-between">
        <span>Trend:</span>
        <span className="font-bold capitalize">{analytics?.mood_trend || 'stable'}</span>
      </div>
    </div>
  </motion.div>
)

export default AIInsightsDashboard