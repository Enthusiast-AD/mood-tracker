import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import MoodCheck from './pages/MoodCheck'
import Dashboard from './pages/Dashboard'
import CrisisSupport from './pages/CrisisSupport'
import Navigation from './pages/Navigation'
import './App.css'

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="bg-yellow-500 text-white text-center py-2 text-sm">
          You're offline. Some features may be limited.
        </div>
      )}
      
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/mood-check" element={<MoodCheck />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crisis-support" element={<CrisisSupport />} />
        </Routes>
      </main>
    </div>
  )
}

export default App