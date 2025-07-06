import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const FloatingActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const navigate = useNavigate()

  const actions = [
    {
      icon: '📝',
      label: 'Track Mood',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => navigate('/mood-check')
    },
    {
      icon: '📊',
      label: 'View Dashboard',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => navigate('/dashboard')
    },
    {
      icon: '🆘',
      label: 'Crisis Support',
      color: 'bg-red-500 hover:bg-red-600',
      action: () => navigate('/crisis-support')
    }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-16 right-0 space-y-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                className={`flex items-center space-x-3 ${action.color} text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl group`}
                onClick={() => {
                  action.action()
                  setIsExpanded(false)
                }}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        className={`w-14 h-14 ${isExpanded ? 'bg-gray-600' : 'bg-blue-600'} text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300`}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isExpanded ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.span
          className="text-2xl"
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? '✕' : '🧠'}
        </motion.span>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-20 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default FloatingActionButton