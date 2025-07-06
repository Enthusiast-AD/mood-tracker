import React, { useEffect, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const EmotionDistributionChart = ({ moodHistory, className = '' }) => {
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    if (!moodHistory || moodHistory.length === 0) {
      setChartData(null)
      return
    }

    // Count all emotions
    const emotionCounts = {}
    moodHistory.forEach(entry => {
      if (entry.emotions && entry.emotions.length > 0) {
        entry.emotions.forEach(emotion => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
        })
      }
    })

    if (Object.keys(emotionCounts).length === 0) {
      setChartData(null)
      return
    }

    // Sort by count and take top 8
    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)

    const labels = sortedEmotions.map(([emotion]) => emotion)
    const data = sortedEmotions.map(([,count]) => count)

    // Beautiful color palette
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#F97316', // Orange
      '#06B6D4', // Cyan
      '#84CC16'  // Lime
    ]

    setChartData({
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color),
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 10
        }
      ]
    })
  }, [moodHistory])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: 'medium'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#3B82F6',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const emotion = context.label
            const count = context.parsed
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = Math.round((count / total) * 100)
            
            // Emotion emojis
            const emojiMap = {
              'happy': '😊',
              'sad': '😢',
              'anxious': '😰',
              'calm': '😌',
              'excited': '🤗',
              'angry': '😠',
              'tired': '😴',
              'stressed': '😫',
              'confident': '💪',
              'lonely': '😔'
            }
            
            const emoji = emojiMap[emotion] || '😐'
            return `${emoji} ${emotion}: ${count} times (${percentage}%)`
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeInOutQuart'
    },
    cutout: '50%'
  }

  if (!chartData) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Emotion Data Yet</h3>
          <p className="text-gray-500">Track moods with emotions to see your distribution!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
        🎭 Emotion Distribution
      </h3>
      <div className="h-80">
        <Doughnut data={chartData} options={options} />
      </div>
      
      {/* Top Emotions Summary */}
      <div className="mt-6">
        <h4 className="font-semibold text-gray-700 mb-3">Most Common Emotions</h4>
        <div className="flex flex-wrap gap-2">
          {chartData.labels.slice(0, 5).map((emotion, index) => (
            <span 
              key={emotion}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
            >
              {emotion} ({chartData.datasets[0].data[index]})
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmotionDistributionChart