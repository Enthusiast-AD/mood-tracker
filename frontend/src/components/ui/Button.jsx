/**
 * Enhanced Button Component - Mental Health AI
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:36:52 UTC
 * Beautiful, accessible buttons with micro-interactions
 */

import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  mood = null,
  glow = false,
  onClick,
  className = '',
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false)
  const { getThemeColors, reducedMotion } = useTheme()
  const colors = getThemeColors()

  const baseClasses = `
    relative inline-flex items-center justify-center
    font-medium rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${!reducedMotion ? 'transform hover:scale-105' : ''}
    ${className}
  `

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
      text-white border-transparent shadow-lg hover:shadow-xl
      focus:ring-blue-500
      ${glow ? 'shadow-blue-500/25 hover:shadow-blue-500/40' : ''}
    `,
    secondary: `
      bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800
      text-white border-transparent shadow-lg hover:shadow-xl
      focus:ring-green-500
      ${glow ? 'shadow-green-500/25 hover:shadow-green-500/40' : ''}
    `,
    outline: `
      bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300
      hover:border-gray-400 focus:ring-gray-500
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 text-gray-700 border-transparent
      focus:ring-gray-500
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800
      text-white border-transparent shadow-lg hover:shadow-xl
      focus:ring-red-500
      ${glow ? 'shadow-red-500/25 hover:shadow-red-500/40' : ''}
    `,
    success: `
      bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800
      text-white border-transparent shadow-lg hover:shadow-xl
      focus:ring-emerald-500
      ${glow ? 'shadow-emerald-500/25 hover:shadow-emerald-500/40' : ''}
    `
  }

  const moodClasses = {
    excellent: `
      bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700
      text-white border-transparent shadow-lg hover:shadow-xl
      focus:ring-emerald-500 shadow-emerald-500/25
    `,
    good: `
      bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700
      text-white border-transparent shadow-lg hover:shadow-xl
      focus:ring-cyan-500 shadow-cyan-500/25
    `,
    neutral: `
      bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700
      text-white border-transparent shadow-lg hover:shadow-xl
      focus:ring-violet-500 shadow-violet-500/25
    `,
    challenging: `
      bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700
      text-white border-transparent shadow-lg hover:shadow-xl
      focus:ring-amber-500 shadow-amber-500/25
    `,
    difficult: `
      bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700
      text-white border-transparent shadow-lg hover:shadow-xl
      focus:ring-red-500 shadow-red-500/25
    `
  }

  const getButtonClasses = () => {
    let classes = baseClasses + ' ' + sizeClasses[size]
    
    if (mood && moodClasses[mood]) {
      classes += ' ' + moodClasses[mood]
    } else {
      classes += ' ' + variantClasses[variant]
    }
    
    return classes
  }

  const handleClick = (e) => {
    if (disabled || loading) return
    
    // Ripple effect
    if (!reducedMotion) {
      const button = e.currentTarget
      const ripple = document.createElement('span')
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      ripple.style.width = ripple.style.height = size + 'px'
      ripple.style.left = x + 'px'
      ripple.style.top = y + 'px'
      ripple.classList.add('ripple')
      
      const existingRipple = button.querySelector('.ripple')
      if (existingRipple) {
        existingRipple.remove()
      }
      
      button.appendChild(ripple)
      
      setTimeout(() => {
        ripple.remove()
      }, 600)
    }
    
    onClick?.(e)
  }

  return (
    <button
      className={getButtonClasses()}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        </div>
      )}
      
      {/* Content */}
      <div className={`flex items-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </div>
      
      {/* Ripple Effect Styles */}
      <style jsx>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          animation: ripple-animation 0.6s linear;
          pointer-events: none;
        }
        
        @keyframes ripple-animation {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  )
}

export default Button