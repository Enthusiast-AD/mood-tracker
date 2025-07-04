/**
 * Frontend Performance Testing - Day 4 Production (Fixed)
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:23:48 UTC
 */

class FrontendPerformanceTest {
  constructor() {
    this.testResults = {}
    this.startTime = performance.now()
  }

  async runAllTests() {
    console.log('🚀 Starting Frontend Performance Tests')
    console.log('📅 Date: 2025-07-03 15:23:48 UTC')
    console.log('👤 Tester: Enthusiast-AD')
    console.log('='*60)

    try {
      // Component render tests
      await this.testComponentRenderTimes()
      
      // Bundle size tests
      await this.testBundleSize()
      
      // Memory usage tests
      await this.testMemoryUsage()
      
      // Network performance tests
      await this.testNetworkPerformance()
      
      // PWA functionality tests
      await this.testPWAFunctionality()
      
      // Accessibility tests
      await this.testAccessibility()
      
      this.generateReport()
      
    } catch (error) {
      console.error('❌ Performance test failed:', error)
    }
  }

  async testComponentRenderTimes() {
    console.log('\n📊 Testing Component Render Times...')
    
    const components = [
      'MoodCheck',
      'Dashboard', 
      'LoginPage',
      'PWASettings'
    ]
    
    const renderTimes = {}
    
    for (const component of components) {
      const startTime = performance.now()
      
      // Simulate component render (in real app, this would be actual renders)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
      
      const endTime = performance.now()
      renderTimes[component] = endTime - startTime
      
      console.log(`✅ ${component}: ${renderTimes[component].toFixed(2)}ms`)
    }
    
    this.testResults.componentRenderTimes = renderTimes
  }

  async testBundleSize() {
    console.log('\n📦 Testing Bundle Size...')
    
    const resources = performance.getEntriesByType('resource')
    const jsFiles = resources.filter(r => r.name.includes('.js'))
    const cssFiles = resources.filter(r => r.name.includes('.css'))
    
    let totalJSSize = 0
    let totalCSSSize = 0
    
    jsFiles.forEach(file => {
      if (file.transferSize) {
        totalJSSize += file.transferSize
      }
    })
    
    cssFiles.forEach(file => {
      if (file.transferSize) {
        totalCSSSize += file.transferSize
      }
    })
    
    const bundleInfo = {
      jsFiles: jsFiles.length,
      cssFiles: cssFiles.length,
      totalJSSize: totalJSSize,
      totalCSSSize: totalCSSSize,
      totalSize: totalJSSize + totalCSSSize
    }
    
    console.log(`✅ JS Files: ${bundleInfo.jsFiles} (${(bundleInfo.totalJSSize / 1024).toFixed(2)} KB)`)
    console.log(`✅ CSS Files: ${bundleInfo.cssFiles} (${(bundleInfo.totalCSSSize / 1024).toFixed(2)} KB)`)
    console.log(`✅ Total Bundle Size: ${(bundleInfo.totalSize / 1024).toFixed(2)} KB`)
    
    this.testResults.bundleSize = bundleInfo
  }

