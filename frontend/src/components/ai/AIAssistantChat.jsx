import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Send, 
  Brain, 
  Heart, 
  AlertTriangle,
  Sparkles,
  User,
  Bot,
  Volume2,
  VolumeX,
  Loader,
  RefreshCw,
  X,
  Plus,
  Lightbulb
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const AIAssistantChat = ({ isOpen, onClose, user }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [moodInsights, setMoodInsights] = useState({})
  const [crisisAlert, setCrisisAlert] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  
  const messagesEndRef = useRef(null)
  const recognition = useRef(null)
  const synthesis = useRef(null)

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      recognition.current = new SpeechRecognition()
      recognition.current.continuous = false
      recognition.current.interimResults = false
      recognition.current.lang = 'en-US'
      
      recognition.current.onstart = () => {
        console.log('Voice recognition started')
        setIsListening(true)
      }
      
      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        console.log('Voice transcript:', transcript)
        setInputMessage(transcript)
        setIsListening(false)
        // Auto-send voice message
        sendMessage(transcript, true)
      }
      
      recognition.current.onerror = (event) => {
        console.error('Voice recognition error:', event.error)
        setIsListening(false)
      }
      
      recognition.current.onend = () => {
        console.log('Voice recognition ended')
        setIsListening(false)
      }
    } else {
      console.log('Speech recognition not supported')
      setSpeechSupported(false)
    }
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesis.current = window.speechSynthesis
    }

    // Add welcome message
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'ai',
        content: `Hello ${user?.full_name || user?.username}! 👋 I'm your AI mental health companion. I have access to your recent mood entries and I'm here to provide personalized support. How are you feeling today?`,
        timestamp: new Date(),
        mood_aware: true
      }])
    }
  }, [isOpen, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (message = inputMessage, isVoice = false) => {
    if (!message.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date(),
      isVoice
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const authToken = localStorage.getItem('authToken')
      const endpoint = isVoice ? '/api/ai/voice-chat' : '/api/ai/chat'
      const payload = isVoice 
        ? { transcript: message, conversation_id: conversationId }
        : { message, conversation_id: conversationId }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const result = await response.json()
        
        // Set conversation ID if new
        if (!conversationId) {
          setConversationId(result.conversation_id)
        }

        // Add AI response
        const responseContent = isVoice 
          ? result.text_response?.content || result.voice_response?.speech_text
          : result.response?.content

        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: responseContent,
          timestamp: new Date(),
          tone: isVoice ? result.text_response?.tone : result.response?.tone,
          mood_aware: result.response?.mood_aware || false,
          voice_response: isVoice ? result.voice_response : null
        }

        setMessages(prev => [...prev, aiMessage])
        setRecommendations(result.recommendations || [])
        setMoodInsights(result.mood_insights || {})
        
        // Handle crisis alert
        if (result.crisis_assessment?.intervention_required) {
          setCrisisAlert(true)
        }

        // Speak response if voice chat and speech synthesis is supported
        if (isVoice && synthesis.current && responseContent) {
          speakText(responseContent)
        }
        
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm having trouble connecting right now. Please try again in a moment. If you need immediate help, call 988 (Crisis Lifeline).",
        timestamp: new Date(),
        isError: true
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const startListening = () => {
    if (recognition.current && !isListening && speechSupported) {
      try {
        recognition.current.start()
      } catch (error) {
        console.error('Error starting voice recognition:', error)
        setIsListening(false)
      }
    }
  }

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop()
      setIsListening(false)
    }
  }

  const speakText = (text) => {
    if (synthesis.current && !isSpeaking) {
      // Stop any ongoing speech
      synthesis.current.cancel()
      
      setIsSpeaking(true)
      
      // Enhanced speech synthesis for human-like voice
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Get available voices and prefer natural ones
      const voices = synthesis.current.getVoices()
      const preferredVoices = voices.filter(voice => 
        voice.name.includes('Neural') || 
        voice.name.includes('Natural') ||
        voice.name.includes('Premium') ||
        voice.name.includes('Enhanced')
      )
      
      // Use the best available voice
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0]
      } else if (voices.length > 0) {
        // Fallback to first available voice
        utterance.voice = voices[0]
      }
      
      // Enhanced voice settings for human-like speech
      utterance.rate = 0.85  // Slightly slower for clarity
      utterance.pitch = 1.0  // Natural pitch
      utterance.volume = 0.8 // Comfortable volume
      
      // Add emphasis for important words
      let enhancedText = text
      const emphasisWords = ['important', 'help', 'support', 'crisis', 'emergency']
      emphasisWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi')
        enhancedText = enhancedText.replace(regex, `${word}`)
      })
      
      utterance.text = enhancedText
      
      utterance.onend = () => {
        setIsSpeaking(false)
      }
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error)
        setIsSpeaking(false)
      }
      
      // Speak with enhanced settings
      synthesis.current.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (synthesis.current) {
      synthesis.current.cancel()
      setIsSpeaking(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
      style={{ zIndex: 10000 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute right-4 top-4 bottom-4 w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="p-2 bg-white bg-opacity-20 rounded-full"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-6 h-6" />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg">AI Mental Health Assistant</h3>
                <p className="text-sm opacity-90">
                  {moodInsights.data_points ? `Knows your last ${moodInsights.data_points} moods` : 'Personalized support'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Crisis Alert */}
        <AnimatePresence>
          {crisisAlert && (
            <motion.div
              className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800">Crisis Support Available</h4>
                  <p className="text-red-700 text-sm mt-1">
                    I'm concerned about you. Please reach out for immediate help.
                  </p>
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => window.open('tel:988')}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                      📞 Call 988 (Crisis Lifeline)
                    </button>
                    <button
                      onClick={() => setCrisisAlert(false)}
                      className="w-full border border-red-300 text-red-700 py-2 px-4 rounded-lg text-sm hover:bg-red-50 transition-colors"
                    >
                      I'm Safe
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`max-w-[80%] ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : message.isError
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                } rounded-2xl p-4 shadow-lg`}>
                  
                  {/* Message Header */}
                  <div className="flex items-center space-x-2 mb-2">
                    {message.type === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                    <span className="text-xs font-semibold opacity-75">
                      {message.type === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    {message.isVoice && (
                      <Mic className="w-3 h-3 opacity-75" />
                    )}
                    {message.mood_aware && (
                      <Heart className="w-3 h-3 opacity-75" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>

                  {/* Voice Controls */}
                  {message.type === 'ai' && synthesis.current && (
                    <div className="mt-3 flex items-center space-x-2">
                      <button
                        onClick={() => speakText(message.content)}
                        disabled={isSpeaking}
                        className="flex items-center space-x-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded-full transition-colors disabled:opacity-50"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Speak</span>
                      </button>
                      {isSpeaking && (
                        <button
                          onClick={stopSpeaking}
                          className="flex items-center space-x-1 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded-full transition-colors"
                        >
                          <VolumeX className="w-3 h-3" />
                          <span>Stop</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs opacity-50 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-gray-100 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Recommendations */}
        <AnimatePresence>
          {recommendations.length > 0 && (
            <motion.div
              className="mx-4 mb-4 p-4 bg-green-50 border border-green-200 rounded-xl"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="w-4 h-4 text-green-600" />
                <h4 className="font-semibold text-green-800 text-sm">AI Recommendations</h4>
              </div>
              <div className="space-y-2">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <motion.div
                    key={index}
                    className="text-sm text-green-700 flex items-start space-x-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts with AI..."
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="2"
                disabled={isLoading}
              />
            </div>
            
            {/* Voice Button */}
            {speechSupported && (
              <motion.button
                onClick={isListening ? stopListening : startListening}
                className={`p-3 rounded-full transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>
            )}

            {/* Send Button */}
            <motion.button
              onClick={() => sendMessage()}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Status indicators */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              {isListening && (
                <span className="flex items-center space-x-1 text-red-500">
                  <Mic className="w-3 h-3" />
                  <span>Listening...</span>
                </span>
              )}
              {isSpeaking && (
                <span className="flex items-center space-x-1 text-blue-500">
                  <Volume2 className="w-3 h-3" />
                  <span>Speaking...</span>
                </span>
              )}
              {!speechSupported && (
                <span className="text-gray-400">Voice not supported</span>
              )}
            </div>
            <span>Press Enter to send</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AIAssistantChat