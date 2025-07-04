/**
 * Animated Progress Component - Mental Health AI
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:36:52 UTC
 * Beautiful progress bars with animations
 */

import React, { useEffect, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const Progress = ({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = true,
  showPercentage = true,
  animated = true,
  striped = false,
  gradient = true,
  mood = null,
  className = ''
}) => {
  const [animatedValue, setAnimatedValue] = useState(0)
  const { reducedMotion } = useTheme()

  useEffect(() => {
    if (reducedMotion) {
      setAnimatedValue(value)
    } else {
      const timer = setTimeout(() => {
        setAnimatedValue(value)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [value, reducedMotion])

  const percentage = Math.min(Math.max((animatedValue / max) * 100, 0), 100)

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  }

  const variantClasses = {
    primary: 'from-blue-500 to-blue-600',
    secondary: 'from-green-500 to-green-600',
    success: 'from-emerald-500 to-emerald-600',
    warning: 'from-amber-500 to-amber-600',
    danger: 'from-red-500 to-red-600',
    info: 'from-cyan-500 to-cyan-600'
  }

  const moodClasses = {
    excellent: 'from-emerald-400 to-teal-500',
    good: 'from-cyan-400 to-blue-500',
    neutral: 'from-violet-400 to-purple-500',
    challenging: 'from-amber-400 to-orange-500',
    difficult: 'from-red-400 to-pink-500'
  }

  const getProgressColor = () => {
    if (mood && moodClasses[mood]) {
      return moodClasses[mood]
    }
    return variantClasses[variant]
  }

  const getStatusMessage = () => {
    if (mood) {
      const messages = {
        excellent: 'Excellent progress! 🌟',
        good: 'Good work! 😊',
        neutral: 'Keep going! 💪',
        challenging: 'You can do this! 🌅',
        difficult: 'Take it one step at a time 🤗'
      }
      return messages[mood]
    }
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Percentage */}
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {showLabel && (
            <span className="font-medium text-gray-700">
              {getStatusMessage() || 'Progress'}
            </span>
          )}
          {showPercentage && (
            <span className="text-gray-500">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div className={`
        relative bg-gray-200 rounded-full overflow-hidden
        ${sizeClasses[size]}
      `}>
        {/* Progress Bar Fill */}
        <div
          className={`
            h-full rounded-full transition-all duration-700 ease-out
            ${gradient ? `bg-gradient-to-r ${getProgressColor()}` : `bg-${variant}-500`}
            ${animated && !reducedMotion ? 'transform-gpu' : ''}
            ${striped ? 'bg-striped' : ''}
            relative overflow-hidden
          `}
          style={{ width: `${percentage}%` }}
        >
          {/* Animated Shimmer Effect */}
          {animated && !reducedMotion && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -skew-x-12 animate-shimmer" />
          )}
          
          {/* Striped Pattern */}
          {striped && (
            <div className="absolute inset-0 bg-stripes opacity-20" />
          )}
        </div>

        {/* Glow Effect */}
        {percentage > 0 && mood && !reducedMotion && (
          <div className={`
            absolute inset-0 rounded-full blur-sm opacity-50
            bg-gradient-to-r ${getProgressColor()}
          `} style={{ width: `${percentage}%` }} />
        )}
      </div>

      {/* Value Display */}
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>{animatedValue}</span>
          <span>{max}</span>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .bg-striped {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 8px,
            rgba(255, 255, 255, 0.1) 8px,
            rgba(255, 255, 255, 0.1) 16px
          );
        }
        
        .bg-stripes {
          background-image: repeating-linear-gradient(
            45deg,
            rgba(0, 0, 0, 0.1),
            rgba(0, 0, 0, 0.1) 8px,
            transparent 8px,
            transparent 16px
          );
        }
      `}</style>
    </div>
  )
}

// Circular Progress Variant
Progress.Circle = ({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'primary',
  showPercentage = true,
  children,
  className = ''
}) => {
  const [animatedValue, setAnimatedValue] = useState(0)
  const { reducedMotion } = useTheme()

  useEffect(() => {
    if (reducedMotion) {
      setAnimatedValue(value)
    } else {
      const timer = setTimeout(() => {
        setAnimatedValue(value)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [value, reducedMotion])

  const percentage = Math.min(Math.max((animatedValue / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const colors = {
    primary: '#3b82f6',
    secondary: '#22c55e',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4'
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <span className="text-2xl font-bold text-gray-900">
            {Math.round(percentage)}%
          </span>
        ))}
      </div>
    </div>
  )
}

export default Progress