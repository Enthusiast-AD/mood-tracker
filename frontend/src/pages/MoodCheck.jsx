import { useState } from 'react'

function MoodCheck() {
  const [moodScore, setMoodScore] = useState(5)
  const [selectedEmotions, setSelectedEmotions] = useState([])
  const [notes, setNotes] = useState('')

  const emotions = [
    { id: 'happy', label: 'Happy', emoji: '😊' },
    { id: 'sad', label: 'Sad', emoji: '😢' },
    { id: 'anxious', label: 'Anxious', emoji: '😰' },
    { id: 'calm', label: 'Calm', emoji: '😌' },
    { id: 'excited', label: 'Excited', emoji: '🤗' },
    { id: 'angry', label: 'Angry', emoji: '😠' },
    { id: 'tired', label: 'Tired', emoji: '😴' },
    { id: 'stressed', label: 'Stressed', emoji: '😫' }
  ]

  const handleEmotionToggle = (emotionId) => {
    setSelectedEmotions(prev => 
      prev.includes(emotionId) 
        ? prev.filter(id => id !== emotionId)
        : [...prev, emotionId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const moodData = {
      score: moodScore,
      emotions: selectedEmotions,
      notes: notes,
      timestamp: new Date().toISOString()
    }

    console.log('Submitting mood data:', moodData)
    // TODO: Send to backend API
    
    alert('Mood logged successfully!')
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-8">How are you feeling today?</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mood Slider */}
        <div>
          <label className="block text-lg font-semibold mb-4">
            Overall Mood: <span className="text-blue-600">{moodScore}/10</span>
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
            <span>Very Low</span>
            <span>Neutral</span>
            <span>Very High</span>
          </div>
        </div>

        {/* Emotion Selection */}
        <div>
          <label className="block text-lg font-semibold mb-4">
            Select emotions you're experiencing:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {emotions.map(emotion => (
              <button
                key={emotion.id}
                type="button"
                onClick={() => handleEmotionToggle(emotion.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedEmotions.includes(emotion.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{emotion.emoji}</div>
                <div className="text-sm font-medium">{emotion.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-lg font-semibold mb-4">
            Additional notes (optional):
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What's on your mind? How was your day?"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="4"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Log My Mood
        </button>
      </form>
    </div>
  )
}

export default MoodCheck