import React from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

// Custom toast component with animations
const CustomToast = ({ message, type, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.95 }}
    className={`
      px-6 py-4 rounded-lg shadow-lg backdrop-blur-sm border
      ${type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
      ${type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
      ${type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
      ${type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
    `}
  >
    <div className="flex items-center space-x-3">
      <motion.span 
        className="text-xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
      >
        {icon}
      </motion.span>
      <span className="font-medium">{message}</span>
    </div>
  </motion.div>
)

// Enhanced toast functions
export const showToast = {
  success: (message) => toast.custom(
    <CustomToast message={message} type="success" icon="🎉" />,
    { duration: 4000, position: 'top-right' }
  ),
  
  error: (message) => toast.custom(
    <CustomToast message={message} type="error" icon="❌" />,
    { duration: 5000, position: 'top-right' }
  ),
  
  warning: (message) => toast.custom(
    <CustomToast message={message} type="warning" icon="⚠️" />,
    { duration: 4000, position: 'top-right' }
  ),
  
  info: (message) => toast.custom(
    <CustomToast message={message} type="info" icon="ℹ️" />,
    { duration: 3000, position: 'top-right' }
  ),
  
  mood: (message) => toast.custom(
    <CustomToast message={message} type="success" icon="🧠" />,
    { duration: 4000, position: 'top-right' }
  ),
  
  ai: (message) => toast.custom(
    <CustomToast message={message} type="info" icon="🤖" />,
    { duration: 4000, position: 'top-right' }
  )
}

// Toaster component with custom styling
const EnhancedToaster = () => (
  <Toaster
    position="top-right"
    gutter={12}
    containerStyle={{
      top: 80,
    }}
    toastOptions={{
      duration: 4000,
      style: {
        background: 'transparent',
        border: 'none',
        padding: 0,
        boxShadow: 'none',
      },
    }}
  />
)

export default EnhancedToaster