import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function MoodCheck() {
  const [moodScore, setMoodScore] = useState(5)
  const [selectedEmotions, setSelectedEmotions] = useState([])
  const [notes, setNotes] = useState('')
  const [activity, setActivity] = useState('')
  const [location, setLocation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [crisisAlert, setCrisisAlert] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

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

  const handleEmotionToggle = (emotionId) => {
    setSelectedEmotions(prev => 
      prev.includes(emotionId) 
        ? prev.filter(id => id !== emotionId)
        : [...prev, emotionId]
    )
  }

  const saveToLocalStorage = (moodData) => {
    const existingData = JSON.parse(localStorage.getItem('offlineMoods') || '[]')
    existingData.push({ ...moodData, offline: true, id: Date.now() })
    localStorage.setItem('offlineMoods', JSON.stringify(existingData))
  }

  const syncOfflineData = async () => {
    const offlineData = JSON.parse(localStorage.getItem('offlineMoods') || '[]')
    
    for (const mood of offlineData) {
      try {
        await submitMoodToAPI(mood)
      } catch (error) {
        console.error('Failed to sync offline mood:', error)
      }
    }
    
    localStorage.removeItem('offlineMoods')
  }

  const submitMoodToAPI = async (moodData) => {
    const response = await fetch(`${API_BASE_URL}/api/mood/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(moodData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (selectedEmotions.length === 0) {
      alert('Please select at least one emotion')
      return
    }

    setIsSubmitting(true)
    setCrisisAlert(false)
    
    const moodData = {
      score: moodScore,
      emotions: selectedEmotions,
      notes: notes.trim(),
      activity: activity,
      location: location,
      user_id: 'user_' + Date.now(), // Simple user ID for demo
      timestamp: new Date().toISOString()
    }

    try {
      if (!isOnline) {
        // Save offline
        saveToLocalStorage(moodData)
        setAnalysis({
          sentiment: moodScore >= 6 ? 'positive' : moodScore <= 4 ? 'negative' : 'neutral',
          message: 'Mood saved offline. Will sync when online.'
        })
        setRecommendations([
          'Your mood has been saved offline',
          'Data will sync automatically when connection is restored',
          'Consider some offline coping strategies while disconnected'
        ])
      } else {
        // Sync any offline data first
        await syncOfflineData()
        
        // Submit current mood
        const result = await submitMoodToAPI(moodData)
        
        console.log('Mood tracking result:', result)
        
        setAnalysis(result.analysis)
        setRecommendations(result.recommendations || [])
        
        // Check for crisis intervention
        if (result.intervention_required || result.crisis_response) {
          setCrisisAlert(true)
        }
        
        // Show success message
        if (result.success) {
          alert('✅ Mood tracked successfully with AI analysis!')
        }
      }
      
      // Reset form
      setMoodScore(5)
      setSelectedEmotions([])
      setNotes('')
      setActivity('')
      setLocation('')
      
    } catch (error) {
      console.error('Error submitting mood:', error)
      
      // Fallback to offline storage
      saveToLocalStorage(moodData)
      setAnalysis({
        sentiment: 'unknown',
        message: 'Connection failed. Mood saved offline.'
      })
      setRecommendations([
        'Unable to connect to server',
        'Your mood has been saved locally',
        'Try again when connection is restored'
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMoodEmoji = () => {
    if (moodScore >= 9) return '🤩'
    if (moodScore >= 7) return '😊'
    if (moodScore >= 5) return '😐'
    if (moodScore >= 3) return '😔'
    return '😢'
  }

  const getMoodColor = () => {
    if (moodScore >= 7) return 'text-green-600'
    if (moodScore >= 5) return 'text-yellow-600'
    if (moodScore >= 3) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Online/Offline Status */}
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
            <button className="bg-red-600 text-white px-4 py-2 rounded mr-2">
              Call 988 (Crisis Lifeline)
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              View Crisis Resources
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          How are you feeling today? {getMoodEmoji()}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Mood Slider */}
          <div>
            <label className="block text-lg font-semibold mb-4">
              Overall Mood: <span className={`text-2xl ${getMoodColor()}`}>
                {moodScore}/10 {getMoodEmoji()}
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={moodScore}
              onChange={(e) => setMoodScore(parseInt(e.target.value))}
              className="w-full h-3 mood-slider rounded-lg appearance-none cursor-pointer"
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
                ({selectedEmotions.length} selected)
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {emotions.map(emotion => (
                <button
                  key={emotion.id}
                  type="button"
                  onClick={() => handleEmotionToggle(emotion.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedEmotions.includes(emotion.id)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
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
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
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
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share what's happening, how you're feeling, or what might have influenced your mood..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              maxLength="2000"
            />
            <div className="text-sm text-gray-500 mt-1">
              {notes.length}/2000 characters
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || selectedEmotions.length === 0}
            className={`w-full font-semibold py-4 px-6 rounded-lg transition-all ${
              isSubmitting || selectedEmotions.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isOnline ? 'Analyzing with AI...' : 'Saving offline...'}
              </div>
            ) : (
              `Track My Mood ${isOnline ? '🤖' : '📱'}`
            )}
          </button>
        </form>

        {/* Analysis Results */}
        {analysis && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-xl font-semibold mb-4">🔮 AI Analysis Results</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>Sentiment:</strong> {analysis.sentiment}</p>
                <p><strong>Energy Level:</strong> {analysis.energy_level}</p>
                <p><strong>Risk Level:</strong> {analysis.risk_level}</p>
              </div>
              <div>
                <p><strong>Confidence:</strong> {Math.round(analysis.sentiment_confidence * 100)}%</p>
                <p><strong>Analysis Method:</strong> {analysis.analysis_method}</p>
                <p><strong>Emotional Complexity:</strong> {analysis.emotional_complexity}</p>
              </div>
            </div>
            {analysis.risk_indicators && analysis.risk_indicators.length > 0 && (
              <div className="mt-4">
                <p><strong>Risk Indicators:</strong></p>
                <ul className="list-disc list-inside text-sm">
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