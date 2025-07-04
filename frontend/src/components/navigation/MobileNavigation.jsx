/**
 * Enhanced Mobile Navigation - Mental Health AI
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:47:21 UTC
 * Beautiful, accessible mobile navigation with animations
 */

import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useMood } from '../../contexts/MoodContext'
import Button from '../ui/Button'

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme, moodTheme, clearMoodTheme } = useTheme()
  const { moodHistory } = useMood()

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location])

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { path: '/', label: 'Home', emoji: '🏠', public: true },
    { path: '/mood-check', label: 'Track Mood', emoji: '📝', protected: true },
    { path: '/dashboard', label: 'Dashboard', emoji: '📊', protected: true },
    { path: '/crisis-support', label: 'Crisis Support', emoji: '🆘', public: true },
    { path: '/settings/pwa', label: 'Settings', emoji: '⚙️', protected: true }
  ]

  const handleLogout = () => {
    logout()
    clearMoodTheme()
    navigate('/')
    setIsOpen(false)
  }

  const getRecentMoodEmoji = () => {
    if (!moodHistory || moodHistory.length === 0) return '😐'
    
    const recentScore = moodHistory[0]?.score || 5
    if (recentScore >= 8) return '🤩'
    if (recentScore >= 6) return '😊'
    if (recentScore >= 4) return '😐'
    if (recentScore >= 2) return '😔'
    return '😢'
  }

  return (
    <>
      {/* Navigation Bar */}
      <nav className={`
        fixed top-0 left-0 right-0 z-40 transition-all duration-300
        ${isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-lg' : 'bg-white/80'}
        ${moodTheme ? `border-b-2 border-${moodTheme}` : 'border-b border-gray-200'}
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 hover:scale-105 transition-transform">
              <div className="text-2xl">{moodTheme ? getRecentMoodEmoji() : '🧠'}</div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mental Health AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map(item => {
                if (item.protected && !isAuthenticated) return null
                
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      flex items-center space-x-1 hover:scale-105
                      ${isActive 
                        ? `bg-gradient-to-r ${moodTheme ? `from-${moodTheme}-100 to-${moodTheme}-200 text-${moodTheme}-800` : 'from-blue-100 to-blue-200 text-blue-800'} shadow-sm`
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }
                    `}
                  >
                    <span>{item.emoji}</span>
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                )
              })}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 ml-4">
                  <div className="hidden lg:block text-sm text-gray-600">
                    Welcome, <span className="font-medium">{user?.username}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-xs"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 ml-4">
                  <Link to="/auth/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button variant="primary" size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 relative">
                <span className={`
                  absolute block w-full h-0.5 bg-current transform transition-all duration-300
                  ${isOpen ? 'rotate-45 top-3' : 'top-1'}
                `} />
                <span className={`
                  absolute block w-full h-0.5 bg-current transform transition-all duration-300 top-3
                  ${isOpen ? 'opacity-0' : 'opacity-100'}
                `} />
                <span className={`
                  absolute block w-full h-0.5 bg-current transform transition-all duration-300
                  ${isOpen ? '-rotate-45 top-3' : 'top-5'}
                `} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className={`
            absolute top-0 right-0 h-full w-80 max-w-full
            bg-white shadow-2xl transform transition-transform duration-300
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          `}>
            {/* Header */}
            <div className={`
              px-6 py-4 border-b border-gray-200
              ${moodTheme ? `bg-gradient-to-r from-${moodTheme}-50 to-${moodTheme}-100` : 'bg-gray-50'}
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">{moodTheme ? getRecentMoodEmoji() : '🧠'}</div>
                  <span className="font-bold text-lg">Menu</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* User Info */}
              {isAuthenticated && (
                <div className="mt-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user?.full_name || user?.username}</div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <div className="flex-1 px-6 py-4 space-y-2">
              {navigationItems.map(item => {
                if (item.protected && !isAuthenticated) return null
                
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      block px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? `bg-gradient-to-r ${moodTheme ? `from-${moodTheme}-100 to-${moodTheme}-200 text-${moodTheme}-800 shadow-sm` : 'from-blue-100 to-blue-200 text-blue-800 shadow-sm'}`
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{item.emoji}</span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                )
              })}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{theme === 'light' ? '🌙' : '☀️'}</span>
                  <span className="font-medium">
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
              </button>

              {/* Mood Theme Controls */}
              {moodTheme && (
                <button
                  onClick={clearMoodTheme}
                  className="w-full block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🎨</span>
                    <span className="font-medium">Clear Mood Theme</span>
                  </div>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleLogout}
                  className="justify-center"
                >
                  <span className="mr-2">👋</span>
                  Sign Out
                </Button>
              ) : (
                <div className="space-y-2">
                  <Link to="/auth/login" className="block">
                    <Button variant="outline" fullWidth className="justify-center">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth/register" className="block">
                    <Button variant="primary" fullWidth className="justify-center">
                      Create Account
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  )
}

export default MobileNavigation