/**
 * Loading States & Skeletons - Mental Health AI
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:41:39 UTC
 * Beautiful loading experiences with accessibility
 */

import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'

// Spinner Component
export const Spinner = ({
  size = 'md',
  variant = 'primary',
  mood = null,
  className = ''
}) => {
  const { reducedMotion } = useTheme()

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const variantClasses = {
    primary: 'border-blue-600',
    secondary: 'border-green-600',
    white: 'border-white',
    gray: 'border-gray-600'
  }

  const moodClasses = {
    excellent: 'border-emerald-500',
    good: 'border-cyan-500',
    neutral: 'border-violet-500',
    challenging: 'border-amber-500',
    difficult: 'border-red-500'
  }

  const getSpinnerClass = () => {
    let borderClass = variantClasses[variant]
    if (mood && moodClasses[mood]) {
      borderClass = moodClasses[mood]
    }

    return `${sizeClasses[size]} ${borderClass} ${className}`
  }

  return (
    <div
      className={`
        ${getSpinnerClass()}
        border-2 border-t-transparent rounded-full
        ${!reducedMotion ? 'animate-spin' : ''}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Pulse Loader
export const PulseLoader = ({
  size = 'md',
  variant = 'primary',
  count = 3,
  className = ''
}) => {
  const { reducedMotion } = useTheme()

  const sizeClasses = {
    xs: 'w-1 h-1',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6'
  }

  const variantClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-green-600',
    white: 'bg-white',
    gray: 'bg-gray-600'
  }

  return (
    <div className={`flex space-x-1 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`
            ${sizeClasses[size]} ${variantClasses[variant]}
            rounded-full
            ${!reducedMotion ? 'animate-pulse' : ''}
          `}
          style={{
            animationDelay: !reducedMotion ? `${index * 0.2}s` : '0s'
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Skeleton Components
export const Skeleton = ({
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded',
  animated = true,
  className = ''
}) => {
  const { reducedMotion } = useTheme()

  return (
    <div
      className={`
        ${width} ${height} ${rounded}
        bg-gray-200
        ${animated && !reducedMotion ? 'animate-pulse' : ''}
        ${className}
      `}
      role="status"
      aria-label="Loading content"
    />
  )
}

// Card Skeleton
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 space-y-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <Skeleton width="w-12" height="h-12" rounded="rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton width="w-3/4" height="h-4" />
          <Skeleton width="w-1/2" height="h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton width="w-full" height="h-4" />
        <Skeleton width="w-full" height="h-4" />
        <Skeleton width="w-2/3" height="h-4" />
      </div>
      <div className="flex space-x-2">
        <Skeleton width="w-20" height="h-8" rounded="rounded-lg" />
        <Skeleton width="w-16" height="h-8" rounded="rounded-lg" />
      </div>
    </div>
  )
}

// Dashboard Skeleton
export const DashboardSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="text-center space-y-3">
        <Skeleton width="w-80 mx-auto" height="h-8" />
        <Skeleton width="w-60 mx-auto" height="h-4" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-4">
          <Skeleton width="w-40" height="h-6" />
          <Skeleton width="w-full" height="h-64" rounded="rounded-lg" />
        </div>
      </div>

      {/* List Skeleton */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <Skeleton width="w-32" height="h-6" />
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 py-3">
            <Skeleton width="w-10" height="h-10" rounded="rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton width="w-3/4" height="h-4" />
              <Skeleton width="w-1/2" height="h-3" />
            </div>
            <Skeleton width="w-16" height="h-6" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Loading Overlay
export const LoadingOverlay = ({
  visible = false,
  message = 'Loading...',
  variant = 'primary',
  blur = true,
  className = ''
}) => {
  if (!visible) return null

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center
      bg-black bg-opacity-50
      ${blur ? 'backdrop-blur-sm' : ''}
      ${className}
    `}>
      <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-sm mx-4">
        <div className="mb-4 flex justify-center">
          <Spinner size="lg" variant={variant} />
        </div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Progressive Loading Button
export const LoadingButton = ({
  loading = false,
  children,
  loadingText = 'Loading...',
  variant = 'primary',
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-green-600 hover:bg-green-700 text-white',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }

  return (
    <button
      disabled={isDisabled}
      className={`
        relative px-4 py-2 rounded-lg font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" variant={variant === 'outline' ? 'primary' : 'white'} />
        </div>
      )}
      
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {loading ? loadingText : children}
      </span>
    </button>
  )
}

// Mood Loading Animation
export const MoodLoadingAnimation = ({ mood = 'neutral', className = '' }) => {
  const { reducedMotion } = useTheme()

  const moodEmojis = {
    excellent: '🌟',
    good: '😊',
    neutral: '😐',
    challenging: '🌅',
    difficult: '🤗'
  }

  const moodColors = {
    excellent: 'text-emerald-500',
    good: 'text-cyan-500',
    neutral: 'text-violet-500',
    challenging: 'text-amber-500',
    difficult: 'text-red-500'
  }

  return (
    <div className={`text-center ${className}`}>
      <div className={`
        text-6xl mb-4
        ${!reducedMotion ? 'animate-bounce' : ''}
      `}>
        {moodEmojis[mood]}
      </div>
      <div className={`
        text-lg font-medium ${moodColors[mood]}
        ${!reducedMotion ? 'animate-pulse' : ''}
      `}>
        Analyzing your mood...
      </div>
    </div>
  )
}