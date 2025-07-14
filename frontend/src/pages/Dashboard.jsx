import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useMood } from '../contexts/MoodContext'
import AIInsightsDashboard from '../components/dashboard/AIInsightsDashboard'
import AIAssistantChat from '../components/ai/AIAssistantChat'
import AIAssistantButton from '../components/ai/AIAssistantButton'
import AIInsightWidget from '../components/ai/AIInsightWidget'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MessageCircle, 
  TrendingUp, 
  Brain, 
  Heart,
  BarChart3,
  Calendar,
  Shield,
  Plus,
  Activity,
  Zap,
  Target,
  Award,
  Clock
} from 'lucide-react'

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const { isLoading } = useMood()
  const [showAIChat, setShowAIChat] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div 
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-gray-600 mb-8">
              Please sign in to access your personalized AI mental health dashboard
            </p>
            <Link 
              to="/auth/login"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <Brain className="w-5 h-5" />
              <span>Sign In to Continue</span>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Your AI Dashboard</h3>
          <p className="text-gray-500">Preparing personalized insights...</p>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <motion.div 
          className="max-w-7xl mx-auto px-4 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                className="p-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome back, {user?.full_name?.split(' ')[0] || user?.username}!
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Your AI-powered mental health companion is here to support you every step of the way 🌟
            </p>
          </motion.div>

          {/* Quick Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
            variants={itemVariants}
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-800 dark:to-blue-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">AI Assistant</p>
                  <p className="text-2xl font-bold">Ready</p>
                </div>
                <Brain className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-800 dark:to-green-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Crisis Support</p>
                  <p className="text-2xl font-bold">Active</p>
                </div>
                <Shield className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-800 dark:to-purple-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">AI Chat</p>
                  <p className="text-2xl font-bold">Enabled</p>
                </div>
                <MessageCircle className="w-8 h-8 text-purple-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 dark:from-pink-800 dark:to-pink-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">Insights</p>
                  <p className="text-2xl font-bold">Live</p>
                </div>
                <Activity className="w-8 h-8 text-pink-200" />
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Main Features */}
            <motion.div 
              className="lg:col-span-2 space-y-8"
              variants={itemVariants}
            >
              {/* AI Insights Dashboard */}
              <AIInsightsDashboard />

              {/* Action Cards */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                    <p className="text-gray-600">Take control of your mental wellness journey</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link 
                    to="/mood-check"
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                  >
                    <div className="relative z-10">
                      <Heart className="w-8 h-8 mb-4" />
                      <h3 className="font-bold text-lg mb-2">Track Mood</h3>
                      <p className="text-sm opacity-90">Record how you're feeling right now</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                  
                  <button
                    onClick={() => setShowAIChat(true)}
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                  >
                    <div className="relative z-10">
                      <Brain className="w-8 h-8 mb-4" />
                      <h3 className="font-bold text-lg mb-2">Chat with AI</h3>
                      <p className="text-sm opacity-90">Get personalized support & insights</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                  
                  <Link 
                    to="/crisis-support"
                    className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                  >
                    <div className="relative z-10">
                      <Shield className="w-8 h-8 mb-4" />
                      <h3 className="font-bold text-lg mb-2">Crisis Support</h3>
                      <p className="text-sm opacity-90">24/7 help when you need it most</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Right Column - AI Widget & Stats */}
            <motion.div 
              className="space-y-8"
              variants={itemVariants}
            >
              <AIInsightWidget user={user} />
          
              
              {/* progress card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center mb-4">
                  <Award className="w-6 h-6 text-yellow-500 dark:text-yellow-400 mr-3" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Progress</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-100">AI Insights</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Personalized analysis ready</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40 rounded-xl border border-green-100 dark:border-green-800">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center mr-3">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">Safe Space</p>
                        <p className="text-sm text-green-700 dark:text-green-300">Crisis support active</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40 rounded-xl border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center mr-3">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-purple-900 dark:text-purple-100">Voice Ready</p>
                        <p className="text-sm text-purple-700 dark:text-purple-300">Chat with voice enabled</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* AI Assistant Chat Modal */}
      {showAIChat && (
        <AIAssistantChat
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
          user={user}
        />
      )}

      {/* Fixed Z-Index Floating AI Assistant Button */}
      {!showAIChat && (
        <div className="fixed bottom-6 right-6" style={{ zIndex: 9999 }}>
          <AIAssistantButton 
            onClick={() => setShowAIChat(true)}
            hasNewRecommendations={false}
          />
        </div>
      )}
    </>
  )
}

export default Dashboard