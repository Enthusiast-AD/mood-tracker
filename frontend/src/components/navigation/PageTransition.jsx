/**
 * Page Transition Component - Mental Health AI
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:47:21 UTC
 * Smooth page transitions with loading states
 */

import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { Spinner } from '../ui/Loading'

const PageTransition = ({ children, className = '' }) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentPath, setCurrentPath] = useState('')
  const location = useLocation()
  const { reducedMotion, moodTheme } = useTheme()

  useEffect(() => {
    if (location.pathname !== currentPath) {
      if (!reducedMotion) {
        setIsTransitioning(true)
        
        // Transition timing
        setTimeout(() => {
          setCurrentPath(location.pathname)
          setTimeout(() => {
            setIsTransitioning(false)
          }, 150)
        }, 150)
      } else {
        setCurrentPath(location.pathname)
      }
    }
  }, [location.pathname, currentPath, reducedMotion])

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`relative ${className}`}>
      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <Spinner 
              size="lg" 
              mood={moodTheme}
              className="mb-4" 
            />
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}>
        {children}
      </div>
    </div>
  )
}

export default PageTransition