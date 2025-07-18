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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md mx-4 border border-gray-200 dark:border-gray-700"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
        <motion.div
          className="max-w-7xl mx-auto px-4 py-6"
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
          </motion.div>

          {/* Status Cards */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
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
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Features */}
            <motion.div
              className="lg:col-span-2"
              variants={itemVariants}
            >
              <AIInsightsDashboard />
            </motion.div>

            {/* Right Column - AI Widget & Quick Actions */}
            <motion.div
              className="space-y-6"
              variants={itemVariants}
            >
              <AIInsightWidget user={user} />
              <QuickActionsWidget onChatClick={() => setShowAIChat(true)} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default Dashboard