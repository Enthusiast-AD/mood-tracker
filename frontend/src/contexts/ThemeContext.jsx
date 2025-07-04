/**
 * Advanced Theme Provider - Mental Health AI
 * Author: Enthusiast-AD  
 * Date: 2025-07-03 15:31:57 UTC
 * Mood-responsive theming with accessibility features
 */

import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')
  const [accentColor, setAccentColor] = useState('blue')
  const [moodTheme, setMoodTheme] = useState(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') || 'light'
    const savedAccent = localStorage.getItem('accentColor') || 'blue'
    const savedMoodTheme = localStorage.getItem('moodTheme')
    
    setTheme(savedTheme)
    setAccentColor(savedAccent)
    if (savedMoodTheme) {
      setMoodTheme(savedMoodTheme)
    }

    // Check system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    setReducedMotion(prefersReducedMotion)
    setHighContrast(prefersHighContrast)
    
    // Auto-switch to dark mode if no saved preference and system prefers dark
    if (!localStorage.getItem('theme') && prefersDark) {
      setTheme('dark')
    }

    // Listen for system changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    const colorQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleMotionChange = (e) => setReducedMotion(e.matches)
    const handleContrastChange = (e) => setHighContrast(e.matches)
    const handleColorChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    motionQuery.addEventListener('change', handleMotionChange)
    contrastQuery.addEventListener('change', handleContrastChange)
    colorQuery.addEventListener('change', handleColorChange)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      contrastQuery.removeEventListener('change', handleContrastChange)
      colorQuery.removeEventListener('change', handleColorChange)
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', accentColor)
    
    if (moodTheme) {
      document.documentElement.setAttribute('data-mood-theme', moodTheme)
    } else {
      document.documentElement.removeAttribute('data-mood-theme')
    }

    if (reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true')
    } else {
      document.documentElement.removeAttribute('data-reduced-motion')
    }

    if (highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true')
    } else {
      document.documentElement.removeAttribute('data-high-contrast')
    }

    // Save preferences
    localStorage.setItem('theme', theme)
    localStorage.setItem('accentColor', accentColor)
    if (moodTheme) {
      localStorage.setItem('moodTheme', moodTheme)
    }
  }, [theme, accentColor, moodTheme, reducedMotion, highContrast])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setMoodResponsiveTheme = (moodScore) => {
    // Automatically adjust theme based on mood
    if (moodScore >= 8) {
      setMoodTheme('excellent')
    } else if (moodScore >= 6) {
      setMoodTheme('good')
    } else if (moodScore >= 4) {
      setMoodTheme('neutral')
    } else if (moodScore >= 2) {
      setMoodTheme('challenging')
    } else {
      setMoodTheme('difficult')
    }
  }

  const clearMoodTheme = () => {
    setMoodTheme(null)
    localStorage.removeItem('moodTheme')
  }

  const getThemeColors = () => {
    const colors = {
      light: {
        primary: '#3b82f6',
        secondary: '#22c55e',
        background: '#f9fafb',
        surface: '#ffffff',
        text: '#111827',
        textSecondary: '#6b7280'
      },
      dark: {
        primary: '#60a5fa',
        secondary: '#34d399',
        background: '#111827',
        surface: '#1f2937',
        text: '#f9fafb',
        textSecondary: '#d1d5db'
      }
    }

    const moodColors = {
      excellent: {
        primary: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
      },
      good: {
        primary: '#06b6d4',
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)'
      },
      neutral: {
        primary: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
      },
      challenging: {
        primary: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
      },
      difficult: {
        primary: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
      }
    }

    return {
      ...colors[theme],
      mood: moodTheme ? moodColors[moodTheme] : null
    }
  }

  const value = {
    // State
    theme,
    accentColor,
    moodTheme,
    reducedMotion,
    highContrast,
    
    // Actions
    setTheme,
    toggleTheme,
    setAccentColor,
    setMoodResponsiveTheme,
    clearMoodTheme,
    
    // Utilities
    getThemeColors,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}