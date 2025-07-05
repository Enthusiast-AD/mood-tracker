import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useMood } from '../contexts/MoodContext'
import AIInsightsDashboard from '../components/dashboard/AIInsightsDashboard'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const { isLoading } = useMood()

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your AI-powered mental health dashboard.
          </p>
          <Link 
            to="/auth/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Sign In to Access AI Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your AI-powered mental health dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.full_name || user?.username}! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Your AI-powered mental health companion is ready to help
        </p>
      </div>

      {/* AI Insights Dashboard - Main Feature */}
      <AIInsightsDashboard />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🚀 Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link 
            to="/mood-check"
            className="bg-blue-600 hover:bg-blue-700 text-white text-center py-4 px-6 rounded-lg font-semibold transition-colors block"
          >
            📝 Track New Mood
          </Link>
          <Link 
            to="/crisis-support"
            className="bg-red-600 hover:bg-red-700 text-white text-center py-4 px-6 rounded-lg font-semibold transition-colors block"
          >
            🆘 Crisis Support
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white text-center py-4 px-6 rounded-lg font-semibold transition-colors"
          >
            🔄 Refresh AI Data
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard