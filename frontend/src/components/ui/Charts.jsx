/**
 * Animated Chart Components - Mental Health AI
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:41:39 UTC
 * Beautiful, accessible data visualizations
 */

import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

// Line Chart Component
export const LineChart = ({
  data = [],
  width = 400,
  height = 200,
  animated = true,
  gradient = true,
  showDots = true,
  showGrid = true,
  mood = null,
  className = ''
}) => {
  const svgRef = useRef()
  const [animationProgress, setAnimationProgress] = useState(0)
  const { reducedMotion } = useTheme()

  useEffect(() => {
    if (reducedMotion) {
      setAnimationProgress(1)
    } else if (animated) {
      const startTime = Date.now()
      const duration = 1500

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        setAnimationProgress(progress)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      animate()
    } else {
      setAnimationProgress(1)
    }
  }, [data, animated, reducedMotion])

  const margin = { top: 20, right: 30, bottom: 30, left: 30 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  const maxValue = Math.max(...data.map(d => d.value), 10)
  const minValue = Math.min(...data.map(d => d.value), 0)
  const valueRange = maxValue - minValue

  const getX = (index) => (index / (data.length - 1)) * chartWidth
  const getY = (value) => chartHeight - ((value - minValue) / valueRange) * chartHeight

  const pathData = data
    .map((point, index) => {
      const x = getX(index)
      const y = getY(point.value)
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')

  const animatedPathData = data
    .slice(0, Math.ceil(data.length * animationProgress))
    .map((point, index) => {
      const x = getX(index)
      const y = getY(point.value)
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')

  const moodColors = {
    excellent: { primary: '#10b981', secondary: '#34d399' },
    good: { primary: '#06b6d4', secondary: '#22d3ee' },
    neutral: { primary: '#8b5cf6', secondary: '#a78bfa' },
    challenging: { primary: '#f59e0b', secondary: '#fbbf24' },
    difficult: { primary: '#ef4444', secondary: '#f87171' }
  }

  const colors = mood ? moodColors[mood] : { primary: '#3b82f6', secondary: '#60a5fa' }

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      >
        <defs>
          {gradient && (
            <>
              <linearGradient id={`gradient-${mood || 'default'}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colors.primary} stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id={`line-gradient-${mood || 'default'}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.primary} />
                <stop offset="100%" stopColor={colors.secondary} />
              </linearGradient>
            </>
          )}
          
          {/* Drop shadow filter */}
          <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offset" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge> 
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid Lines */}
          {showGrid && (
            <g className="opacity-20">
              {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                <line
                  key={ratio}
                  x1="0"
                  y1={chartHeight * ratio}
                  x2={chartWidth}
                  y2={chartHeight * ratio}
                  stroke="currentColor"
                  strokeWidth="1"
                />
              ))}
            </g>
          )}

          {/* Area Fill */}
          {gradient && data.length > 0 && (
            <path
              d={`${pathData} L ${getX(data.length - 1)} ${chartHeight} L ${getX(0)} ${chartHeight} Z`}
              fill={`url(#gradient-${mood || 'default'})`}
              className="transition-all duration-300"
            />
          )}

          {/* Main Line */}
          <path
            d={animatedPathData}
            fill="none"
            stroke={gradient ? `url(#line-gradient-${mood || 'default'})` : colors.primary}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#dropshadow)"
            className="transition-all duration-300"
          />

          {/* Data Points */}
          {showDots && data.slice(0, Math.ceil(data.length * animationProgress)).map((point, index) => (
            <g key={index}>
              <circle
                cx={getX(index)}
                cy={getY(point.value)}
                r="4"
                fill="white"
                stroke={colors.primary}
                strokeWidth="2"
                filter="url(#dropshadow)"
                className={`transition-all duration-300 ${!reducedMotion ? 'hover:r-6' : ''}`}
              />
              
              {/* Hover tooltip */}
              <circle
                cx={getX(index)}
                cy={getY(point.value)}
                r="12"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  // Show tooltip logic here
                }}
              />
            </g>
          ))}
        </g>
      </svg>

      {/* Axis Labels */}
      <div className="flex justify-between mt-2 px-8 text-xs text-gray-500">
        {data.map((point, index) => (
          <span key={index} className={index % 2 === 0 ? '' : 'opacity-50'}>
            {point.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// Bar Chart Component
export const BarChart = ({
  data = [],
  width = 400,
  height = 200,
  animated = true,
  gradient = true,
  showValues = true,
  mood = null,
  className = ''
}) => {
  const [animationProgress, setAnimationProgress] = useState(0)
  const { reducedMotion } = useTheme()

  useEffect(() => {
    if (reducedMotion) {
      setAnimationProgress(1)
    } else if (animated) {
      const startTime = Date.now()
      const duration = 1000

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        setAnimationProgress(progress)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      animate()
    } else {
      setAnimationProgress(1)
    }
  }, [data, animated, reducedMotion])

  const margin = { top: 20, right: 20, bottom: 40, left: 20 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  const maxValue = Math.max(...data.map(d => d.value), 1)
  const barWidth = chartWidth / data.length * 0.8
  const barSpacing = chartWidth / data.length * 0.2

  const moodColors = {
    excellent: '#10b981',
    good: '#06b6d4',
    neutral: '#8b5cf6',
    challenging: '#f59e0b',
    difficult: '#ef4444'
  }

  const getBarColor = (value) => {
    if (mood) return moodColors[mood]
    
    // Dynamic color based on value
    const ratio = value / maxValue
    if (ratio > 0.8) return '#10b981'
    if (ratio > 0.6) return '#06b6d4'
    if (ratio > 0.4) return '#8b5cf6'
    if (ratio > 0.2) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height}>
        <defs>
          {gradient && data.map((_, index) => (
            <linearGradient key={index} id={`bar-gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={getBarColor(data[index].value)} stopOpacity="0.8" />
              <stop offset="100%" stopColor={getBarColor(data[index].value)} stopOpacity="1" />
            </linearGradient>
          ))}
        </defs>

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight * animationProgress
            const x = index * (barWidth + barSpacing)
            const y = chartHeight - barHeight

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={gradient ? `url(#bar-gradient-${index})` : getBarColor(item.value)}
                  rx="4"
                  ry="4"
                  className={`transition-all duration-300 ${!reducedMotion ? 'hover:opacity-80' : ''}`}
                />

                {/* Value Label */}
                {showValues && animationProgress > 0.8 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700"
                  >
                    {item.value}
                  </text>
                )}

                {/* Category Label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 15}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {item.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

// Donut Chart Component
export const DonutChart = ({
  data = [],
  size = 200,
  strokeWidth = 20,
  animated = true,
  showLabels = true,
  centerContent = null,
  className = ''
}) => {
  const [animationProgress, setAnimationProgress] = useState(0)
  const { reducedMotion } = useTheme()

  useEffect(() => {
    if (reducedMotion) {
      setAnimationProgress(1)
    } else if (animated) {
      const startTime = Date.now()
      const duration = 1500

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        setAnimationProgress(progress)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      animate()
    } else {
      setAnimationProgress(1)
    }
  }, [data, animated, reducedMotion])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const total = data.reduce((sum, item) => sum + item.value, 0)

  let cumulativePercentage = 0

  const colors = [
    '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444',
    '#14b8a6', '#3b82f6', '#6366f1', '#f97316', '#ec4899'
  ]

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

        {/* Data Segments */}
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100 * animationProgress
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
          const strokeDashoffset = -((cumulativePercentage / 100) * circumference)
          
          const result = (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={item.color || colors[index % colors.length]}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          )

          cumulativePercentage += (item.value / total) * 100
          return result
        })}
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {centerContent || (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLabels && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4">
          <div className="flex flex-wrap justify-center gap-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-1 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color || colors[index % colors.length] }}
                />
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Mood Trend Chart Component
export const MoodTrendChart = ({
  data = [],
  width = 600,
  height = 300,
  showPrediction = true,
  className = ''
}) => {
  const { reducedMotion } = useTheme()

  const processedData = data.map(item => ({
    ...item,
    mood: item.value >= 8 ? 'excellent' :
          item.value >= 6 ? 'good' :
          item.value >= 4 ? 'neutral' :
          item.value >= 2 ? 'challenging' : 'difficult'
  }))

  return (
    <div className={`relative ${className}`}>
      <LineChart
        data={processedData}
        width={width}
        height={height}
        animated={!reducedMotion}
        gradient={true}
        showDots={true}
        showGrid={true}
        mood={processedData[processedData.length - 1]?.mood}
      />

      {/* Mood Zones */}
      <div className="absolute top-4 right-4 space-y-1 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Excellent (8-10)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500" />
          <span>Good (6-7)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <span>Neutral (4-5)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Challenging (2-3)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Difficult (1)</span>
        </div>
      </div>
    </div>
  )
}