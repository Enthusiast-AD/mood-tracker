function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Mental Health Dashboard</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Mood */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Mood</h2>
          <div className="text-center">
            <div className="text-4xl mb-2">😊</div>
            <div className="text-2xl font-bold text-green-600">7/10</div>
            <div className="text-gray-500">Today</div>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Weekly Trend</h2>
          <div className="text-center">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-lg font-semibold text-blue-600">Improving</div>
            <div className="text-gray-500">+15% from last week</div>
          </div>
        </div>

        {/* Crisis Support */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
          <div className="text-center">
            <div className="text-2xl mb-2">🆘</div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold">
              Crisis Support
            </button>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Mood History</h2>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <div>Chart will be implemented with Chart.js</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard