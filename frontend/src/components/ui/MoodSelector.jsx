/**
 * Interactive Mood Selector - Mental Health AI
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:36:52 UTC
 * Beautiful, engaging mood selection interface
 */

import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const MoodSelector = ({
  value = 5,
  onChange,
  size = 'lg',
  showLabels = true,
  showEmojis = true,
  animate = true,
  className = ''
}) => {
  const [currentValue, setCurrentValue] = useState(value)
  const [isInteracting, setIsInteracting] = useState(false)
  const { reducedMotion, setMoodResponsiveTheme } = useTheme()

  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  const moodData = [
    { value: 1, emoji: '😢', label: 'Terrible', color: 'from-red-500 to-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
    { value: 2, emoji: '😔', label: 'Very Bad', color: 'from-red-400 to-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    { value: 3, emoji: '😞', label: 'Bad', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' },
    { value: 4, emoji: '😕', label: 'Poor', color: 'from-orange-400 to-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { value: 5, emoji: '😐', label: 'Okay', color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
    { value: 6, emoji: '🙂', label: 'Fair', color: 'from-yellow-400 to-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    { value: 7, emoji: '😊', label: 'Good', color: 'from-green-500 to-blue-500', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
    { value: 8, emoji: '😄', label: 'Great', color: 'from-green-400 to-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { value: 9, emoji: '🤩', label: 'Excellent', color: 'from-blue-500 to-green-500', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
    { value: 10, emoji: '🌟', label: 'Amazing', color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' }
  ]

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl'
  }

  const getCurrentMood = () => {
    return moodData.find(mood => mood.value === currentValue) || moodData[4]
  }

  const handleMoodSelect = (moodValue) => {
    setCurrentValue(moodValue)
    setIsInteracting(true)
    
    // Update theme based on mood
    setMoodResponsiveTheme(moodValue)
    
    // Call onChange
    onChange?.(moodValue)
    
    // Reset interaction state
    setTimeout(() => setIsInteracting(false), 300)
  }

  const handleSliderChange = (e) => {
    const newValue = parseInt(e.target.value)
    handleMoodSelect(newValue)
  }

  const currentMood = getCurrentMood()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Mood Display */}
      <div className="text-center">
        <div className={`
          inline-flex items-center justify-center rounded-full border-4 transition-all duration-500
          ${currentMood.bgColor} ${currentMood.borderColor}
          ${sizeClasses[size]}
          ${!reducedMotion && animate ? 'hover:scale-110 transform' : ''}
          ${isInteracting && !reducedMotion ? 'animate-bounce' : ''}
        `}>
          <span className="text-4xl">{currentMood.emoji}</span>
        </div>
        
        {showLabels && (
          <div className="mt-4">
            <div className={`
              text-3xl font-bold bg-gradient-to-r ${currentMood.color} bg-clip-text text-transparent
              transition-all duration-300
            `}>
              {currentValue}/10
            </div>
            <div className="text-lg font-medium text-gray-700 mt-1">
              {currentMood.label}
            </div>
          </div>
        )}
      </div>

      {/* Mood Scale Slider */}
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={currentValue}
          onChange={handleSliderChange}
          className={`
            w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer
            slider-thumb transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-blue-300
          `}
          style={{
            background: `linear-gradient(to right, 
              #fca5a5 0%, #fed7aa 20%, #fde68a 40%, 
              #d9f99d 60%, #86efac 80%, #60a5fa 100%)`
          }}
        />
        
        {/* Scale Labels */}
        <div className="flex justify-between mt-2 px-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <span
              key={num}
              className={`
                text-xs font-medium transition-all duration-200
                ${currentValue === num ? 'text-gray-900 scale-125' : 'text-gray-400'}
              `}
            >
              {num}
            </span>
          ))}
        </div>
      </div>

      {/* Mood Grid (Alternative Selection) */}
      <div className="grid grid-cols-5 gap-3">
        {moodData.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value)}
            className={`
              relative p-3 rounded-xl border-2 transition-all duration-200
              ${currentValue === mood.value 
                ? `${mood.bgColor} ${mood.borderColor} scale-110 shadow-lg` 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }
              ${!reducedMotion ? 'hover:scale-105 transform' : ''}
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{mood.emoji}</div>
              {showLabels && (
                <div className="text-xs font-medium text-gray-600">
                  {mood.value}
                </div>
              )}
            </div>
            
            {/* Selection Indicator */}
            {currentValue === mood.value && (
              <div className={`
                absolute inset-0 rounded-xl bg-gradient-to-r ${mood.color} opacity-10
                ${!reducedMotion ? 'animate-pulse' : ''}
              `} />
            )}
          </button>
        ))}
      </div>

      {/* Mood History Mini-Chart */}
      {animate && (
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Recent Mood</span>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          <div className="flex items-end space-x-1 h-8">
            {[6, 7, 5, 8, 6, 9, currentValue].map((value, index) => (
              <div
                key={index}
                className={`
                  flex-1 bg-gradient-to-t ${moodData.find(m => m.value === value)?.color} rounded-t
                  transition-all duration-500
                  ${index === 6 ? 'shadow-lg scale-110' : 'opacity-60'}
                `}
                style={{ 
                  height: `${(value / 10) * 100}%`,
                  minHeight: '4px'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(145deg, #ffffff, #f3f4f6);
          border: 3px solid ${currentMood.color.includes('red') ? '#ef4444' : 
                             currentMood.color.includes('orange') ? '#f59e0b' :
                             currentMood.color.includes('yellow') ? '#eab308' :
                             currentMood.color.includes('green') ? '#22c55e' : '#3b82f6'};
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(145deg, #ffffff, #f3f4f6);
          border: 3px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  )
}

export default MoodSelector