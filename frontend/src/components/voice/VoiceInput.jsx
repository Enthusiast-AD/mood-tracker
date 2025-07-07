// import React, { useState, useEffect, useRef } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import VoiceService from '../../services/VoiceService'
// import { showToast } from '../ui/EnhancedToast'
// import AnimatedButton from '../ui/AnimatedButton'

// const VoiceInput = ({ onVoiceResult, onVoiceCommand, disabled = false }) => {
//   const [isListening, setIsListening] = useState(false)
//   const [transcript, setTranscript] = useState('')
//   const [isSupported, setIsSupported] = useState(false)
//   const [isOnline, setIsOnline] = useState(navigator.onLine)
//   const [confidence, setConfidence] = useState(0)
//   const [showVisualizer, setShowVisualizer] = useState(false)
//   const [errorMessage, setErrorMessage] = useState('')
//   const [retryCount, setRetryCount] = useState(0)
//   const visualizerRef = useRef(null)
//   const animationRef = useRef(null)

//   useEffect(() => {
//     setIsSupported(VoiceService.isVoiceSupported())

//     // Monitor online status
//     const handleOnline = () => {
//       setIsOnline(true)
//       setErrorMessage('')
//     }
//     const handleOffline = () => {
//       setIsOnline(false)
//       setErrorMessage('No internet connection - voice input requires online access')
//     }

//     window.addEventListener('online', handleOnline)
//     window.addEventListener('offline', handleOffline)

//     // Set up voice service callbacks with enhanced error handling
//     VoiceService.onStart = () => {
//       setIsListening(true)
//       setShowVisualizer(true)
//       setTranscript('')
//       setErrorMessage('')
//       showToast.info('🎤 Listening... Speak naturally!')
//     }

//     VoiceService.onResult = (result) => {
//       setTranscript(result.transcript)
//       setConfidence(result.confidence)
      
//       if (result.isFinal) {
//         handleVoiceResult(result.transcript)
//       }
//     }

//     VoiceService.onError = (error) => {
//       setIsListening(false)
//       setShowVisualizer(false)
//       setRetryCount(VoiceService.retryCount || 0)
      
//       handleVoiceError(error)
//     }

//     VoiceService.onEnd = () => {
//       setIsListening(false)
//       setShowVisualizer(false)
//     }

//     return () => {
//       window.removeEventListener('online', handleOnline)
//       window.removeEventListener('offline', handleOffline)
//       VoiceService.onStart = null
//       VoiceService.onResult = null
//       VoiceService.onError = null
//       VoiceService.onEnd = null
//     }
//   }, [])

//   const handleVoiceError = (error) => {
//     console.error('Voice error handled:', error)
    
//     const errorMessages = {
//       'network_retry_1': 'Network issue detected, retrying... (1/3)',
//       'network_retry_2': 'Network issue detected, retrying... (2/3)',
//       'network_retry_3': 'Network issue detected, retrying... (3/3)',
//       'network_failed_fallback': '🌐 Network connection poor. Voice input requires stable internet.',
//       'no_speech_detected': '🔇 No speech detected. Please try speaking closer to your microphone.',
//       'microphone_access_denied': '🎤 Microphone access denied. Please enable microphone permissions.',
//       'permission_denied': '🚫 Microphone permission denied. Please allow microphone access in browser settings.',
//       'service_not_available': '🚧 Speech recognition service temporarily unavailable.',
//       'language_not_supported': '🌍 Selected language not supported. Try switching to English.',
//       'unknown_error': '❓ Unknown error occurred. Please try again.',
//       'No internet connection available for speech recognition': '🌐 Internet connection required for voice input'
//     }

//     const message = errorMessages[error] || errorMessages['unknown_error']
//     setErrorMessage(message)
    
//     // Show appropriate toast based on error type
//     if (error.startsWith('network_retry')) {
//       showToast.warning(message)
//     } else if (error === 'network_failed_fallback') {
//       showToast.error('🌐 Voice input failed - please check your internet connection')
//     } else if (error.includes('permission') || error.includes('microphone')) {
//       showToast.error('🎤 Microphone access required for voice input')
//     } else {
//       showToast.error(`🎤 Voice input error: ${message}`)
//     }
//   }

//   const handleVoiceResult = (finalTranscript) => {
//     if (!finalTranscript.trim()) return

//     // Process voice command with enhanced processing
//     const command = VoiceService.processVoiceCommand(finalTranscript)
    
//     // Notify parent components
//     if (onVoiceResult) onVoiceResult(finalTranscript)
//     if (onVoiceCommand) onVoiceCommand(command)

//     // Provide enhanced audio feedback
//     const responses = {
//       'mood_score': `Got it, mood score ${command.value}`,
//       'emotions': `I heard ${command.value.join(' and ')}`,
//       'activity': `Activity recorded as ${command.value}`,
//       'notes': 'Notes recorded successfully',
//       'unknown': 'I heard you, processing your input'
//     }

