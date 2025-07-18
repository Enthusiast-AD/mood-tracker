import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, MessageCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export const AIAssistantButton = ({ onClick, hasNewRecommendations = false }) => {
  const { user } = useAuth()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
      aria-label="Open AI Chat"
      style={{ zIndex: 9999 }} // Highest z-index to stay above everything
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Notification Badge */}
      {hasNewRecommendations && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles className="w-3 h-3" />
        </motion.div>
      )}

      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full opacity-0"
        animate={{ 
          opacity: isHovered ? 0.8 : 0,
          rotate: isHovered ? 180 : 0
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Icon with animation */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        animate={{ 
          rotate: isHovered ? [0, -10, 10, 0] : 0,
          scale: isHovered ? 1.1 : 1
        }}
        transition={{ duration: 0.5 }}
      >
        <Brain className="w-8 h-8" />
      </motion.div>

      {/* Tooltip */}
      <motion.div
        className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap opacity-0 pointer-events-none"
        animate={{ 
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 10
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-4 h-4" />
          <span>Chat with AI Assistant</span>
        </div>
        {user && (
          <div className="text-xs opacity-75 mt-1">
            Personalized for {user.full_name || user.username}
          </div>
        )}
        
        {/* Tooltip Arrow */}
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800" />
      </motion.div>

      {/* Pulse Animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-75"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.7, 0, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.button>
  )
}

export default AIAssistantButton