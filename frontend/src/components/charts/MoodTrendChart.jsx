import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { format, parseISO, subDays, startOfDay } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const MoodTrendChart = ({ moodHistory, className = '' }) => {
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    if (!moodHistory || moodHistory.length === 0) {
      setChartData(null)
      return
    }

    // Prepare data for the last 30 days
    const last30Days = []
    for (let i = 29; i >= 0; i--) {
      last30Days.push(startOfDay(subDays(new Date(), i)))
    }

    // Map mood entries to daily averages
    const dailyMoods = last30Days.map(date => {
      const dayEntries = moodHistory.filter(entry => {
        const entryDate = startOfDay(parseISO(entry.created_at))
        return entryDate.getTime() === date.getTime()
      })
      
      if (dayEntries.length === 0) return null
      
      const avgScore = dayEntries.reduce((sum, entry) => sum + entry.score, 0) / dayEntries.length
      return {
        date,
        score: Math.round(avgScore * 10) / 10,
        count: dayEntries.length
      }
    })

    const labels = last30Days.map(date => format(date, 'MMM dd'))
    const data = dailyMoods.map(day => day ? day.score : null)
    
    // Create gradient for the line
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 400)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)')
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)')
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)')

    setChartData({
      labels,
      datasets: [
        {
          label: 'Mood Score',
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          spanGaps: true
        }
      ]
    })
  }, [moodHistory])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: '30-Day Mood Trend',
        font: {
          size: 18,
          weight: 'bold'
        },
        color: '#374151'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const score = context.parsed.y
            if (score === null) return 'No data'
            
            let emoji = '😐'
            if (score >= 8) emoji = '🤩'
            else if (score >= 7) emoji = '😊'
            else if (score >= 6) emoji = '🙂'
            else if (score >= 4) emoji = '😐'
            else if (score >= 3) emoji = '😔'
            else emoji = '😢'
            
            return `${emoji} Mood: ${score}/10`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        },
        ticks: {
          color: '#6B7280',
          maxRotation: 45
        }
      },
      y: {
        min: 1,
        max: 10,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        },
        ticks: {
          color: '#6B7280',
          callback: function(value) {
            return value + '/10'
          }
        }
      }
    },
    elements: {
      point: {
        hoverBorderWidth: 3
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  }

  if (!chartData) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Mood Data Yet</h3>
          <p className="text-gray-500">Track a few moods to see your beautiful trend chart!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
      
      {/* Chart Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {moodHistory.length}
          </div>
          <div className="text-sm text-gray-600">Total Entries</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {moodHistory.length > 0 ? 
              Math.round(moodHistory.reduce((sum, entry) => sum + entry.score, 0) / moodHistory.length * 10) / 10 : 
              0
            }
          </div>
          <div className="text-sm text-gray-600">Average Score</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {moodHistory.length >= 2 ? 
              (moodHistory[0].score > moodHistory[1].score ? '📈' : 
               moodHistory[0].score < moodHistory[1].score ? '📉' : '➡️') : 
              '➡️'
            }
          </div>
          <div className="text-sm text-gray-600">Recent Trend</div>
        </div>
      </div>
    </div>
  )
}

export default MoodTrendChart