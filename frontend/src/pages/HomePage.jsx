import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            🧠 Mental Health AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your personal AI-powered companion for mood tracking and mental wellness
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/mood-check"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Quick Mood Check
            </Link>
            <Link 
              to="/dashboard"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Mood Tracking</h3>
            <p className="text-gray-600">Track your daily emotions and mental state with AI-powered analysis</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-600">Advanced sentiment analysis and pattern recognition</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">🆘</div>
            <h3 className="text-xl font-semibold mb-2">Crisis Support</h3>
            <p className="text-gray-600">Immediate help and resources when you need them most</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage