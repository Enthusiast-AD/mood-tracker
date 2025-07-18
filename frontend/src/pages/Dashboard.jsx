import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useMood } from '../contexts/MoodContext'
import AIInsightsDashboard from '../components/dashboard/AIInsightsDashboard'
import AIAssistantChat from '../components/ai/AIAssistantChat'
import { AIAssistantButton } from '../components/ai/AIAssistantButton'
import AIInsightWidget from '../components/ai/AIInsightWidget'
import QuickActionsWidget from '../components/dashboard/QuickActionsWidget'
import { DashboardSkeleton } from '../components/ui/LoadingStates'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Brain,
  Shield,
  Activity
} from 'lucide-react'
import Footer from '../components/layout/Footer'

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const { isLoading, moods } = useMood() // Add moods to destructuring
  const [showAIChat, setShowAIChat] = useState(false)

  // Update loading condition to check for both loading state and data
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // Auth Check
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
            className="mb-8 mt-8 text-center"
            variants={itemVariants}
          >
            <div className="flex flex-col items-center justify-center">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mb-4"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1, 1]
                }}
                transition={{
                  rotate: {
                    duration: 15,
                    ease: "linear",
                    repeat: Infinity
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }
                }}
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 inline-block text-transparent bg-clip-text">
                  Hello, {user?.full_name?.split(' ')[0] || user?.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Welcome back to your mental health dashboard
                </p>
              </div>
            </div>
          </motion.div>

          {/* Status Cards */}


          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              className="lg:col-span-2"
              variants={itemVariants}
            >
              <AIInsightsDashboard moods={moods} /> {/* Pass moods data */}
            </motion.div>

            <motion.div
              className="space-y-6"
              variants={itemVariants}
            >
              <AIInsightWidget user={user} moods={moods} /> {/* Pass moods data */}
              <QuickActionsWidget onChatClick={() => setShowAIChat(true)} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* AI Chat Components */}
      {isAuthenticated && showAIChat && (
        <AIAssistantChat
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
          user={user}
        />
      )}

      {/* Floating AI Button */}
      <div className="fixed bottom-6 right-6">
        <AIAssistantButton onClick={() => setShowAIChat(true)} />
      </div>

      <Footer />
    </>
  )
}

export default Dashboard