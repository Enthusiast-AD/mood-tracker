class VoiceService {
  constructor() {
    this.recognition = null
    this.isListening = false
    this.isSupported = this.checkSupport()
    this.onResult = null
    this.onError = null
    this.onStart = null
    this.onEnd = null
    this.retryCount = 0
    this.maxRetries = 3
    this.lastError = null
    
    if (this.isSupported) {
      this.initRecognition()
    }
  }

  checkSupport() {
    const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    const isSecureContext = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    
    if (!hasWebSpeech) {
      console.warn('🎤 Speech Recognition API not supported in this browser')
      return false
    }
    
    if (!isSecureContext) {
      console.warn('🎤 Speech Recognition requires HTTPS or localhost')
      return false
    }
    
    return true
  }

  initRecognition() {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      
      // Enhanced configuration
      this.recognition.continuous = false
      this.recognition.interimResults = true
      this.recognition.lang = 'en-US'
      this.recognition.maxAlternatives = 3
      
      // Add timeout and retry logic
      this.setupEventHandlers()
      
    } catch (error) {
      console.error('🎤 Failed to initialize speech recognition:', error)
      this.isSupported = false
    }
  }

  setupEventHandlers() {
    this.recognition.onstart = () => {
      this.isListening = true
      this.retryCount = 0
      this.lastError = null
      if (this.onStart) this.onStart()
      console.log('🎤 Voice recognition started successfully')
    }

    this.recognition.onresult = (event) => {
      let transcript = ''
      let isFinal = false
      let confidence = 0

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        transcript += result[0].transcript
        confidence = result[0].confidence || 0
        if (result.isFinal) isFinal = true
      }

      if (this.onResult) {
        this.onResult({
          transcript: transcript.trim(),
          isFinal,
          confidence: confidence
        })
      }
    }

    this.recognition.onerror = (event) => {
      console.error('🎤 Speech recognition error:', event.error)
      this.isListening = false
      this.lastError = event.error
      
      // Handle different error types
      this.handleError(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
      if (this.onEnd) this.onEnd()
      console.log('🎤 Voice recognition ended')
    }
  }

  handleError(error) {
    const errorHandlers = {
      'network': () => this.handleNetworkError(),
      'no-speech': () => this.handleNoSpeechError(),
      'audio-capture': () => this.handleAudioCaptureError(),
      'not-allowed': () => this.handlePermissionError(),
      'service-not-allowed': () => this.handleServiceError(),
      'bad-grammar': () => this.handleGrammarError(),
      'language-not-supported': () => this.handleLanguageError()
    }

    const handler = errorHandlers[error] || (() => this.handleUnknownError(error))
    handler()
  }

  handleNetworkError() {
    console.warn('🌐 Network error detected, attempting local fallback...')
    
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      console.log(`🔄 Retrying voice recognition (${this.retryCount}/${this.maxRetries})...`)
      
      // Wait 2 seconds before retry
      setTimeout(() => {
        if (!this.isListening) {
          this.startListening()
        }
      }, 2000)
      
      if (this.onError) {
        this.onError(`network_retry_${this.retryCount}`)
      }
    } else {
      if (this.onError) {
        this.onError('network_failed_fallback')
      }
    }
  }

  handleNoSpeechError() {
    if (this.onError) {
      this.onError('no_speech_detected')
    }
  }

  handleAudioCaptureError() {
    if (this.onError) {
      this.onError('microphone_access_denied')
    }
  }

  handlePermissionError() {
    if (this.onError) {
      this.onError('permission_denied')
    }
  }

  handleServiceError() {
    if (this.onError) {
      this.onError('service_not_available')
    }
  }

  handleGrammarError() {
    if (this.onError) {
      this.onError('grammar_error')
    }
  }

  handleLanguageError() {
    if (this.onError) {
      this.onError('language_not_supported')
    }
  }

  handleUnknownError(error) {
    console.error('🎤 Unknown speech recognition error:', error)
    if (this.onError) {
      this.onError(`unknown_error_${error}`)
    }
  }

  async startListening() {
    if (!this.isSupported) {
      throw new Error('Speech recognition not supported')
    }

    // Check if already listening
    if (this.isListening) {
      console.warn('🎤 Already listening, stopping current session...')
      this.stopListening()
      await this.wait(500) // Wait for cleanup
    }

    // Check network connectivity
    if (!navigator.onLine) {
      throw new Error('No internet connection available for speech recognition')
    }

    try {
      // Request microphone permission first
      await this.requestMicrophonePermission()
      
      if (this.recognition) {
        this.recognition.start()
      }
    } catch (error) {
      console.error('🎤 Failed to start listening:', error)
      if (this.onError) {
        this.onError(error.message)
      }
      throw error
    }
  }

  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      console.error('🎤 Microphone permission denied:', error)
      throw new Error('Microphone access required for voice input')
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop()
      } catch (error) {
        console.error('🎤 Error stopping recognition:', error)
      }
    }
    this.isListening = false
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Enhanced voice command processing with better patterns
  processVoiceCommand(transcript) {
    const command = transcript.toLowerCase().trim()
    console.log('🎤 Processing voice command:', command)
    
    // Enhanced mood score detection with more patterns
    const scorePatterns = [
      /(?:i feel|feeling|mood is|i'm)\s*(?:a\s*)?(\d+)(?:\s*out\s*of\s*10)?/,
      /(?:my mood is|mood score|feeling)\s*(\d+)/,
      /(\d+)\s*out\s*of\s*10/,
      /(?:rate|score)\s*(\d+)/
    ]

    for (const pattern of scorePatterns) {
      const match = command.match(pattern)
      if (match) {
        const score = parseInt(match[1])
        if (score >= 1 && score <= 10) {
          return { type: 'mood_score', value: score, confidence: 0.9 }
        }
      }
    }

    // Enhanced emotion detection with context
    const emotions = {
      'happy': {
        keywords: ['happy', 'joyful', 'cheerful', 'glad', 'delighted', 'pleased', 'good', 'great', 'wonderful'],
        intensity: this.getEmotionIntensity(command, ['very', 'really', 'extremely', 'super'])
      },
      'sad': {
        keywords: ['sad', 'unhappy', 'down', 'blue', 'melancholy', 'depressed', 'low', 'upset'],
        intensity: this.getEmotionIntensity(command, ['very', 'really', 'extremely', 'deeply'])
      },
      'anxious': {
        keywords: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy', 'concerned'],
        intensity: this.getEmotionIntensity(command, ['very', 'really', 'extremely', 'highly'])
      },
      'angry': {
        keywords: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'pissed'],
        intensity: this.getEmotionIntensity(command, ['very', 'really', 'extremely', 'totally'])
      },
      'calm': {
        keywords: ['calm', 'peaceful', 'relaxed', 'tranquil', 'serene', 'composed', 'zen'],
        intensity: this.getEmotionIntensity(command, ['very', 'really', 'extremely', 'deeply'])
      },
      'excited': {
        keywords: ['excited', 'thrilled', 'enthusiastic', 'energetic', 'pumped', 'hyped'],
        intensity: this.getEmotionIntensity(command, ['very', 'really', 'extremely', 'super'])
      },
      'tired': {
        keywords: ['tired', 'exhausted', 'drained', 'fatigued', 'sleepy', 'weary', 'worn out'],
        intensity: this.getEmotionIntensity(command, ['very', 'really', 'extremely', 'totally'])
      },
      'confident': {
        keywords: ['confident', 'sure', 'self-assured', 'certain', 'positive', 'strong'],
        intensity: this.getEmotionIntensity(command, ['very', 'really', 'extremely', 'super'])
      },
      'lonely': {
        keywords: ['lonely', 'isolated', 'alone', 'disconnected', 'solitary', 'abandoned'],
        intensity: this.getEmotionIntensity(command, ['very', 'really', 'extremely', 'deeply'])
      }
    }

    const detectedEmotions = []
    for (const [emotion, data] of Object.entries(emotions)) {
      if (data.keywords.some(keyword => command.includes(keyword))) {
        detectedEmotions.push({
          emotion,
          intensity: data.intensity,
          confidence: this.calculateEmotionConfidence(command, data.keywords)
        })
      }
    }

    if (detectedEmotions.length > 0) {
      return { 
        type: 'emotions', 
        value: detectedEmotions.map(e => e.emotion),
        details: detectedEmotions,
        confidence: 0.8
      }
    }

    // Enhanced activity detection
    const activities = {
      'work': ['work', 'working', 'office', 'job', 'meeting', 'project', 'task'],
      'exercise': ['exercise', 'workout', 'gym', 'running', 'walking', 'fitness', 'training'],
      'socializing': ['friends', 'family', 'party', 'hanging out', 'socializing', 'dinner', 'chat'],
      'relaxing': ['relaxing', 'resting', 'chilling', 'unwinding', 'lounging', 'netflix'],
      'studying': ['studying', 'reading', 'learning', 'homework', 'research', 'book'],
      'commuting': ['commuting', 'driving', 'traveling', 'train', 'bus', 'car'],
      'eating': ['eating', 'lunch', 'dinner', 'breakfast', 'meal', 'food'],
      'sleeping': ['sleeping', 'napping', 'bed', 'tired', 'sleep']
    }

    for (const [activity, keywords] of Object.entries(activities)) {
      if (keywords.some(keyword => command.includes(keyword))) {
        return { 
          type: 'activity', 
          value: activity,
          confidence: 0.7
        }
      }
    }

    // Free text for notes (if longer than 10 characters and doesn't match other patterns)
    if (command.length > 10) {
      return { 
        type: 'notes', 
        value: transcript,
        confidence: 0.6
      }
    }

    return { 
      type: 'unknown', 
      value: transcript,
      confidence: 0.3
    }
  }

  getEmotionIntensity(text, intensifiers) {
    for (const intensifier of intensifiers) {
      if (text.includes(intensifier)) {
        return 'high'
      }
    }
    return 'medium'
  }

  calculateEmotionConfidence(text, keywords) {
    const matchCount = keywords.filter(keyword => text.includes(keyword)).length
    return Math.min(0.9, 0.5 + (matchCount * 0.2))
  }

  // Enhanced text-to-speech with better error handling
  speak(text, options = {}) {
    if (!('speechSynthesis' in window)) {
      console.warn('🔊 Text-to-speech not supported')
      return false
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options.rate || 1
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 0.8
      utterance.lang = options.lang || 'en-US'
      
      utterance.onerror = (event) => {
        console.error('🔊 Speech synthesis error:', event.error)
      }

      utterance.onend = () => {
        console.log('🔊 Speech synthesis completed')
      }

      window.speechSynthesis.speak(utterance)
      return true
      
    } catch (error) {
      console.error('🔊 Failed to speak text:', error)
      return false
    }
  }

  // Get available voices with language filtering
  getVoices(language = 'en') {
    if (!('speechSynthesis' in window)) return []
    
    const voices = window.speechSynthesis.getVoices()
    return voices.filter(voice => voice.lang.startsWith(language))
  }

  // Enhanced support check
  isVoiceSupported() {
    return this.isSupported && navigator.onLine
  }

  // Get detailed status information
  getStatus() {
    return {
      supported: this.isSupported,
      listening: this.isListening,
      online: navigator.onLine,
      lastError: this.lastError,
      retryCount: this.retryCount,
      hasPermission: this.hasPermission()
    }
  }

  async hasPermission() {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' })
      return result.state === 'granted'
    } catch (error) {
      return false
    }
  }

  // Clean up resources
  destroy() {
    this.stopListening()
    this.onResult = null
    this.onError = null
    this.onStart = null
    this.onEnd = null
  }
}

export default new VoiceService()