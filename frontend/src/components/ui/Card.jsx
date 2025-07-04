/**
 * Enhanced Card Component - Mental Health AI
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:36:52 UTC
 * Glassmorphism cards with hover effects
 */

import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const Card = ({
  children,
  className = '',
  hover = true,
  glass = false,
  mood = null,
  gradient = false,
  padding = 'lg',
  shadow = 'lg',
  rounded = 'xl',
  glow = false,
  ...props
}) => {
  const { getThemeColors, reducedMotion } = useTheme()
  const colors = getThemeColors()

  const baseClasses = `
    bg-white border border-gray-200 transition-all duration-300
    ${!reducedMotion && hover ? 'hover:shadow-2xl hover:-translate-y-1' : ''}
    ${className}
  `

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl'
  }

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full'
  }

  const moodGradients = {
    excellent: 'bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200',
    good: 'bg-gradient-to-br from-cyan-50 to-blue-100 border-cyan-200',
    neutral: 'bg-gradient-to-br from-violet-50 to-purple-100 border-violet-200',
    challenging: 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200',
    difficult: 'bg-gradient-to-br from-red-50 to-pink-100 border-red-200'
  }

  const getCardClasses = () => {
    let classes = baseClasses
    
    // Padding
    classes += ' ' + paddingClasses[padding]
    
    // Shadow
    classes += ' ' + shadowClasses[shadow]
    
    // Rounded
    classes += ' ' + roundedClasses[rounded]
    
    // Glass effect
    if (glass) {
      classes = classes.replace('bg-white border-gray-200', 'glass')
    }
    
    // Mood gradient
    if (mood && moodGradients[mood]) {
      classes = classes.replace('bg-white border-gray-200', moodGradients[mood])
    }
    
    // Gradient
    if (gradient && !mood) {
      classes = classes.replace('bg-white', 'bg-gradient-to-br from-white to-gray-50')
    }
    
    // Glow effect
    if (glow && mood) {
      const glowColors = {
        excellent: 'hover:shadow-emerald-500/20',
        good: 'hover:shadow-cyan-500/20',
        neutral: 'hover:shadow-violet-500/20',
        challenging: 'hover:shadow-amber-500/20',
        difficult: 'hover:shadow-red-500/20'
      }
      classes += ' ' + glowColors[mood]
    }
    
    return classes
  }

  return (
    <div className={getCardClasses()} {...props}>
      {children}
    </div>
  )
}

// Card subcomponents
Card.Header = ({ children, className = '', ...props }) => (
  <div className={`mb-6 ${className}`} {...props}>
    {children}
  </div>
)

Card.Title = ({ children, className = '', ...props }) => (
  <h3 className={`text-2xl font-bold text-gray-900 mb-2 ${className}`} {...props}>
    {children}
  </h3>
)

Card.Subtitle = ({ children, className = '', ...props }) => (
  <p className={`text-gray-600 ${className}`} {...props}>
    {children}
  </p>
)

Card.Body = ({ children, className = '', ...props }) => (
  <div className={`flex-1 ${className}`} {...props}>
    {children}
  </div>
)

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`mt-6 pt-6 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
)

export default Card