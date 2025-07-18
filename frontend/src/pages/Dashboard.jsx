import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useMood } from '../contexts/MoodContext'
import AIInsightsDashboard from '../components/dashboard/AIInsightsDashboard'
import AIAssistantChat from '../components/ai/AIAssistantChat'
import AIAssistantButton from '../components/ai/AIAssistantButton'
import AIInsightWidget from '../components/ai/AIInsightWidget'
import QuickActionsWidget from '../components/dashboard/QuickActionsWidget';
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Brain,
  Shield,
  Activity
} from 'lucide-react'

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const { isLoading } = useMood()
  const [showAIChat, setShowAIChat] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
              Please sign in to access your dashboard
            </p>
            <Link
              to="/auth/login"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
        <motion.div 
          className="max-w-7xl mx-auto px-4 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div
            className="mb-8"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Hello, {user?.full_name?.split(' ')[0] || user?.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome back to your mental health dashboard
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-blue-500 bg-clip-text text-transparent">
                Welcome back, {user?.full_name?.split(' ')[0] || user?.username}!
              </span>
            </h1>
            <p className="text-xl text-slate-900 dark:text-slate-50 max-w-2xl mx-auto">
              Your AI-powered mental health companion is here to support you every step of the way 🌟
            </p>
          </motion.div>

          {/* Quick Stats Cards */}
          {/* <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
            variants={itemVariants}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">AI Assistant</p>
                  <p className="font-semibold text-gray-900 dark:text-white">Ready</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Support</p>
                  <p className="font-semibold text-gray-900 dark:text-white">Active</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Chat</p>
                  <p className="font-semibold text-gray-900 dark:text-white">Online</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Insights</p>
                  <p className="font-semibold text-gray-900 dark:text-white">Live</p>
                </div>
              </div>
            </div>
          </motion.div> */}

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Features */}
            <motion.div
              className="lg:col-span-2"
              variants={itemVariants}
            >
              <AIInsightsDashboard />

              {/* Action Cards */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Quick Actions</h2>
                    <p className=" text-slate-900 dark:text-slate-50">Take control of your mental wellness journey</p>
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

            {/* Right Column - AI Widget & Quick Actions */}
            <motion.div
              className="space-y-6"
              variants={itemVariants}
            >
              <AIInsightWidget user={user} />
          
              
              {/* progress card */}
              {/* <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
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
              </div> */}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default Dashboard