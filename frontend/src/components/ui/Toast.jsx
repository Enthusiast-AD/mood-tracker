/**
 * Simple Toast System - Mental Health AI (No Theme Dependencies)
 * Author: Enthusiast-AD
 * Date: 2025-07-04 09:42:20 UTC
 * Fixed to work without ThemeProvider
 */

import React, { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, ...toast, createdAt: Date.now() }

    setToasts(prev => [...prev, newToast])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options })
  }

  const value = { toast, toasts, removeToast }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

const ToastItem = ({ toast, onRemove }) => {
  // Removed useTheme dependency - using simple static styles
  
  const getToastStyles = () => {
    const baseStyles = 'p-4 rounded-lg shadow-lg border backdrop-blur-sm animate-slide-in'
    
    const typeStyles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    }

    return `${baseStyles} ${typeStyles[toast.type] || typeStyles.info}`
  }

  const getIcon = () => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }
    return icons[toast.type] || icons.info
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start space-x-3">
        <div className="text-xl">{getIcon()}</div>
        <div className="flex-1">
          <div className="text-sm font-medium">{toast.message}</div>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-current opacity-50 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>
      
      {/* Simple slide-in animation with CSS */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ToastProvider