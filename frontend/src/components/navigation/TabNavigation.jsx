/**
 * Tab Navigation System - Mental Health AI
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:47:21 UTC
 * Beautiful, accessible tab navigation with animations
 */

import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const TabNavigation = ({
  tabs = [],
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = ''
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState({})
  const tabRefs = useRef({})
  const { moodTheme, reducedMotion } = useTheme()

  useEffect(() => {
    updateIndicator()
  }, [activeTab])

  const updateIndicator = () => {
    const activeTabElement = tabRefs.current[activeTab]
    if (activeTabElement) {
      setIndicatorStyle({
        width: activeTabElement.offsetWidth,
        left: activeTabElement.offsetLeft
      })
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }

  const variantClasses = {
    default: 'border-b border-gray-200',
    pills: 'bg-gray-100 rounded-lg p-1',
    cards: 'space-x-1'
  }

  const getTabClass = (tab, isActive) => {
    const baseClass = `
      relative transition-all duration-200 font-medium cursor-pointer
      focus:outline-none focus:ring-2 focus:ring-offset-2
      ${sizeClasses[size]}
      ${fullWidth ? 'flex-1 text-center' : ''}
    `

    switch (variant) {
      case 'pills':
        return `${baseClass} rounded-md ${
          isActive 
            ? `bg-white shadow-sm ${moodTheme ? `text-${moodTheme}-600` : 'text-blue-600'}`
            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
        }`
      
      case 'cards':
        return `${baseClass} rounded-lg border ${
          isActive 
            ? `bg-white border-gray-300 shadow-sm ${moodTheme ? `text-${moodTheme}-600` : 'text-blue-600'}`
            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
        }`
      
      default:
        return `${baseClass} ${
          isActive 
            ? `${moodTheme ? `text-${moodTheme}-600 border-${moodTheme}-500` : 'text-blue-600 border-blue-500'}`
            : 'text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300'
        } border-b-2`
    }
  }

  return (
    <div className={className}>
      <div className={`
        ${variantClasses[variant]}
        ${fullWidth ? 'flex' : 'flex'}
        relative
      `}>
        {/* Animated Indicator (for default variant) */}
        {variant === 'default' && !reducedMotion && (
          <div
            className={`
              absolute bottom-0 h-0.5 transition-all duration-300 ease-out
              ${moodTheme ? `bg-${moodTheme}-500` : 'bg-blue-500'}
            `}
            style={indicatorStyle}
          />
        )}

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              ref={el => tabRefs.current[tab.id] = el}
              onClick={() => onTabChange(tab.id)}
              className={getTabClass(tab, isActive)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              tabIndex={isActive ? 0 : -1}
            >
              <div className="flex items-center space-x-2">
                {tab.icon && <span className="text-lg">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`
                    inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                    ${isActive 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {tab.badge}
                  </span>
                )}
              </div>
              
              {/* Hover Effect */}
              {!reducedMotion && (
                <div className={`
                  absolute inset-0 rounded-md transition-opacity duration-200
                  ${isActive ? 'opacity-0' : 'opacity-0 hover:opacity-10'}
                  ${moodTheme ? `bg-${moodTheme}-500` : 'bg-blue-500'}
                `} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Tab Panel Component
export const TabPanel = ({ 
  id, 
  activeTab, 
  children, 
  className = '',
  animated = true 
}) => {
  const { reducedMotion } = useTheme()
  const isActive = activeTab === id

  if (!isActive) return null

  return (
    <div
      id={`${id}-panel`}
      role="tabpanel"
      aria-labelledby={id}
      className={`
        ${className}
        ${animated && !reducedMotion ? 'animate-fade-in' : ''}
      `}
    >
      {children}
    </div>
  )
}

export default TabNavigation