import React from 'react'
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
import { motion } from 'framer-motion'
import { TrendingUp, Calendar } from 'lucide-react'

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

const MoodTrendChart = ({ moodHistory = [], title = "30-Day Mood Trend" }) => {
  // Process mood history data
  const processChartData = () => {
    if (!moodHistory || moodHistory.length === 0) {
      // Generate sample data for demo
      const sampleData = Array.from({ length: 30 }, (_, i) => ({
        score: Math.floor(Math.random() * 4) + 5 + Math.sin(i * 0.1) * 2,
        created_at: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString()
      }))
      return sampleData
    }

    // Sort by date and take last 30 entries
    return moodHistory
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-30)
  }

  const chartData = processChartData()
  
  const data = {
    labels: chartData.map(entry => 
      new Date(entry.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    ),
    datasets: [
      {
        label: 'Mood Score',
        data: chartData.map(entry => entry.score),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const score = context.parsed.y
            let mood = ''
            if (score >= 8) mood = '😊 Great'
            else if (score >= 6) mood = '🙂 Good'
            else if (score >= 4) mood = '😐 Okay'
            else if (score >= 2) mood = '😔 Low'
            else mood = '😢 Very Low'
            
            return `Mood: ${score}/10 (${mood})`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 7,
          color: '#6b7280'
        }
      },
      y: {
        min: 1,
        max: 10,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          stepSize: 1,
          color: '#6b7280',
          callback: function(value) {
            return value + '/10'
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }

  // Calculate trend
  const calculateTrend = () => {
    if (chartData.length < 7) return { trend: 'stable', change: 0 }
    
    const recentAvg = chartData.slice(-7).reduce((sum, entry) => sum + entry.score, 0) / 7
    const previousAvg = chartData.slice(-14, -7).reduce((sum, entry) => sum + entry.score, 0) / 7
    const change = recentAvg - previousAvg
    
    if (change > 0.5) return { trend: 'improving', change: change.toFixed(1) }
    if (change < -0.5) return { trend: 'declining', change: change.toFixed(1) }
    return { trend: 'stable', change: change.toFixed(1) }
  }

  const trendInfo = calculateTrend()

  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{chartData.length} data points</p>
          </div>
        </div>
        
        {/* Trend Indicator */}
        <div className="text-right">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            trendInfo.trend === 'improving' ? 'bg-green-100 text-green-800' :
            trendInfo.trend === 'declining' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {trendInfo.trend === 'improving' && '↗️'}
            {trendInfo.trend === 'declining' && '↘️'}
            {trendInfo.trend === 'stable' && '→'}
            <span className="ml-1 capitalize">{trendInfo.trend}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {trendInfo.change > 0 ? '+' : ''}{trendInfo.change} avg change
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 relative">
        {chartData.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No mood data available</p>
              <p className="text-sm text-gray-400">Start tracking to see your trend</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {chartData.length > 0 ? (chartData.reduce((sum, entry) => sum + entry.score, 0) / chartData.length).toFixed(1) : '0'}
          </p>
          <p className="text-sm text-gray-500">Average</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {chartData.length > 0 ? Math.max(...chartData.map(entry => entry.score)) : '0'}
          </p>
          <p className="text-sm text-gray-500">Highest</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {chartData.length > 0 ? Math.min(...chartData.map(entry => entry.score)) : '0'}
          </p>
          <p className="text-sm text-gray-500">Lowest</p>
        </div>
      </div>
    </motion.div>
  )
}

export default MoodTrendChart