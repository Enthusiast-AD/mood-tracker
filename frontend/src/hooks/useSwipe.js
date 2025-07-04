/**
 * Touch Gesture Hook - Mental Health AI
 * Author: Enthusiast-AD
 * Date: 2025-07-03 16:13:24 UTC
 * Mobile swipe and touch gesture support - FIXED
 */

import { useState, useEffect, useRef, useCallback } from 'react' // Add useCallback here

export const useSwipe = (onSwipe, options = {}) => {
  const {
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    deltaThreshold = 10
  } = options

  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const elementRef = useRef(null)

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    })
  }

  const onTouchMove = (e) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault()
    }
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    })
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const timeElapsed = touchEnd.time - touchStart.time
    const velocity = Math.sqrt(distanceX * distanceX + distanceY * distanceY) / timeElapsed

    const isLeftSwipe = distanceX > threshold
    const isRightSwipe = distanceX < -threshold
    const isUpSwipe = distanceY > threshold
    const isDownSwipe = distanceY < -threshold

    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX)

    if (isLeftSwipe && isHorizontalSwipe) {
      onSwipe?.('left', { distanceX, distanceY, velocity, timeElapsed })
    }
    if (isRightSwipe && isHorizontalSwipe) {
      onSwipe?.('right', { distanceX, distanceY, velocity, timeElapsed })
    }
    if (isUpSwipe && isVerticalSwipe) {
      onSwipe?.('up', { distanceX, distanceY, velocity, timeElapsed })
    }
    if (isDownSwipe && isVerticalSwipe) {
      onSwipe?.('down', { distanceX, distanceY, velocity, timeElapsed })
    }
  }

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', onTouchStart, { passive: true })
    element.addEventListener('touchmove', onTouchMove, { passive: !preventDefaultTouchmoveEvent })
    element.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', onTouchStart)
      element.removeEventListener('touchmove', onTouchMove)
      element.removeEventListener('touchend', onTouchEnd)
    }
  }, [preventDefaultTouchmoveEvent])

  return elementRef
}

// Long press hook
export const useLongPress = (onLongPress, delay = 500) => {
  const [isLongPressing, setIsLongPressing] = useState(false)
  const timeoutRef = useRef(null)
  const elementRef = useRef(null)

  const start = useCallback(() => {
    setIsLongPressing(true)
    timeoutRef.current = setTimeout(() => {
      onLongPress?.()
    }, delay)
  }, [onLongPress, delay])

  const stop = useCallback(() => {
    setIsLongPressing(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('mousedown', start)
    element.addEventListener('mouseup', stop)
    element.addEventListener('mouseleave', stop)
    element.addEventListener('touchstart', start, { passive: true })
    element.addEventListener('touchend', stop, { passive: true })
    element.addEventListener('touchcancel', stop, { passive: true })

    return () => {
      element.removeEventListener('mousedown', start)
      element.removeEventListener('mouseup', stop)
      element.removeEventListener('mouseleave', stop)
      element.removeEventListener('touchstart', start)
      element.removeEventListener('touchend', stop)
      element.removeEventListener('touchcancel', stop)
      stop()
    }
  }, [start, stop])

  return { elementRef, isLongPressing }
}

// Touch feedback hook
export const useTouchFeedback = () => {
  const elementRef = useRef(null)

  const addTouchFeedback = useCallback(() => {
    const element = elementRef.current
    if (!element) return

    element.style.transform = 'scale(0.95)'
    element.style.transition = 'transform 0.1s ease'

    setTimeout(() => {
      if (element) {
        element.style.transform = 'scale(1)'
      }
    }, 100)
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = () => addTouchFeedback()

    element.addEventListener('touchstart', handleTouchStart, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
    }
  }, [addTouchFeedback])

  return elementRef
}