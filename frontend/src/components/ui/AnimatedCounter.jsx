import React, { useState, useEffect } from 'react'

const AnimatedCounter = ({ 
  value, 
  duration = 2000, 
  suffix = '', 
  prefix = '',
  className = '',
  decimals = 0 
}) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp = null
    const startValue = 0
    const endValue = parseFloat(value) || 0

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (endValue - startValue) * easeOutQuart
      
      setCount(currentValue)

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setCount(endValue)
      }
    }

    requestAnimationFrame(step)
  }, [value, duration])

  const formatNumber = (num) => {
    return decimals > 0 ? num.toFixed(decimals) : Math.floor(num)
  }

  return (
    <span className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  )
}

export default AnimatedCounter