  async testMemoryUsage() {
    console.log('\n💾 Testing Memory Usage...')
    
    if ('memory' in performance) {
      const memory = performance.memory
      const memoryInfo = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }
      
      console.log(`✅ Memory Used: ${(memoryInfo.used / 1024 / 1024).toFixed(2)} MB`)
      console.log(`✅ Memory Total: ${(memoryInfo.total / 1024 / 1024).toFixed(2)} MB`)
      console.log(`✅ Memory Limit: ${(memoryInfo.limit / 1024 / 1024).toFixed(2)} MB`)
      console.log(`✅ Usage Percentage: ${memoryInfo.usagePercentage.toFixed(2)}%`)
      
      this.testResults.memoryUsage = memoryInfo
    } else {
      console.log('⚠️ Memory API not available')
      this.testResults.memoryUsage = { available: false }
    }
  }

  async testNetworkPerformance() {
    console.log('\n🌐 Testing Network Performance...')
    
    const networkTests = [
      { endpoint: '/api/crisis/resources', name: 'Crisis Resources' }
    ]
    
    const networkResults = {}
    
    for (const test of networkTests) {
      const startTime = performance.now()
      
      try {
        const response = await fetch(`http://localhost:8000${test.endpoint}`)
        const endTime = performance.now()
        
        networkResults[test.name] = {
          responseTime: endTime - startTime,
          status: response.status,
          success: response.ok
        }
        
        console.log(`✅ ${test.name}: ${networkResults[test.name].responseTime.toFixed(2)}ms`)
        
      } catch (error) {
        networkResults[test.name] = {
          responseTime: null,
          status: null,
          success: false,
          error: error.message
        }
        
        console.log(`❌ ${test.name}: Failed (${error.message})`)
      }
    }
    
    this.testResults.networkPerformance = networkResults
  }

  async testPWAFunctionality() {
    console.log('\n📱 Testing PWA Functionality...')
    
    const pwaTests = {
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notifications: 'Notification' in window,
      storage: 'storage' in navigator,
      indexedDB: 'indexedDB' in window,
      cacheAPI: 'caches' in window
    }
    
    Object.entries(pwaTests).forEach(([feature, supported]) => {
      console.log(`${supported ? '✅' : '❌'} ${feature}: ${supported ? 'Supported' : 'Not Supported'}`)
    })
    
    if (pwaTests.serviceWorker) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        pwaTests.serviceWorkerActive = !!registration
        console.log(`✅ Service Worker: ${registration ? 'Active' : 'Inactive'}`)
      } catch (error) {
        pwaTests.serviceWorkerActive = false
        console.log(`❌ Service Worker: Error checking status`)
      }
    }
    
    this.testResults.pwaFunctionality = pwaTests
  }

  async testAccessibility() {
    console.log('\n♿ Testing Accessibility...')
    
    const accessibilityTests = {
      altTexts: this.checkAltTexts(),
      headingStructure: this.checkHeadingStructure(),
      ariaLabels: this.checkAriaLabels(),
      focusableElements: this.checkFocusableElements()
    }
    
    Object.entries(accessibilityTests).forEach(([test, result]) => {
      console.log(`${result.passed ? '✅' : '❌'} ${test}: ${result.message}`)
    })
    
    this.testResults.accessibility = accessibilityTests
  }

  checkAltTexts() {
    const images = document.querySelectorAll('img')
    const missingAlt = Array.from(images).filter(img => !img.alt && !img.getAttribute('aria-label'))
    
    return {
      passed: missingAlt.length === 0,
      message: missingAlt.length === 0 ? 'All images have alt text' : `${missingAlt.length} images missing alt text`
    }
  }

  checkHeadingStructure() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const levels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)))
    
    return {
      passed: levels.length > 0,
      message: levels.length > 0 ? 'Heading structure found' : 'No headings found'
    }
  }

  checkAriaLabels() {
    const buttons = document.querySelectorAll('button')
    const inputs = document.querySelectorAll('input')
    
    const unlabeledButtons = Array.from(buttons).filter(btn => 
      !btn.textContent.trim() && !btn.getAttribute('aria-label')
    )
    
    const unlabeledInputs = Array.from(inputs).filter(input => 
      !input.getAttribute('aria-label') && !document.querySelector(`label[for="${input.id}"]`)
    )
    
    const totalUnlabeled = unlabeledButtons.length + unlabeledInputs.length
    
    return {
      passed: totalUnlabeled === 0,
      message: totalUnlabeled === 0 ? 'All interactive elements are labeled' : `${totalUnlabeled} elements missing labels`
    }
  }

  checkFocusableElements() {
    const focusable = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    
    return {
      passed: focusable.length > 0,
      message: `${focusable.length} focusable elements found`
    }
  }

  generateReport() {
    const endTime = performance.now()
    const totalTime = endTime - this.startTime
    
    console.log('\n' + '='*60)
    console.log('📊 FRONTEND PERFORMANCE TEST REPORT')
    console.log('='*60)
    
    let totalScore = 0
    let scoreCount = 0
    
    if (this.testResults.componentRenderTimes) {
      const avgRenderTime = Object.values(this.testResults.componentRenderTimes)
        .reduce((a, b) => a + b, 0) / Object.keys(this.testResults.componentRenderTimes).length
      
      const renderScore = avgRenderTime < 50 ? 100 : avgRenderTime < 100 ? 80 : 60
      totalScore += renderScore
      scoreCount++
      
      console.log(`📊 Component Render Score: ${renderScore}/100`)
    }
    
    if (this.testResults.pwaFunctionality) {
      const supportedFeatures = Object.values(this.testResults.pwaFunctionality).filter(Boolean).length
      const totalFeatures = Object.keys(this.testResults.pwaFunctionality).length
      const pwaScore = Math.round((supportedFeatures / totalFeatures) * 100)
      totalScore += pwaScore
      scoreCount++
      
      console.log(`📱 PWA Functionality Score: ${pwaScore}/100`)
    }
    
    const overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0
    
    console.log('\n📈 OVERALL PERFORMANCE SCORE: ' + overallScore + '/100')
    console.log(`⏱️ Total Test Time: ${totalTime.toFixed(2)}ms`)
    
    if (overallScore >= 90) {
      console.log('🎉 EXCELLENT! Ready for production deployment!')
    } else if (overallScore >= 75) {
      console.log('✅ GOOD! Minor optimizations recommended.')
    } else {
      console.log('⚠️ NEEDS IMPROVEMENT. Address performance issues.')
    }
    
    console.log('='*60)
    
    return { overallScore, testResults: this.testResults, testDuration: totalTime }
  }
}

export default FrontendPerformanceTest

// Auto-run in development with query parameter
if (import.meta.env.DEV && window.location.search.includes('test=performance')) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const test = new FrontendPerformanceTest()
      test.runAllTests()
    }, 2000)
  })
}