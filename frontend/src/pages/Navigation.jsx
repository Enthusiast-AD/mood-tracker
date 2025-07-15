import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useContext, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  Brain, 
  Moon, 
  Sun, 
  User, 
  HelpCircle, 
  Lock, 
  Star, 
  UserPlus, 
  LogIn, 
  AlertCircle,
  BarChart2,
  ClipboardList,
  ChevronDown,
  LogOut,
  Home,
  Settings,
  BookOpen,
  MessageSquare
} from 'lucide-react'

const Navigation = () => {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Scroll behavior state
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={18} />, public: true },
    { path: '/mood-check', label: 'Mood Check', icon: <ClipboardList size={18} />, protected: true },
    { path: '/dashboard', label: 'Dashboard', icon: <BarChart2 size={18} />, protected: true },
    { path: '/crisis-support', label: 'Crisis Support', icon: <AlertCircle size={18} className='text-red-500' />, public: true }
  ]

  const authItems = [
    { path: '/auth/login', label: 'Sign In', icon: <LogIn size={18} /> },
    { path: '/auth/register', label: 'Sign Up', icon: <UserPlus size={18} /> }
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
    return function () {
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
      className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-lg border-b border-slate-100 transition-all duration-300 dark:bg-slate-800/90 dark:border-slate-700 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div 
              className="relative flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <motion.div
                className="p-2 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl shadow-lg"
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>

            <motion.h2
              className="relative text-2xl font-bold overflow-hidden justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.2 }}
            >
              {/* Base gradient text */}
              <span className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                Mental Health AI
              </span>

              {/* Smooth shimmer effect */}
              <motion.span
                className="absolute inset-0 bg-clip-text text-transparent"
                style={{
                  backgroundSize: '200% 100%',
                  backgroundImage: 'linear-gradient(90deg, transparent 0%, transparent 45%, rgba(255, 255, 255, 0.9) 50%, transparent 55%, transparent 100%)'
                }}
                animate={{
                  backgroundPosition: ['200% 0', '-200% 0']
                }}
                transition={{
                  duration: 8,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "loop"
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
                    className={`px-4 py-2 rounded-lg text-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActive(item.path)
                        ? 'bg-blue-600 dark:bg-blue-800 text-white dark:text-slate-50 shadow-lg'
                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <motion.span
                      animate={isActive(item.path) ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {item.icon}
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
            <motion.button 
              onClick={toggleTheme} 
              className="p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:opacity-80 transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'dark' ? (
                <Moon className="text-blue-400" />
              ) : (
                <Sun className="text-yellow-500" />
              )}
            </motion.button>

            {isAuthenticated ? (
              /* User Menu */
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User size={18} />
                  <span className="hidden sm:inline">{user?.username || 'User'}</span>
                  <motion.span
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} />
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user?.full_name || user?.username}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <BarChart2 size={16} />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/mood-check"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <ClipboardList size={16} />
                        <span>Track Mood</span>
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>

                      <hr className="my-2 border-slate-100 dark:border-slate-700" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <LogOut size={16} />
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        item.path === '/auth/login'
                          ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 border border-blue-200 dark:border-slate-600'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {item.icon}
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {item.icon}
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