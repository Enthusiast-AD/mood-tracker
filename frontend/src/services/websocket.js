class MoodWebSocketService {
  constructor() {
    this.ws = null
    this.userId = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000
    this.listeners = new Map()
  }

  connect(userId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve()
    }

    this.userId = userId
    const wsUrl = `ws://localhost:8000/ws/mood-monitor/${userId}`
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = () => {
          console.log('🔌 WebSocket connected for real-time mood monitoring')
          this.reconnectAttempts = 0
          this.emit('connected', { userId })
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('📡 Real-time mood data:', data)
            this.emit('message', data)
            
            // Handle specific message types
            if (data.type) {
              this.emit(data.type, data)
            }
            
            // Crisis alerts
            if (data.crisis_alert) {
              this.emit('crisis_alert', data)
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }
        
        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason)
          this.emit('disconnected', { code: event.code, reason: event.reason })
          
          // Attempt to reconnect if not intentionally closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }
        
        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error)
          this.emit('error', error)
          reject(error)
        }
        
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error)
        reject(error)
      }
    })
  }

  scheduleReconnect() {
    this.reconnectAttempts++
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
    
    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId).catch(() => {
          // Reconnection failed, will try again if attempts remain
        })
      }
    }, this.reconnectInterval * this.reconnectAttempts)
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data))
        return true
      } catch (error) {
        console.error('Error sending WebSocket message:', error)
        return false
      }
    } else {
      console.warn('WebSocket not connected, cannot send message')
      return false
    }
  }

  sendMoodUpdate(moodData) {
    return this.send({
      type: 'mood_update',
      timestamp: new Date().toISOString(),
      ...moodData
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting')
      this.ws = null
    }
    this.userId = null
    this.reconnectAttempts = 0
  }

  // Event listener system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error)
        }
      })
    }
  }

  getConnectionStatus() {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'disconnecting'
      case WebSocket.CLOSED: return 'disconnected'
      default: return 'unknown'
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

// Create singleton instance
const moodWebSocket = new MoodWebSocketService()

export default moodWebSocket