/**
 * Enhanced Dashboard - Day 4 Database Connected
 * Author: Enthusiast-AD
 * Date: 2025-07-03 14:48:46 UTC
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useMood } from '../contexts/MoodContext'

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const { 
    moodHistory, 
    analytics, 
    insights, 
    crisisIncidents,
    isLoading, 
    websocket,
    realtimeAnalysis,
    refreshData,
    getMoodTrend,
    getAverageMood
  } = useMood()

  const [selectedPeriod, setSelectedPeriod] = useState(30)

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your personalized dashboard.
          </p>
          <Link 
            to="/auth/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const getRecentMood = () => {
    if (moodHistory.length === 0) return { score: 5, emoji: '😐', color: 'text-gray-600' }
    
    const recent = moodHistory[0]
    const score = recent.score
    
    let emoji, color
    if (score >= 8) { emoji = '🤩'; color = 'text-green-600' }
    else if (score >= 6) { emoji = '😊'; color = 'text-green-500' }
    else if (score >= 4) { emoji = '😐'; color = 'text-yellow-500' }
    else if (score >= 2) { emoji = '😔'; color = 'text-orange-500' }
    else { emoji = '😢'; color = 'text-red-500' }
    
    return { score, emoji, color, timestamp: recent.created_at }
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
  const trend = getMoodTrend()
  const averageMood = getAverageMood()

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
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.full_name || user?.username}! 👋
        </h1>
        <p className="text-gray-600">
          Your AI-powered mental health dashboard with real-time insights
          {websocket && <span className="text-green-600 ml-2">🟢 Live</span>}
        </p>
      </div>

      {/* Real-time Analysis Alert */}
      {realtimeAnalysis && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">🤖 Real-time Analysis Active</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Current Sentiment:</span> 
              <span className="capitalize ml-1">{realtimeAnalysis.sentiment}</span>
            </div>
            <div>
              <span className="font-medium">Energy Level:</span> 
              <span className="capitalize ml-1">{realtimeAnalysis.energy_estimate}</span>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> 
              <span className="ml-1">{formatDate(realtimeAnalysis.timestamp)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
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
            <div className="text-4xl mb-3">{getTrendEmoji(trend)}</div>
            <div className={`text-lg font-semibold ${getTrendColor(trend)}`}>
              {trend.charAt(0).toUpperCase() + trend.slice(1).replace('_', ' ')}
            </div>
            <div className="text-gray-500 text-sm mt-2">
              Based on recent entries
            </div>
          </div>
        </div>

        {/* Average Mood */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Average Mood</h2>
          <div className="text-center">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-3xl font-bold text-blue-600">
              {averageMood}/10
            </div>
            <div className="text-gray-500 text-sm mt-2">
              {selectedPeriod} day average
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
              onClick={refreshData}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg font-semibold transition-colors"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">📊 Analytics Summary</h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.total_entries}</div>
              <div className="text-gray-600">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.average_score}</div>
              <div className="text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${analytics.crisis_incidents > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {analytics.crisis_incidents}
              </div>
              <div className="text-gray-600">Crisis Incidents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.most_common_emotions?.length || 0}
              </div>
              <div className="text-gray-600">Emotions Tracked</div>
            </div>
          </div>

          {/* Most Common Emotions */}
          {analytics.most_common_emotions && analytics.most_common_emotions.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Most Common Emotions</h3>
              <div className="flex flex-wrap gap-2">
                {analytics.most_common_emotions.slice(0, 5).map((emotion, index) => (
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

      {/* AI Insights */}
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

      {/* Crisis Incidents Summary */}
      {crisisIncidents.length > 0 && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-800">🚨 Recent Crisis Incidents</h2>
          <div className="space-y-3">
            {crisisIncidents.slice(0, 3).map((incident, index) => (
              <div key={index} className="bg-white p-4 rounded border">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">Risk Level: {incident.risk_level}</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(incident.created_at)}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    incident.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {incident.resolved ? 'Resolved' : 'Active'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link 
              to="/crisis-support"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              View Crisis Resources
            </Link>
          </div>
        </div>
      )}

      {/* Mood History Visualization */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Mood History</h2>
        {moodHistory.length > 0 ? (
          <div className="space-y-4">
            {/* Simple visualization */}
            <div className="h-64 flex items-end justify-between bg-gray-50 p-4 rounded-lg">
              {moodHistory.slice(0, 14).reverse().map((entry, index) => (
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
                    {formatDate(entry.created_at).split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Recent entries list */}
            <div className="space-y-2">
              <h3 className="font-semibold">Recent Entries:</h3>
              {moodHistory.slice(0, 5).map((entry, index) => (
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
                    {formatDate(entry.created_at)}
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

      {/* Connection Status */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${websocket ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              Real-time Monitoring: {websocket ? 'Connected' : 'Disconnected'}
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