//     const response = responses[command.type] || responses.unknown
//     VoiceService.speak(response)
//     showToast.success(`🧠 ${response}`)
//   }

//   const startListening = async () => {
//     if (!isSupported) {
//       showToast.error('🎤 Voice input not supported in this browser. Try Chrome or Edge.')
//       return
//     }

//     if (!isOnline) {
//       showToast.error('🌐 Internet connection required for voice input')
//       return
//     }

//     try {
//       setErrorMessage('')
//       await VoiceService.startListening()
//     } catch (error) {
//       console.error('Failed to start voice input:', error)
//       handleVoiceError(error.message)
//     }
//   }

//   const stopListening = () => {
//     VoiceService.stopListening()
//     setErrorMessage('')
//   }

//   // Voice visualizer animation
//   useEffect(() => {
//     if (showVisualizer && visualizerRef.current) {
//       const animate = () => {
//         const bars = visualizerRef.current.children
//         for (let i = 0; i < bars.length; i++) {
//           const height = Math.random() * 100 + 20
//           bars[i].style.height = `${height}%`
//         }
//         animationRef.current = requestAnimationFrame(animate)
//       }
//       animate()
//     } else if (animationRef.current) {
//       cancelAnimationFrame(animationRef.current)
//     }

//     return () => {
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current)
//       }
//     }
//   }, [showVisualizer])

//   // Get connection status display
//   const getConnectionStatus = () => {
//     if (!isOnline) return { color: 'text-red-600', icon: '🔴', text: 'Offline' }
//     if (!isSupported) return { color: 'text-gray-600', icon: '🚫', text: 'Not Supported' }
//     return { color: 'text-green-600', icon: '🟢', text: 'Ready' }
//   }

//   const connectionStatus = getConnectionStatus()

//   if (!isSupported && !isOnline) {
//     return (
//       <div className="text-center p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
//         <motion.span 
//           className="text-4xl mb-3 block"
//           animate={{ scale: [1, 1.1, 1] }}
//           transition={{ duration: 2, repeat: Infinity }}
//         >
//           🚫
//         </motion.span>
//         <h3 className="font-bold text-red-800 mb-2">Voice Input Unavailable</h3>
//         <p className="text-red-700 text-sm mb-4">
//           Voice input requires both browser support and internet connection.
//         </p>
//         <div className="text-xs text-red-600 space-y-1">
//           <div>Browser Support: {isSupported ? '✅' : '❌'}</div>
//           <div>Internet Connection: {isOnline ? '✅' : '❌'}</div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="voice-input-container">
//       {/* Connection Status Banner */}
//       <motion.div 
//         className={`flex items-center justify-center space-x-2 p-2 rounded-lg mb-4 ${
//           connectionStatus.color === 'text-green-600' ? 'bg-green-50 border border-green-200' :
//           connectionStatus.color === 'text-red-600' ? 'bg-red-50 border border-red-200' :
//           'bg-gray-50 border border-gray-200'
//         }`}
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         <span className="text-lg">{connectionStatus.icon}</span>
//         <span className={`text-sm font-medium ${connectionStatus.color}`}>
//           Voice System: {connectionStatus.text}
//         </span>
//         {retryCount > 0 && (
//           <span className="text-xs text-orange-600">
//             (Retry {retryCount}/3)
//           </span>
//         )}
//       </motion.div>

//       {/* Error Message Display */}
//       <AnimatePresence>
//         {errorMessage && (
//           <motion.div
//             className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.95 }}
//           >
//             <div className="flex items-start space-x-2">
//               <span className="text-red-600 text-lg">⚠️</span>
//               <div className="flex-1">
//                 <p className="text-red-800 font-medium text-sm">Voice Input Error</p>
//                 <p className="text-red-700 text-sm">{errorMessage}</p>
//               </div>
//               <button
//                 onClick={() => setErrorMessage('')}
//                 className="text-red-400 hover:text-red-600"
//               >
//                 ✕
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Voice Input Button */}
//       <div className="flex flex-col items-center space-y-4">
//         <motion.div
//           className="relative"
//           whileHover={{ scale: disabled ? 1 : 1.05 }}
//           whileTap={{ scale: disabled ? 1 : 0.95 }}
//         >
//           <AnimatedButton
//             onClick={isListening ? stopListening : startListening}
//             disabled={disabled || (!isOnline && !isListening)}
//             variant={isListening ? "danger" : "primary"}
//             size="lg"
//             className={`w-20 h-20 rounded-full ${
//               isListening 
//                 ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
//                 : !isOnline
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : 'bg-blue-500 hover:bg-blue-600'
//             }`}
//             icon={
//               <motion.span 
//                 className="text-3xl"
//                 animate={isListening ? { scale: [1, 1.2, 1] } : {}}
//                 transition={{ duration: 1, repeat: Infinity }}
//               >
//                 {!isOnline ? '🌐' : isListening ? '🔴' : '🎤'}
//               </motion.span>
//             }
//           >
//             {/* Button text hidden, using icon only */}
//           </AnimatedButton>

