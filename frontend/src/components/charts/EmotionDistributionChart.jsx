import React from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { motion } from 'framer-motion'
import { PieChart, Heart, TrendingUp, BarChart3, Activity } from 'lucide-react'

ChartJS.register(ArcElement, Tooltip, Legend)

const EmotionDistributionChart = ({ moodHistory = [], title = "Emotion Distribution" }) => {
  // Process emotion data from mood history
  const processEmotionData = () => {
    if (!moodHistory || moodHistory.length === 0) {
      // Sample data for demo
      return [
        { emotion: 'Happy', count: 12, color: '#10B981' },
        { emotion: 'Calm', count: 8, color: '#3B82F6' },
        { emotion: 'Anxious', count: 5, color: '#F59E0B' },
        { emotion: 'Sad', count: 3, color: '#EF4444' },
        { emotion: 'Excited', count: 4, color: '#8B5CF6' }
      ]
    }

    const emotionCounts = {}

    moodHistory.forEach(entry => {
      if (entry.emotions && Array.isArray(entry.emotions)) {
        entry.emotions.forEach(emotion => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
        })
      }
    })

    // Convert to array and sort by count
    const emotionArray = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        color: getEmotionColor(emotion)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8) // Top 8 emotions

    return emotionArray.length > 0 ? emotionArray : [
      { emotion: 'No data', count: 1, color: '#9CA3AF' }
    ]
  }

  const getEmotionColor = (emotion) => {
    const colorMap = {
      'happy': '#10B981',
      'sad': '#EF4444',
      'anxious': '#F59E0B',
      'calm': '#3B82F6',
      'excited': '#8B5CF6',
      'angry': '#DC2626',
      'tired': '#6B7280',
      'stressed': '#F97316',
      'confident': '#059669',
      'lonely': '#7C3AED',
      'grateful': '#84CC16',
      'frustrated': '#BE123C',
      'overwhelmed': '#C2410C',
      'content': '#0D9488',
      'nervous': '#CA8A04'
    }
    return colorMap[emotion.toLowerCase()] || '#9CA3AF'
  }

  const emotionData = processEmotionData()
  const totalEntries = emotionData.reduce((sum, item) => sum + item.count, 0)

  const data = {
    labels: emotionData.map(item => item.emotion),
    datasets: [
      {
        data: emotionData.map(item => item.count),
        backgroundColor: emotionData.map(item => item.color),
        borderColor: emotionData.map(item => item.color),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 8
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // We'll create a custom legend
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const percentage = ((context.parsed / totalEntries) * 100).toFixed(1)
            return `${context.label}: ${context.parsed} (${percentage}%)`
          }
        }
      }
    },
    cutout: '60%',
    interaction: {
      intersect: false
    }
  }

  const getEmotionEmoji = (emotion) => {
    const emojiMap = {
      'happy': '😊',
      'sad': '😔',
      'anxious': '😰',
      'calm': '😌',
      'excited': '🤗',
      'angry': '😠',
      'tired': '😴',
      'stressed': '😫',
      'confident': '💪',
      'lonely': '😞',
      'grateful': '🙏',
      'frustrated': '😤',
      'overwhelmed': '🤯',
      'content': '😊',
      'nervous': '😬'
    }
    return emojiMap[emotion.toLowerCase()] || '😐'
  }

  return (
    <div className=" w-1grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Chart */}
      <motion.div
        className=" lg:col-span-3 bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{totalEntries} total emotions tracked</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 relative mb-6">
          {emotionData.length > 0 && emotionData[0].emotion !== 'No data' ? (
            <>
              <Doughnut data={data} options={options} />
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-700">{totalEntries}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No emotion data</p>
                <p className="text-sm text-gray-400">Track moods with emotions</p>
              </div>
            </div>
          )}
        </div>

        {/* Horizontal Emoji Section */}
        <div className="border-t pt-4 dark:border-gray-700">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Emotion Breakdown</h4>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-2 min-w-max">
              {emotionData.map((item, index) => {
                const percentage = ((item.count / totalEntries) * 100).toFixed(1)
                return (
                  <motion.div
                    key={item.emotion}
                    className="flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 min-w-32 text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div
                        className="w-3 h-3 rounded-full mr-2 border border-gray-200 dark:border-gray-600"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-2xl">{getEmotionEmoji(item.emotion)}</span>
                    </div>
                    <p className="font-medium text-gray-700 dark:text-gray-200 capitalize text-sm mb-1">
                      {item.emotion}
                    </p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{item.count}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>




    </div>


  )
}

export default EmotionDistributionChart