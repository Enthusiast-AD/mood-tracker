import { useState, useEffect } from 'react'
import { useToast } from '../components/ui/Toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function MoodCheck() {
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

  const { toast } = useToast()

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
    { id: 'happy', label: 'Happy', emoji: '😊' },
    { id: 'sad', label: 'Sad', emoji: '😢' },
    { id: 'anxious', label: 'Anxious', emoji: '😰' },
    { id: 'calm', label: 'Calm', emoji: '😌' },
    { id: 'excited', label: 'Excited', emoji: '🤗' },
    { id: 'angry', label: 'Angry', emoji: '😠' },
    { id: 'tired', label: 'Tired', emoji: '😴' },
    { id: 'stressed', label: 'Stressed', emoji: '😫' },
    { id: 'confident', label: 'Confident', emoji: '💪' },
    { id: 'lonely', label: 'Lonely', emoji: '😔' }
  ]

  const activities = [
    'Work', 'Exercise', 'Socializing', 'Relaxing', 'Studying',
    'Commuting', 'Sleeping', 'Eating', 'Entertainment', 'Other'
  ]

  const handleEmotionToggle = (emotionId) => {
    setMoodEntry(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotionId)
        ? prev.emotions.filter(id => id !== emotionId)
        : [...prev.emotions, emotionId]
    }))
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
    if (score >= 7) {
      return [
        '🎉 Great mood! Keep doing what you\'re doing',
        '✨ Share your positive energy with others',
        '📝 Consider journaling about what made today good'
      ]
    } else if (score >= 4) {
      return [
        '🚶‍♀️ Take a short walk outside',
        '🧘‍♀️ Try a 5-minute breathing exercise',
        '💬 Connect with a friend or family member'
      ]
    } else {
      return [
        '🤗 Remember that difficult feelings are temporary',
        '📞 Consider reaching out to someone you trust',
        '🏥 If you need immediate help, call 988'
      ]
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (moodEntry.emotions.length === 0) {
      toast.warning('Please select at least one emotion')
      return
    }

    setIsSubmitting(true)
    setCrisisAlert(false)

    try {
      // Get auth token
      const authToken = localStorage.getItem('authToken')

      if (!authToken) {
        // Handle non-authenticated users with local analysis
        const mockAnalysis = generateMockAnalysis(moodEntry)
        const mockRecommendations = generateMockRecommendations(moodEntry.score)

        setAnalysis(mockAnalysis)
        setRecommendations(mockRecommendations)

        saveToLocalStorage(moodEntry)
        toast.info('🤖 Mood analyzed locally (sign in for cloud sync)')
        resetForm()
        return
      }

      // Try the complete AI endpoint first
      let response = await fetch(`${API_BASE_URL}/api/mood/track-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(moodEntry)
      })

      // If complete endpoint fails, try basic endpoint
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

        // Handle different response formats
        if (result.complete_ai_analysis) {
          setAnalysis(result.complete_ai_analysis)
          setRecommendations(result.recommendations || [])
          if (result.intervention_triggered) {
            setCrisisAlert(true)
          }
        } else if (result.analysis) {
          setAnalysis(result.analysis)
          setRecommendations(result.recommendations || generateMockRecommendations(moodEntry.score))
        } else {
          setAnalysis(generateMockAnalysis(moodEntry))
          setRecommendations(generateMockRecommendations(moodEntry.score))
        }

        toast.success('🎉 Mood tracked successfully!')
        resetForm()

      } else {
        throw new Error(`API error: ${response.status}`)
      }

    } catch (error) {
      console.error('Error submitting mood:', error)

      // Always provide fallback analysis
      const mockAnalysis = generateMockAnalysis(moodEntry)
      const mockRecommendations = generateMockRecommendations(moodEntry.score)

      setAnalysis(mockAnalysis)
      setRecommendations(mockRecommendations)

      saveToLocalStorage(moodEntry)

      if (error.message.includes('404')) {
        toast.info('🔄 Using local analysis (API endpoint not found)')
      } else {
        toast.info('🔄 Using local analysis (connection issue)')
      }

      resetForm()

    } finally {
      setIsSubmitting(false)
    }
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

  const getMoodColor = () => {
    if (moodEntry.score >= 7) return 'text-green-600'
    if (moodEntry.score >= 5) return 'text-yellow-600'
    if (moodEntry.score >= 3) return 'text-orange-600'
    return 'text-red-600'
  }

  // MAIN RENDER - Make sure this is returning JSX
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Test if component is rendering */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🧠 Mood Check Test
        </h1>
        <p className="text-gray-600">
          If you can see this, the component is loading correctly!
        </p>
      </div>

      {/* Offline Status */}
      {!isOnline && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          📱 You're offline. Mood data will be saved locally and synced when connection is restored.
        </div>
      )}

      {/* Crisis Alert */}
      {crisisAlert && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <h3 className="font-bold">🆘 Crisis Support Available</h3>
          <p>Based on your mood entry, we want to make sure you have immediate support:</p>
          <div className="mt-2">
            <button
              onClick={() => window.open('tel:988')}
              className="bg-red-600 text-white px-4 py-2 rounded mr-2 hover:bg-red-700 transition-colors"
            >
              Call 988 (Crisis Lifeline)
            </button>
            <button
              onClick={() => setCrisisAlert(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              I'm Safe
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          How are you feeling today? {getMoodEmoji()}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Mood Slider */}
          <div>
            <label className="block text-lg font-semibold mb-4">
              Overall Mood: <span className={`text-2xl ${getMoodColor()}`}>
                {moodEntry.score}/10 {getMoodEmoji()}
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={moodEntry.score}
              onChange={(e) => setMoodEntry(prev => ({ ...prev, score: parseInt(e.target.value) }))}
              className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>😢 Very Low</span>
              <span>😐 Neutral</span>
              <span>😊 Very High</span>
            </div>
          </div>

          {/* Emotion Selection */}
          <div>
            <label className="block text-lg font-semibold mb-4">
              Select emotions you're experiencing:
              <span className="text-sm text-gray-500 ml-2">
                ({moodEntry.emotions.length} selected)
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {emotions.map(emotion => (
                <button
                  key={emotion.id}
                  type="button"
                  onClick={() => handleEmotionToggle(emotion.id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${moodEntry.emotions.includes(emotion.id)
                      ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="text-2xl mb-1">{emotion.emoji}</div>
                  <div className="text-sm font-medium">{emotion.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Context Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold mb-2">
                Current Activity (optional):
              </label>
              <select
                value={moodEntry.activity}
                onChange={(e) => setMoodEntry(prev => ({ ...prev, activity: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an activity</option>
                {activities.map(act => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2">
                Location (optional):
              </label>
              <input
                type="text"
                value={moodEntry.location}
                onChange={(e) => setMoodEntry(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Home, Office, Park"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-lg font-semibold mb-4">
              What's on your mind? (optional):
            </label>
            <textarea
              value={moodEntry.notes}
              onChange={(e) => setMoodEntry(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Share what's happening, how you're feeling, or what might have influenced your mood..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              maxLength="2000"
            />
            <div className="text-sm text-gray-500 mt-1">
              {moodEntry.notes.length}/2000 characters
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || moodEntry.emotions.length === 0}
            className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 ${isSubmitting || moodEntry.emotions.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing your mood...
              </div>
            ) : (
              `Track My Mood 🤖`
            )}
          </button>
        </form>

        {/* Analysis Results */}
        {analysis && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-xl font-semibold mb-4">🔮 Mood Analysis Results</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Sentiment:</span>
                  <span className={`ml-2 capitalize font-bold ${analysis.sentiment === 'positive' ? 'text-green-600' :
                      analysis.sentiment === 'negative' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                    {analysis.sentiment || 'Neutral'}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">Energy Level:</span>
                  <span className={`ml-2 capitalize font-bold ${analysis.energy_level === 'high' ? 'text-green-600' :
                      analysis.energy_level === 'low' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                    {analysis.energy_level || 'Moderate'}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">Risk Level:</span>
                  <span className={`ml-2 capitalize font-bold ${analysis.risk_level === 'high' ? 'text-red-600' :
                      analysis.risk_level === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                    {analysis.risk_level || 'Low'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Confidence:</span>
                  <span className="ml-2 font-bold text-blue-600">
                    {Math.round((analysis.sentiment_confidence || analysis.confidence || 0.7) * 100)}%
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">Analysis Method:</span>
                  <span className="ml-2 capitalize text-gray-600">
                    {analysis.analysis_method?.replace('_', ' ') || 'AI Analysis'}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">Emotional Complexity:</span>
                  <span className="ml-2 font-bold text-purple-600">
                    {analysis.emotional_complexity || moodEntry.emotions.length}/10
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Indicators */}
            {analysis.risk_indicators && analysis.risk_indicators.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-semibold text-yellow-800 mb-2">⚠️ Risk Indicators:</p>
                <ul className="list-disc list-inside text-sm text-yellow-700">
                  {analysis.risk_indicators.map((indicator, index) => (
                    <li key={index}>{indicator}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-xl font-semibold mb-4">💡 Personalized Recommendations</h3>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default MoodCheck