//           {/* Recording indicator */}
//           <AnimatePresence>
//             {isListening && (
//               <motion.div
//                 className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-2 border-white"
//                 initial={{ scale: 0 }}
//                 animate={{ scale: [1, 1.3, 1] }}
//                 exit={{ scale: 0 }}
//                 transition={{ duration: 0.8, repeat: Infinity }}
//               />
//             )}
//           </AnimatePresence>
//         </motion.div>

//         {/* Voice Input Label */}
//         <div className="text-center">
//           <p className="font-semibold text-gray-800">
//             {!isOnline ? '🌐 Connection Required' :
//              isListening ? '🎤 Listening...' : '🎤 Voice Input'}
//           </p>
//           <p className="text-sm text-gray-600">
//             {!isOnline ? 'Internet connection needed for voice input' :
//              isListening ? 'Speak naturally about your mood' : 
//              'Tap to start voice input'}
//           </p>
//         </div>
//       </div>

//       {/* Voice Visualizer */}
//       <AnimatePresence>
//         {showVisualizer && (
//           <motion.div
//             className="flex items-end justify-center space-x-1 h-16 mt-6"
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.8 }}
//             ref={visualizerRef}
//           >
//             {[...Array(12)].map((_, i) => (
//               <motion.div
//                 key={i}
//                 className="w-3 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
//                 style={{ height: '20%' }}
//                 animate={{ height: ['20%', '80%', '20%'] }}
//                 transition={{
//                   duration: 0.8,
//                   repeat: Infinity,
//                   delay: i * 0.1
//                 }}
//               />
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Live Transcript */}
//       <AnimatePresence>
//         {transcript && (
//           <motion.div
//             className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//           >
//             <div className="flex items-start space-x-2">
//               <span className="text-blue-600 text-lg">💬</span>
//               <div className="flex-1">
//                 <p className="text-blue-800 font-medium">Live Transcript:</p>
//                 <p className="text-blue-700 mt-1">{transcript}</p>
//                 {confidence > 0 && (
//                   <div className="mt-2 flex items-center space-x-2">
//                     <span className="text-xs text-blue-600">Confidence:</span>
//                     <div className="flex-1 bg-blue-200 rounded-full h-2">
//                       <motion.div
//                         className="bg-blue-500 h-full rounded-full"
//                         initial={{ width: 0 }}
//                         animate={{ width: `${confidence * 100}%` }}
//                         transition={{ duration: 0.3 }}
//                       />
//                     </div>
//                     <span className="text-xs text-blue-600">{Math.round(confidence * 100)}%</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Enhanced Voice Commands Help */}
//       <motion.div
//         className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.5 }}
//       >
//         <h4 className="font-semibold text-green-800 mb-2 flex items-center">
//           <span className="mr-2">💡</span>
//           Enhanced Voice Commands:
//         </h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
//           <div>• "I feel a 7 out of 10"</div>
//           <div>• "My mood is 5"</div>
//           <div>• "I'm feeling really happy and excited"</div>
//           <div>• "I feel very sad and tired"</div>
//           <div>• "I'm working from home today"</div>
//           <div>• "I had a stressful meeting"</div>
//           <div>• "I'm at the gym exercising"</div>
//           <div>• Or just describe your mood naturally</div>
//         </div>
//         {!isOnline && (
//           <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-xs">
//             📡 Voice commands require internet connection to work properly
//           </div>
//         )}
//       </motion.div>
//     </div>
//   )
// }

// export default VoiceInput

import React from 'react'
import { motion } from 'framer-motion'

const VoiceInput = ({ onVoiceResult, onVoiceCommand, disabled = false }) => {
  return (
    <motion.div 
      className="text-center p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.span 
        className="text-4xl mb-3 block"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🚧
      </motion.span>
      <h3 className="font-bold text-purple-800 mb-2">Voice Input Coming Soon!</h3>
      <p className="text-purple-700 text-sm mb-4">
        Voice features are being developed and will be available in the next update.
      </p>
      <div className="text-xs text-purple-600 bg-purple-100 rounded-lg p-3">
        <p className="font-semibold mb-1">🎤 Planned Voice Features:</p>
        <div className="space-y-1">
          <div>• "I feel a 7 out of 10" → Auto mood score</div>
          <div>• "I'm feeling happy and excited" → Emotion selection</div>
          <div>• Full speech-to-text for mood notes</div>
        </div>
      </div>
    </motion.div>
  )
}

export default VoiceInput