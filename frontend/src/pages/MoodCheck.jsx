import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { showToast } from '../components/ui/EnhancedToast'
import AnimatedButton from '../components/ui/AnimatedButton'
import VoiceInput from '../components/voice/VoiceInput'
import NotificationService from '../services/NotificationService'
import { MoodCheckSkeleton } from '../components/ui/LoadingStates'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function MoodCheck() {
  const navigate = useNavigate()
  const [moodEntry, setMoodEntry] = useState({
    score: 5,
    emotions: [],
    notes: '',
    activity: '',
    location: '',
    weather: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [crisisAlert, setCrisisAlert] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [currentStep, setCurrentStep] = useState(1)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showTips, setShowTips] = useState(true)
  const [selectedEmotionDetails, setSelectedEmotionDetails] = useState(null)
  const [voiceMode, setVoiceMode] = useState(false)
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const emotions = [
    { 
      id: 'happy', 
      label: 'Happy', 
      emoji: '😊', 
      color: 'from-yellow-400 to-orange-400',
      description: 'Feeling joyful and content',
      tips: ['Share this positivity with others', 'Take note of what made you happy'],
      voiceKeywords: ['happy', 'joyful', 'cheerful', 'glad', 'delighted', 'pleased']
    },
    { 
      id: 'sad', 
      label: 'Sad', 
      emoji: '😢', 
      color: 'from-blue-400 to-blue-600',
      description: 'Feeling down or melancholy',
      tips: ['Allow yourself to feel this emotion', 'Consider talking to someone you trust'],
      voiceKeywords: ['sad', 'unhappy', 'down', 'blue', 'melancholy', 'depressed']
    },
    { 
      id: 'anxious', 
      label: 'Anxious', 
      emoji: '😰', 
      color: 'from-purple-400 to-pink-400',
      description: 'Feeling worried or nervous',
      tips: ['Try deep breathing exercises', 'Focus on what you can control'],
      voiceKeywords: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy']
    },
    { 
      id: 'calm', 
      label: 'Calm', 
      emoji: '😌', 
      color: 'from-green-400 to-teal-400',
      description: 'Feeling peaceful and relaxed',
      tips: ['Enjoy this peaceful moment', 'Practice mindfulness to maintain calm'],
      voiceKeywords: ['calm', 'peaceful', 'relaxed', 'tranquil', 'serene', 'composed']
    },
    { 
      id: 'excited', 
      label: 'Excited', 
      emoji: '🤗', 
      color: 'from-red-400 to-pink-400',
      description: 'Feeling enthusiastic and energetic',
      tips: ['Channel this energy positively', 'Share your excitement with others'],
      voiceKeywords: ['excited', 'thrilled', 'enthusiastic', 'energetic', 'pumped']
    },
    { 
      id: 'angry', 
      label: 'Angry', 
      emoji: '😠', 
      color: 'from-red-500 to-red-700',
      description: 'Feeling frustrated or mad',
      tips: ['Take deep breaths before reacting', 'Identify what triggered this feeling'],
      voiceKeywords: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated']
    },
    { 
      id: 'tired', 
      label: 'Tired', 
      emoji: '😴', 
      color: 'from-gray-400 to-gray-600',
      description: 'Feeling exhausted or drained',
      tips: ['Consider getting more rest', 'Take breaks when needed'],
      voiceKeywords: ['tired', 'exhausted', 'drained', 'fatigued', 'sleepy', 'weary']
    },
    { 
      id: 'stressed', 
      label: 'Stressed', 
      emoji: '😫', 
      color: 'from-orange-400 to-red-400',
      description: 'Feeling overwhelmed or pressured',
      tips: ['Break tasks into smaller steps', 'Practice stress-relief techniques'],
      voiceKeywords: ['stressed', 'overwhelmed', 'pressured', 'burdened']
    },
    { 
      id: 'confident', 
      label: 'Confident', 
      emoji: '💪', 
      color: 'from-indigo-400 to-purple-400',
      description: 'Feeling self-assured and capable',
      tips: ['Use this confidence to tackle challenges', 'Remember this feeling for tough times'],
      voiceKeywords: ['confident', 'sure', 'self-assured', 'certain', 'positive']
    },
    { 
      id: 'lonely', 
      label: 'Lonely', 
      emoji: '😔', 
      color: 'from-blue-500 to-indigo-500',
      description: 'Feeling isolated or disconnected',
      tips: ['Reach out to friends or family', 'Consider joining social activities'],
      voiceKeywords: ['lonely', 'isolated', 'alone', 'disconnected', 'solitary']
    }
  ]

  const activities = [
    { value: 'work', label: '💼 Work', icon: '💼', voiceKeywords: ['work', 'working', 'office', 'job', 'meeting'] },
    { value: 'exercise', label: '🏃‍♀️ Exercise', icon: '🏃‍♀️', voiceKeywords: ['exercise', 'workout', 'gym', 'running', 'walking'] },
    { value: 'socializing', label: '👥 Socializing', icon: '👥', voiceKeywords: ['friends', 'family', 'party', 'hanging out', 'socializing'] },
    { value: 'relaxing', label: '🧘‍♀️ Relaxing', icon: '🧘‍♀️', voiceKeywords: ['relaxing', 'resting', 'chilling', 'unwinding'] },
    { value: 'studying', label: '📚 Studying', icon: '📚', voiceKeywords: ['studying', 'reading', 'learning', 'homework'] },
    { value: 'commuting', label: '🚗 Commuting', icon: '🚗', voiceKeywords: ['commuting', 'driving', 'traveling'] },
    { value: 'sleeping', label: '😴 sleepy', icon: '😴', voiceKeywords: ['sleeping', 'napping', 'resting'] },
    { value: 'eating', label: '🍽️ Eating', icon: '🍽️', voiceKeywords: ['eating', 'dining', 'food'] },
    { value: 'entertainment', label: '🎬 Entertainment', icon: '🎬', voiceKeywords: ['watching', 'movies', 'tv', 'entertainment'] },
    { value: 'other', label: '🌟 Other', icon: '🌟', voiceKeywords: ['other', 'something else'] }
  ]

  const moodDescriptions = {
    1: { text: "Really struggling", color: "text-red-700", bg: "bg-red-100" },
    2: { text: "Having a tough time", color: "text-red-600", bg: "bg-red-50" },
    3: { text: "Feeling low", color: "text-orange-600", bg: "bg-orange-50" },
    4: { text: "Not great", color: "text-yellow-600", bg: "bg-yellow-50" },
    5: { text: "Okay, neutral", color: "text-gray-600", bg: "bg-gray-50 dark:bg-gray-600 " },
    6: { text: "Pretty good", color: "text-blue-600", bg: "bg-blue-50" },
    7: { text: "Feeling good", color: "text-green-600", bg: "bg-green-50" },
    8: { text: "Really good", color: "text-green-700", bg: "bg-green-100" },
    9: { text: "Amazing!", color: "text-emerald-700", bg: "bg-emerald-100" },
    10: { text: "Absolutely fantastic!", color: "text-emerald-800", bg: "bg-emerald-200" }
  }

  // Handle voice commands
  const handleVoiceCommand = (command) => {
    console.log('🎤 Voice command received:', command)
    
    switch (command.type) {
      case 'mood_score':
        setMoodEntry(prev => ({ ...prev, score: command.value }))
        showToast.success(`🎤 Mood score set to ${command.value}`)
        break
        
      case 'emotions':
        const newEmotions = [...new Set([...moodEntry.emotions, ...command.value])]
        setMoodEntry(prev => ({ ...prev, emotions: newEmotions }))
        showToast.success(`🎤 Added emotions: ${command.value.join(', ')}`)
        break
        
      case 'activity':
        setMoodEntry(prev => ({ ...prev, activity: command.value }))
        showToast.success(`🎤 Activity set to ${command.value}`)
        break
        
      case 'notes':
        setMoodEntry(prev => ({ ...prev, notes: command.value }))
        showToast.success('🎤 Notes added from voice input')
        break
        
      default:
        console.log('🎤 Unknown voice command:', command)
    }
  }

  // Handle voice transcript for notes
  const handleVoiceResult = (transcript) => {
    if (currentStep === 4) { // Notes step
      setMoodEntry(prev => ({
        ...prev,
        notes: prev.notes + (prev.notes ? ' ' : '') + transcript
      }))
    }
  }

  const handleEmotionToggle = (emotionId) => {
    setMoodEntry(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotionId)
        ? prev.emotions.filter(id => id !== emotionId)
        : [...prev.emotions, emotionId]
    }))
    
    // Show emotion details
    const emotion = emotions.find(e => e.id === emotionId)
    setSelectedEmotionDetails(emotion)
    setTimeout(() => setSelectedEmotionDetails(null), 3000)
  }

  const saveToLocalStorage = (moodData) => {
    try {
      const existingData = JSON.parse(localStorage.getItem('offlineMoods') || '[]')
      existingData.push({ ...moodData, offline: true, id: Date.now() })
      localStorage.setItem('offlineMoods', JSON.stringify(existingData))
    } catch (error) {
      console.error('Failed to save offline:', error)
    }
  }

  const generateMockAnalysis = (moodData) => {
    const score = moodData.score
    return {
      sentiment: score >= 6 ? 'positive' : score <= 4 ? 'negative' : 'neutral',
      sentiment_confidence: 0.85,
      energy_level: score >= 7 ? 'high' : score <= 3 ? 'low' : 'moderate',
      risk_level: score <= 3 ? 'medium' : 'low',
      risk_indicators: score <= 3 ? ['Low mood score'] : [],
      emotional_complexity: moodData.emotions.length,
      analysis_method: 'local_analysis',
      crisis_score: score <= 2 ? 0.6 : 0.1,
      intervention_required: score <= 2
    }
  }

  const generateMockRecommendations = (score) => {
    if (score >= 8) {
      return [
        '🎉 You\'re doing amazing! Keep up whatever you\'re doing',
        '✨ Share your positive energy - it can inspire others',
        '📝 Consider journaling about what made today special',
        '🌟 Use this good mood to tackle something you\'ve been putting off'
      ]
    } else if (score >= 6) {
      return [
        '😊 You\'re in a good space - that\'s wonderful!',
        '🚶‍♀️ A gentle walk might help maintain this positive feeling',
        '💝 Do something kind for yourself or others',
        '📱 Connect with someone who makes you smile'
      ]
    } else if (score >= 4) {
      return [
        '🤗 It\'s okay to have neutral days - you\'re doing fine',
        '🧘‍♀️ Try a 5-minute breathing exercise',
        '💬 Consider talking to a friend or family member',
        '🎵 Listen to music that usually lifts your spirits'
      ]
    } else {
      return [
        '💙 Remember that difficult feelings are temporary',
        '📞 Consider reaching out to someone you trust',
        '🛁 Try a small self-care activity like a warm bath',
        '🏥 If you need immediate help, call 988 (Crisis Lifeline)',
        '🤝 You don\'t have to go through this alone'
      ]
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (moodEntry.emotions.length === 0) {
      showToast.warning('Please select at least one emotion to continue')
      setCurrentStep(2) // Go back to emotions step
      return
    }

    setIsSubmitting(true)
    setCrisisAlert(false)

    try {
      const authToken = localStorage.getItem('authToken')

      if (!authToken) {
        const mockAnalysis = generateMockAnalysis(moodEntry)
        const mockRecommendations = generateMockRecommendations(moodEntry.score)

        setAnalysis(mockAnalysis)
        setRecommendations(mockRecommendations)
        saveToLocalStorage(moodEntry)
        
        showToast.mood('🤖 Mood analyzed locally - Sign in for AI cloud analysis!')
        showCelebrationAndReset()
        return
      }

      let response = await fetch(`${API_BASE_URL}/api/mood/track-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(moodEntry)
      })

      if (!response.ok && response.status === 404) {
        console.log('🔄 Trying basic mood tracking endpoint...')
        response = await fetch(`${API_BASE_URL}/api/mood/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(moodEntry)
        })
      }

      if (response.ok) {
        const result = await response.json()

        if (result.complete_ai_analysis) {
          setAnalysis(result.complete_ai_analysis)
          setRecommendations(result.recommendations || [])
          if (result.intervention_triggered) {
            setCrisisAlert(true)
            // Send crisis notification
            await NotificationService.sendCrisisAlert()
          }
        } else if (result.analysis) {
          setAnalysis(result.analysis)
          setRecommendations(result.recommendations || generateMockRecommendations(moodEntry.score))
        } else {
          setAnalysis(generateMockAnalysis(moodEntry))
          setRecommendations(generateMockRecommendations(moodEntry.score))
        }

        // Send achievement notification for tracking
        await NotificationService.sendAchievementNotification({
          type: 'mood-tracked',
          description: 'Mood tracked successfully!'
        })

        showToast.success('🎉 Mood tracked successfully with AI analysis!')
        showCelebrationAndReset()
      } else {
        throw new Error(`API error: ${response.status}`)
      }

    } catch (error) {
      console.error('Error submitting mood:', error)

      const mockAnalysis = generateMockAnalysis(moodEntry)
      const mockRecommendations = generateMockRecommendations(moodEntry.score)

      setAnalysis(mockAnalysis)
      setRecommendations(mockRecommendations)
      saveToLocalStorage(moodEntry)

      if (error.message.includes('404')) {
        showToast.info('🔄 Using local analysis - API endpoint not found')
      } else {
        showToast.info('🔄 Using local analysis - connection issue')
      }

      showCelebrationAndReset()

    } finally {
      setIsSubmitting(false)
    }
  }

  const showCelebrationAndReset = () => {
    setShowCelebration(true)
    setTimeout(() => {
      setShowCelebration(false)
      setCurrentStep(1)
      resetForm()
    }, 4000)
  }

  const resetForm = () => {
    setMoodEntry({
      score: 5,
      emotions: [],
      notes: '',
      activity: '',
      location: '',
      weather: ''
    })
  }

  const getMoodEmoji = () => {
    if (moodEntry.score >= 9) return '🤩'
    if (moodEntry.score >= 7) return '😊'
    if (moodEntry.score >= 5) return '😐'
    if (moodEntry.score >= 3) return '😔'
    return '😢'
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  const progressPercentage = (currentStep / 4) * 100

  return (
    <motion.div 
      className="max-w-5xl mx-auto py-8 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Enhanced Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 text-center max-w-md mx-4 shadow-2xl"
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="text-8xl mb-6"
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 15, -15, 0]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: 2
                }}
              >
                🎉
              </motion.div>
              
              <motion.h2 
                className="text-3xl font-bold text-gray-800 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Mood Tracked Successfully!
              </motion.h2>
              
              <motion.p 
                className="text-gray-600 mb-6 text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Thank you for taking care of your mental health! 💙
              </motion.p>
              
              <motion.div
                className="flex flex-col space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <AnimatedButton
                  onClick={() => navigate('/dashboard')}
                  variant="primary"
                  size="lg"
                  icon="📊"
                >
                  View Your Analytics
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => {
                    setShowCelebration(false)
                    setCurrentStep(1)
                    resetForm()
                  }}
                  variant="outline"
                  icon="➕"
                >
                  Track Another Mood
                </AnimatedButton>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h1 
          className="text-5xl font-bold text-blue-500  mt-2 mb-4"
          animate={{ 
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          How are you feeling today?
        </motion.h1>
        
        <motion.p 
          className="text-blue-400 text-xl mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Track your mood with AI-powered insights and voice input
        </motion.p>

        {/* Voice Mode Toggle */}
        <motion.div 
          className="flex items-center justify-center space-x-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-sm text-gray-600">Voice Mode:</span>
          <motion.button
            className={`w-12 h-6 rounded-full ${
              voiceMode ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onClick={() => setVoiceMode(!voiceMode)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full shadow-md"
              animate={{
                x: voiceMode ? 28 : 4
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
          <span className="text-sm text-blue-600">
            {voiceMode ? '🎤 Voice Enabled' : '✋ Manual Input'}
          </span>
        </motion.div>

        {/* Enhanced Progress Bar */}
        <motion.div 
          className="mt-8 bg-white rounded-full h-4 max-w-lg mx-auto shadow-inner border-2 border-blue-100"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <motion.div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full rounded-full flex items-center justify-end pr-2"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          >
            <motion.span 
              className="text-white text-xs font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: progressPercentage > 15 ? 1 : 0 }}
            >
              {Math.round(progressPercentage)}%
            </motion.span>
          </motion.div>
        </motion.div>
        
        <motion.p 
          className="text-sm text-gray-500 mt-3 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          Step {currentStep} of 4 • {progressPercentage === 100 ? 'Ready to submit!' : 'Keep going!'}
        </motion.p>
      </motion.div>

      {/* Voice Input Integration */}
      {voiceMode && (
        <motion.div
          className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <VoiceInput
            onVoiceCommand={handleVoiceCommand}
            onVoiceResult={handleVoiceResult}
            disabled={isSubmitting}
          />
        </motion.div>
      )}

      {/* Enhanced Offline Status */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            className="bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-yellow-400 text-yellow-800 px-6 py-4 rounded-lg mb-6 shadow-md"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            <div className="flex items-center">
              <motion.span 
                className="text-2xl mr-3"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📱
              </motion.span>
              <div>
                <p className="font-semibold">You're offline</p>
                <p className="text-sm">Mood data will be saved locally and synced when connection is restored.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Crisis Alert */}
      <AnimatePresence>
        {crisisAlert && (
          <motion.div
            className="bg-gradient-to-r from-red-100 to-pink-100 border-l-4 border-red-400 text-red-800 px-6 py-4 rounded-lg mb-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
          >
            <div className="flex items-start">
              <motion.span 
                className="text-3xl mr-4"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🆘
              </motion.span>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Crisis Support Available</h3>
                <p className="mb-4">Based on your mood entry, we want to make sure you have immediate support.</p>
                <div className="flex flex-wrap gap-3">
                  <AnimatedButton
                    onClick={() => window.open('tel:988')}
                    variant="danger"
                    size="sm"
                    icon="📞"
                  >
                    Call 988 (Crisis Lifeline)
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={() => window.open('sms:741741')}
                    variant="danger"
                    size="sm"
                    icon="💬"
                  >
                    Text HOME to 741741
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={() => setCrisisAlert(false)}
                    variant="outline"
                    size="sm"
                    icon="✅"
                  >
                    I'm Safe
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form Container */}
      <motion.div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Enhanced Mood Slider */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <div className="text-center">
                  {/* Voice Tip for Step 1 */}
                  {voiceMode && (
                    <motion.div
                      className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">🎤</span>
                        <div className="text-left">
                          <p className="font-semibold text-blue-800">Voice Tip</p>
                          <p className="text-blue-700 text-sm">Say "I feel a 7 out of 10" or "My mood is 5"</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Tips Section */}
                  <AnimatePresence>
                    {showTips && !voiceMode && (
                      <motion.div
                        className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">💡</span>
                            <div className="text-left">
                              <p className="font-semibold text-blue-800 dark:text-blue-100 ">Quick Tip</p>
                              <p className="text-blue-700  dark:text-blue-100 text-sm">Rate your overall mood right now, not how you want to feel.</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowTips(false)}
                            className="text-blue-400 hover:text-blue-600"
                          >
                            ✕
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <motion.div 
                    className="text-9xl mb-8"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {getMoodEmoji()}
                  </motion.div>
                  
                  <motion.div 
                    className={`inline-block px-6 py-3 rounded-full mb-6 ${moodDescriptions[moodEntry.score].bg}`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className={`text-2xl font-bold ${moodDescriptions[moodEntry.score].color}`}>
                      {moodEntry.score}/10 - {moodDescriptions[moodEntry.score].text}
                    </span>
                  </motion.div>
                  
                  <div className="px-4">
                    <motion.input
                      type="range"
                      min="1"
                      max="10"
                      value={moodEntry.score}
                      onChange={(e) => setMoodEntry(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                      className="w-full h-6 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full appearance-none cursor-pointer slider-enhanced"
                      style={{
                        background: `linear-gradient(to right, 
                          #fca5a5 0%, #fcd34d 50%, #86efac 100%)`
                      }}
                      whileFocus={{ scale: 1.02 }}
                    />
                    
                    <div className="flex justify-between text-sm text-gray-600 mt-4 px-2">
                      <span className="flex items-center">😢 <span className="ml-1 hidden sm:inline">Very Low</span></span>
                      <span className="flex items-center">😐 <span className="ml-1 hidden sm:inline">Neutral</span></span>
                      <span className="flex items-center">😊 <span className="ml-1 hidden sm:inline">Very High</span></span>
                    </div>
                  </div>

                  <motion.div className="mt-10">
                    <AnimatedButton
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      variant="primary"
                      size="lg"
                      >
                      Continue to Emotion 👉
                    </AnimatedButton>
                    
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Enhanced Emotion Selection with Voice */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                      What emotions are you experiencing?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Select all that apply - it's okay to feel multiple emotions
                    </p>
                    
                    {/* Voice Tip for Step 2 */}
                    {voiceMode && (
                      <motion.div
                        className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="flex items-center justify-center">
                          <span className="text-2xl mr-2">🎤</span>
                          <p className="text-green-700 text-sm">
                            Say "I'm feeling happy and excited" or "I feel sad and tired"
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <motion.div 
                      className="inline-block mt-4 px-4 py-2 bg-blue-100 rounded-full"
                      animate={{ scale: moodEntry.emotions.length > 0 ? [1, 1.05, 1] : 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-blue-800 font-semibold">
                        {moodEntry.emotions.length} emotion{moodEntry.emotions.length !== 1 ? 's' : ''} selected
                      </span>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: 0.05
                        }
                      }
                    }}
                  >
                    {emotions.map((emotion, index) => (
                      <motion.button
                        key={emotion.id}
                        type="button"
                        onClick={() => handleEmotionToggle(emotion.id)}
                        className={`relative p-4 rounded-2xl border-3 transition-all duration-300 ${
                          moodEntry.emotions.includes(emotion.id)
                            ? `border-blue-500 bg-gradient-to-br ${emotion.color} text-white shadow-xl scale-105`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                        }`}
                        variants={{
                          hidden: { opacity: 0, scale: 0.8, y: 20 },
                          visible: { opacity: 1, scale: 1, y: 0 }
                        }}
                        whileHover={{ 
                          scale: moodEntry.emotions.includes(emotion.id) ? 1.05 : 1.1,
                          y: -5
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Selection indicator */}
                        <AnimatePresence>
                          {moodEntry.emotions.includes(emotion.id) && (
                            <motion.div
                              className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                            >
                              ✓
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.div 
                          className="text-4xl mb-3"
                          animate={moodEntry.emotions.includes(emotion.id) ? {
                            scale: [1, 1.3, 1],
                            rotate: [0, 10, -10, 0]
                          } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          {emotion.emoji}
                        </motion.div>
                        <div className="text-sm font-semibold">{emotion.label}</div>
                        <div className="text-xs opacity-80 mt-1">{emotion.description}</div>
                      </motion.button>
                    ))}
                  </motion.div>

                  {/* Emotion Details Popup */}
                  <AnimatePresence>
                    {selectedEmotionDetails && (
                      <motion.div
                        className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-xl p-4 mb-6"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      >
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-2">{selectedEmotionDetails.emoji}</span>
                          <h3 className="font-bold text-purple-800">{selectedEmotionDetails.label}</h3>
                        </div>
                        <p className="text-purple-700 text-sm mb-2">{selectedEmotionDetails.description}</p>
                        <div className="text-xs text-purple-600">
                          <strong>Tips:</strong> {selectedEmotionDetails.tips.join(' • ')}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-center space-x-4">
                    <AnimatedButton
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      variant="outline"
                      icon="⬅️"
                    >
                      Back to Mood
                    </AnimatedButton>
                    <AnimatedButton
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      variant="primary"
                      disabled={moodEntry.emotions.length === 0}
                      icon="➡️"
                    >
                      {moodEntry.emotions.length === 0 ? 'Select at least one emotion' : 'Add Context'}
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Enhanced Context Information with Voice */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Add some context
                    </h2>
                    <p className="text-gray-600">This helps our AI provide better insights (optional)</p>
                    
                    {/* Voice Tip for Step 3 */}
                    {voiceMode && (
                      <motion.div
                        className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="flex items-center justify-center">
                          <span className="text-2xl mr-2">🎤</span>
                          <p className="text-orange-700 text-sm">
                            Say "I'm working from home" or "I'm at the gym exercising"
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Enhanced Activity Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-lg font-semibold mb-4 text-center">
                      What are you doing right now?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {activities.map((activity, index) => (
                        <motion.button
                          key={activity.value}
                          type="button"
                          onClick={() => setMoodEntry(prev => ({ 
                            ...prev, 
                            activity: prev.activity === activity.value ? '' : activity.value 
                          }))}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                            moodEntry.activity === activity.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700 scale-105'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-2xl mb-1">{activity.icon}</div>
                          <div className="text-xs font-medium">{activity.label.split(' ')[1]}</div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Location Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-lg font-semibold mb-3 text-center">
                      Where are you?
                    </label>
                    <motion.input
                      type="text"
                      value={moodEntry.location}
                      onChange={(e) => setMoodEntry(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Home, Office, Park, Coffee Shop..."
                      className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                                 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 
                                 focus:border-blue-500 transition-all text-center text-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </motion.div>

                  <div className="flex justify-center space-x-4">
                    <AnimatedButton
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                      icon="⬅️"
                    >
                      Back to Emotions
                    </AnimatedButton>
                    <AnimatedButton
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      variant="primary"
                      icon="➡️"
                    >
                      Add Notes
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Enhanced Notes with Voice Transcription */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      What's on your mind?
                    </h2>
                    <p className="text-gray-600">Share your thoughts for better AI insights (optional)</p>
                    
                    {/* Voice Tip for Step 4 */}
                    {voiceMode && (
                      <motion.div
                        className="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="flex items-center justify-center">
                          <span className="text-2xl mr-2">🎤</span>
                          <p className="text-purple-700 text-sm">
                            Speak naturally about your day, feelings, or what's happening
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.textarea
                      value={moodEntry.notes}
                      onChange={(e) => setMoodEntry(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="What's happening in your life? What might be influencing your mood? How are you feeling about things? Share anything that feels relevant..."
                      className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                                 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 
                                 focus:border-blue-500 transition-all resize-none text-lg leading-relaxed
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      rows="6"
                      maxLength="2000"
                      whileFocus={{ scale: 1.01 }}
                    />
                    
                    <motion.div 
                      className="flex justify-between items-center mt-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="text-sm text-gray-500">
                        💡 The more you share, the better our AI can help
                      </span>
                      <span className={`text-sm font-medium ${
                        moodEntry.notes.length > 1800 ? 'text-red-500' : 
                        moodEntry.notes.length > 1500 ? 'text-yellow-500' : 'text-gray-500'
                      }`}>
                        {moodEntry.notes.length}/2000
                      </span>
                    </motion.div>
                  </motion.div>

                  {/* Summary Before Submit */}
                  <motion.div
                    className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="font-bold text-green-800 mb-3 flex items-center">
                      <span className="mr-2">📋</span>
                      Your Mood Summary
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-green-700">Mood Score:</span>
                        <span className="ml-2">{moodEntry.score}/10 ({moodDescriptions[moodEntry.score].text})</span>
                      </div>
                      <div>
                        <span className="font-semibold text-green-700">Emotions:</span>
                        <span className="ml-2">{moodEntry.emotions.join(', ') || 'None selected'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-green-700">Activity:</span>
                        <span className="ml-2">{moodEntry.activity || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-green-700">Location:</span>
                        <span className="ml-2">{moodEntry.location || 'Not specified'}</span>
                      </div>
                    </div>
                    {moodEntry.notes && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <span className="font-semibold text-green-700">Notes:</span>
                        <p className="text-green-600 mt-1 text-sm italic">
                          "{moodEntry.notes.substring(0, 100)}{moodEntry.notes.length > 100 ? '...' : ''}"
                        </p>
                      </div>
                    )}
                  </motion.div>

                  <div className="flex justify-center space-x-4">
                    <AnimatedButton
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      variant="outline"
                      icon="⬅️"
                    >
                      Back to Context
                    </AnimatedButton>
                    <AnimatedButton
                      type="submit"
                      variant="success"
                      size="lg"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      icon="🧠"
                    >
                      {isSubmitting ? 'Analyzing with AI...' : 'Track My Mood'}
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Enhanced Analysis Results */}
        <AnimatePresence>
          {analysis && !showCelebration && (
            <motion.div 
              className="mt-12 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                         dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 
                         rounded-2xl border border-blue-200 dark:border-blue-800 shadow-lg"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h3 
                className="text-2xl font-bold mb-6 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.span 
                  className="mr-3 text-3xl"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🔮
                </motion.span>
                AI Analysis Results
              </motion.h3>
              
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.3
                    }
                  }
                }}
              >
                {/* Sentiment */}
                <motion.div 
                  className="bg-white p-4 rounded-xl shadow-md"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">😊</div>
                    <div className="font-semibold text-gray-700 mb-1">Sentiment</div>
                    <div className={`text-lg font-bold capitalize ${
                      analysis.sentiment === 'positive' ? 'text-green-600' :
                      analysis.sentiment === 'negative' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {analysis.sentiment || 'Neutral'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((analysis.sentiment_confidence || analysis.confidence || 0.7) * 100)}% confident
                    </div>
                  </div>
                </motion.div>

                {/* Energy Level */}
                <motion.div 
                  className="bg-white p-4 rounded-xl shadow-md"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-semibold text-gray-700 mb-1">Energy Level</div>
                    <div className={`text-lg font-bold capitalize ${
                      analysis.energy_level === 'high' ? 'text-green-600' :
                      analysis.energy_level === 'low' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {analysis.energy_level || 'Moderate'}
                    </div>
                  </div>
                </motion.div>

                {/* Risk Assessment */}
                <motion.div 
                  className="bg-white p-4 rounded-xl shadow-md"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🛡️</div>
                    <div className="font-semibold text-gray-700 mb-1">Risk Level</div>
                    <div className={`text-lg font-bold capitalize ${
                      analysis.risk_level === 'high' ? 'text-red-600' :
                      analysis.risk_level === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {analysis.risk_level || 'Low'}
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Risk Indicators */}
              {analysis.risk_indicators && analysis.risk_indicators.length > 0 && (
                <motion.div 
                  className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Risk Indicators Detected
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                    {analysis.risk_indicators.map((indicator, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        {indicator}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Recommendations */}
        <AnimatePresence>
          {recommendations.length > 0 && !showCelebration && (
            <motion.div 
              className="mt-8 p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 
                         dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 
                         rounded-2xl border border-green-200 dark:border-green-800 shadow-lg"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.h3 
                className="text-2xl font-bold mb-6 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.span 
                  className="mr-3 text-3xl"
                                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  💡
                </motion.span>
                Personalized Recommendations
              </motion.h3>
              
              <motion.div 
                className="grid gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.7
                    }
                  }
                }}
              >
                {recommendations.map((rec, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start bg-white p-4 rounded-xl shadow-md border border-green-100 dark:border-green-800"
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ x: 5, scale: 1.02 }}
                  >
                    <span className="text-green-600 mr-4 mt-1 text-lg">•</span>
                    <span className="flex-1 text-gray-700 dark:text-gray-300">{rec}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                className="flex justify-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                <AnimatedButton
                  onClick={() => navigate('/dashboard')}
                  variant="success"
                  size="lg"
                  icon="📊"
                >
                  View Detailed Analytics
                </AnimatedButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default MoodCheck