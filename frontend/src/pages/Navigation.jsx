import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useContext, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const Navigation = () => {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Scroll behavior state
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const navItems = [
    { path: '/', label: 'Home', emoji: '', public: true },
    { path: '/mood-check', label: 'Mood Check', emoji: '', protected: true },
    { path: '/dashboard', label: 'Dashboard', emoji: '', protected: true },
    { path: '/crisis-support', label: 'Crisis Support', emoji: '🆘', public: true }
  ]

  const authItems = [
    { path: '/auth/login', label: 'Sign In', emoji: '🔑' },
    { path: '/auth/register', label: 'Sign Up', emoji: '✨' }
  ]

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollThreshold = 10 // Minimum scroll distance to trigger hide/show
      
      if (currentScrollY < scrollThreshold) {
        // Always show navbar when near top
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        // Scrolling down - hide navbar
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show navbar
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    const throttledHandleScroll = throttle(handleScroll, 100)
    window.addEventListener('scroll', throttledHandleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
    }
  }, [lastScrollY])

  // Throttle function to improve performance
  const throttle = (func, limit) => {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-100 transition-all duration-300 dark:bg-gray-800 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="../HomePage.jsx" className="flex items-center space-x-3 group">
            <motion.h2
              className="relative text-2xl font-bold overflow-hidden justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <motion.span
                className="inline-block bg-gradient-to-r from-blue-500 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                Mental Health AI
              </motion.span>
            </motion.h2>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex space-x-1">
            {navItems.map(item => {
              // Show public items always, protected items only when authenticated
              if (item.protected && !isAuthenticated) return null

              return (
                <motion.div key={item.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    <motion.span
                      className="text-lg"
                      animate={isActive(item.path) ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {item.emoji}
                    </motion.span>
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle Button */}
            <button onClick={toggleTheme} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:opacity-80 transition">
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>

            {isAuthenticated ? (
              /* User Menu */
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg">👤</span>
                  <span className="hidden sm:inline">{user?.username || 'User'}</span>
                  <motion.span
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-700">{user?.full_name || user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span>📊</span>
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/mood-check"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span>📝</span>
                        <span>Track Mood</span>
                      </Link>

                      <hr className="my-2" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span>🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Auth Buttons */
              <div className="flex space-x-2">
                {authItems.map(item => (
                  <motion.div key={item.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={item.path}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${item.path === '/auth/login'
                        ? 'text-blue-600 hover:bg-blue-50 border border-blue-200'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl'
                        }`}
                    >
                      <span className="text-lg">{item.emoji}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap justify-center gap-2">
            {navItems.map(item => {
              if (item.protected && !isAuthenticated) return null

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navigation