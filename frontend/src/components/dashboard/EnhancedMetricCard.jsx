import React from 'react'
import AnimatedCounter from '../ui/AnimatedCounter'

const EnhancedMetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'blue',
  trend = null,
  onClick = null,
  className = '' 
}) => {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50 text-blue-700',
    green: 'border-green-500 bg-green-50 text-green-700',
    yellow: 'border-yellow-500 bg-yellow-50 text-yellow-700',
    red: 'border-red-500 bg-red-50 text-red-700',
    purple: 'border-purple-500 bg-purple-50 text-purple-700',
    indigo: 'border-indigo-500 bg-indigo-50 text-indigo-700'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <span className="text-green-500">📈</span>
    if (trend === 'down') return <span className="text-red-500">📉</span>
    if (trend === 'stable') return <span className="text-blue-500">➡️</span>
    return null
  }

  // Check if value is a number or can be converted to a number
  const isNumericValue = () => {
    const numValue = parseFloat(value)
    return !isNaN(numValue) && isFinite(numValue)
  }

  // Render the value appropriately
  const renderValue = () => {
    if (isNumericValue()) {
      return (
        <AnimatedCounter 
          value={value} 
          decimals={typeof value === 'string' ? 0 : 1}
          className="text-3xl font-bold text-gray-900"
        />
      )
    } else {
      // For string values, just display them with animation
      return (
        <div className="text-3xl font-bold text-gray-900 capitalize animate-fade-in">
          {value || 'No data'}
        </div>
      )
    }
  }

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${colorClasses[color]} transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-center space-x-2">
            {renderValue()}
            {getTrendIcon()}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        <div className="text-4xl opacity-80 transform transition-transform duration-300 hover:scale-110">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default EnhancedMetricCard