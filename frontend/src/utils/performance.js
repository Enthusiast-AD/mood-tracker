/**
 * Performance Monitoring Utilities - Day 4 Production
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:01:12 UTC
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = new Map()
    this.isProduction = process.env.NODE_ENV === 'production'
    
    this.init()
  }

  init() {
    // Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      this.observeLCP()
      this.observeFID()
      this.observeCLS()
      this.observeFCP()
      this.observeTTFB()
    }

    // Custom metrics
    this.observeNavigationTiming()
    this.observeResourceTiming()
    
    // Memory usage (if available)
    if ('memory' in performance) {
      this.monitorMemoryUsage()
    }
  }

  // Largest Contentful Paint
  observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      this.metrics.set('LCP', {
        value: lastEntry.startTime,
        rating: this.rateLCP(lastEntry.startTime),
        timestamp: Date.now()
      })
      
      this.reportMetric('LCP', lastEntry.startTime)
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.set('LCP', observer)
  }

  // First Input Delay
  observeFID() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        const fidValue = entry.processingStart - entry.startTime
        
        this.metrics.set('FID', {
          value: fidValue,
          rating: this.rateFID(fidValue),
          timestamp: Date.now()
        })
        
        this.reportMetric('FID', fidValue)
      })
    })
    
    observer.observe({ entryTypes: ['first-input'] })
    this.observers.set('FID', observer)
  }

  // Cumulative Layout Shift
  observeCLS() {
    let clsValue = 0
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      
      this.metrics.set('CLS', {
        value: clsValue,
        rating: this.rateCLS(clsValue),
        timestamp: Date.now()
      })
      
      this.reportMetric('CLS', clsValue)
    })
    
    observer.observe({ entryTypes: ['layout-shift'] })
    this.observers.set('CLS', observer)
  }

  // First Contentful Paint
  observeFCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.set('FCP', {
            value: entry.startTime,
            rating: this.rateFCP(entry.startTime),
            timestamp: Date.now()
          })
          
          this.reportMetric('FCP', entry.startTime)
        }
      })
    })
    
    observer.observe({ entryTypes: ['paint'] })
    this.observers.set('FCP', observer)
  }

  // Time to First Byte
  observeTTFB() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          const ttfb = entry.responseStart - entry.requestStart
          
          this.metrics.set('TTFB', {
            value: ttfb,
            rating: this.rateTTFB(ttfb),
            timestamp: Date.now()
          })
          
          this.reportMetric('TTFB', ttfb)
        }
      })
    })
    
    observer.observe({ entryTypes: ['navigation'] })
    this.observers.set('TTFB', observer)
  }

  // Navigation timing
  observeNavigationTiming() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0]
      if (navigation) {
        const metrics = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          domInteractive: navigation.domInteractive - navigation.navigationStart,
          totalLoadTime: navigation.loadEventEnd - navigation.navigationStart
        }
        
        Object.entries(metrics).forEach(([key, value]) => {
          this.metrics.set(key, {
            value,
            timestamp: Date.now()
          })
        })
        
        this.reportCustomMetrics(metrics)
      }
    })
  }

  // Resource timing
  observeResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach(entry => {
        // Track slow resources
        const duration = entry.responseEnd - entry.startTime
        if (duration > 1000) { // Resources taking more than 1 second
          this.reportSlowResource(entry.name, duration)
        }
      })
    })
    
    observer.observe({ entryTypes: ['resource'] })
    this.observers.set('resource', observer)
  }

  // Memory usage monitoring
  monitorMemoryUsage() {
    setInterval(() => {
      if ('memory' in performance) {
        const memory = performance.memory
        const memoryInfo = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        }
        
        this.metrics.set('memory', {
          value: memoryInfo,
          timestamp: Date.now()
        })
        
        // Alert if memory usage is high
        if (memoryInfo.percentage > 80) {
          console.warn('High memory usage detected:', memoryInfo)
        }
      }
    }, 30000) // Check every 30 seconds
  }

  // Rating functions based on Core Web Vitals thresholds
  rateLCP(value) {
    if (value <= 2500) return 'good'
    if (value <= 4000) return 'needs-improvement'
    return 'poor'
  }

  rateFID(value) {
    if (value <= 100) return 'good'
    if (value <= 300) return 'needs-improvement'
    return 'poor'
  }

  rateCLS(value) {
    if (value <= 0.1) return 'good'
    if (value <= 0.25) return 'needs-improvement'
    return 'poor'
  }

  rateFCP(value) {
    if (value <= 1800) return 'good'
    if (value <= 3000) return 'needs-improvement'
    return 'poor'
  }

  rateTTFB(value) {
    if (value <= 800) return 'good'
    if (value <= 1800) return 'needs-improvement'
    return 'poor'
  }

  // Report metrics (in production, this would send to analytics)
  reportMetric(name, value) {
    if (!this.isProduction) {
      console.log(`📊 ${name}:`, value)
    }
    
    // In production, send to analytics service
    if (this.isProduction && window.gtag) {
      window.gtag('event', name, {
        value: Math.round(value),
        custom_parameter: 'web_vitals'
      })
    }
  }

  reportCustomMetrics(metrics) {
    if (!this.isProduction) {
      console.log('📊 Custom Metrics:', metrics)
    }
  }

  reportSlowResource(url, duration) {
    if (!this.isProduction) {
      console.warn(`🐌 Slow resource: ${url} (${duration}ms)`)
    }
  }

  // Get all metrics
  getAllMetrics() {
    const result = {}
    this.metrics.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  // Get performance summary
  getPerformanceSummary() {
    const metrics = this.getAllMetrics()
    const coreMetrics = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB']
    
    const summary = {
      timestamp: Date.now(),
      coreWebVitals: {},
      customMetrics: {},
      overallScore: 0
    }
    
    let goodCount = 0
    
    coreMetrics.forEach(metric => {
      if (metrics[metric]) {
        summary.coreWebVitals[metric] = metrics[metric]
        if (metrics[metric].rating === 'good') {
          goodCount++
        }
      }
    })
    
    // Calculate overall score
    summary.overallScore = Math.round((goodCount / coreMetrics.length) * 100)
    
    // Add custom metrics
    Object.keys(metrics).forEach(key => {
      if (!coreMetrics.includes(key)) {
        summary.customMetrics[key] = metrics[key]
      }
    })
    
    return summary
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => {
      observer.disconnect()
    })
    this.observers.clear()
    this.metrics.clear()
  }
}

// API response time monitoring
export const trackApiCall = (endpoint, startTime) => {
  const endTime = performance.now()
  const duration = endTime - startTime
  
  // Log slow API calls
  if (duration > 2000) {
    console.warn(`🐌 Slow API call: ${endpoint} (${duration}ms)`)
  }
  
  // Track in metrics
  if (window.performanceMonitor) {
    window.performanceMonitor.metrics.set(`api_${endpoint}`, {
      value: duration,
      timestamp: Date.now()
    })
  }
}

// Component render time tracking
export const trackComponentRender = (componentName, renderTime) => {
  if (renderTime > 100) {
    console.warn(`🐌 Slow component render: ${componentName} (${renderTime}ms)`)
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor()

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor
}

export default performanceMonitor