import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Heart, 
  AlertCircle,
  Lightbulb,
  RefreshCw,
  Sparkles
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const AIInsightWidget = ({ user }) => {
  const [insights, setInsights] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [moodAnalysis, setMoodAnalysis] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchAIInsights()
      fetchAIRecommendations()
    }
  }, [user])

  const fetchAIInsights = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/api/ai/mood-insights`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
        setMoodAnalysis(data.mood_analysis || {})
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error)
      setError('Unable to load AI insights')
    }
  }

  const fetchAIRecommendations = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/api/ai/recommendations`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Error fetching AI recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />
      case 'stable':
        return <Minus className="w-5 h-5 text-blue-500" />
      default:
        return <Heart className="w-5 h-5 text-gray-500" />
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving':
        return 'from-green-500 to-emerald-500'
      case 'declining':
        return 'from-red-500 to-pink-500'
      case 'stable':
        return 'from-blue-500 to-indigo-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-center h-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-8 h-8 text-blue-500" />
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"
            whileHover={{ scale: 1.05 }}
          >
            <Brain className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Insights</h3>
            <p className="text-gray-600 text-sm">Personalized analysis for you</p>
          </div>
        </div>
        
        <motion.button
          onClick={() => {
            setIsLoading(true)
            fetchAIInsights()
            fetchAIRecommendations()
          }}
          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Mood Analysis Summary */}
      {moodAnalysis.average_score && (
        <motion.div
          className={`mb-6 p-4 bg-gradient-to-r ${getTrendColor(moodAnalysis.trend)} rounded-xl text-white`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                {getTrendIcon(moodAnalysis.trend)}
                <span className="font-semibold text-lg">
                  Mood Score: {moodAnalysis.average_score}/10
                </span>
              </div>
              <p className="text-sm opacity-90">
                Trend: {moodAnalysis.trend} • {moodAnalysis.data_points} entries analyzed
              </p>
            </div>
            <motion.div
              className="text-3xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {moodAnalysis.average_score >= 7 ? '😊' : 
               moodAnalysis.average_score >= 5 ? '😐' : '😔'}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h4 className="font-semibold text-gray-900">AI Analysis</h4>
          </div>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="p-1 bg-purple-100 rounded-full mt-0.5">
                  <Brain className="w-3 h-3 text-purple-600" />
                </div>
                <p className="text-sm text-purple-800 leading-relaxed">{insight}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <h4 className="font-semibold text-gray-900">AI Recommendations</h4>
          </div>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((rec, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Sparkles className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800 leading-relaxed">{rec}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {insights.length === 0 && recommendations.length === 0 && !error && (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="font-semibold text-gray-600 mb-2">No AI Insights Yet</h4>
          <p className="text-gray-500 text-sm">
            Track your mood regularly to unlock personalized AI insights and recommendations!
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <h4 className="font-semibold text-red-600 mb-2">Unable to Load AI Insights</h4>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
    </motion.div>
  )
}

export default AIInsightWidget