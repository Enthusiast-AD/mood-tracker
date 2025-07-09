import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

function HomePage() {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: '📊',
      title: 'AI-Powered Mood Tracking',
      description: 'Track your daily emotions with advanced AI analysis and sentiment detection',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🤖',
      title: 'Smart Insights',
      description: 'Get personalized recommendations and pattern recognition from your mood data',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🆘',
      title: 'Crisis Support',
      description: 'Immediate help and resources available 24/7 when you need them most',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: '📈',
      title: 'Beautiful Analytics',
      description: 'Visualize your mental health journey with stunning charts and trends',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: '🛡️',
      title: 'Privacy & Security',
      description: 'Your mental health data is encrypted and completely private',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '📱',
      title: 'Works Everywhere',
      description: 'Progressive Web App that works on all devices, online and offline',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.div 
        className="flex flex-col items-center justify-center text-center px-4 py-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Animated Logo */}
          <motion.div 
            className="text-8xl mb-8"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            🧠
          </motion.div>

          {/* Title */}
          <motion.h1 
            className="text-6xl font-bold text-gray-800 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Mental Health AI
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-2xl text-gray-600 mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Your personal AI-powered companion for mood tracking, mental wellness, 
            and emotional intelligence with <span className="font-semibold text-blue-600">beautiful visualizations</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/mood-check"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3"
                  >
                    <span className="text-2xl">📝</span>
                    <span>Track Your Mood</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/dashboard"
                    className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3"
                  >
                    <span className="text-2xl">📊</span>
                    <span>View Dashboard</span>
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/auth/register"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3"
                  >
                    <span className="text-2xl">✨</span>
                    <span>Get Started Free</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/mood-check"
                    className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center space-x-3"
                  >
                    <span className="text-2xl">👀</span>
                    <span>Try Demo</span>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="text-center">
              <motion.div 
                className="text-4xl font-bold text-blue-600 mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AI-Powered
              </motion.div>
              <p className="text-gray-600">Advanced sentiment analysis</p>
            </div>
            <div className="text-center">
              <motion.div 
                className="text-4xl font-bold text-green-600 mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                24/7
              </motion.div>
              <p className="text-gray-600">Crisis support available</p>
            </div>
            <div className="text-center">
              <motion.div 
                className="text-4xl font-bold text-purple-600 mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                Secure
              </motion.div>
              <p className="text-gray-600">Privacy-first approach</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <h2 className="text-4xl font-bold text-gray-600 mb-4">
            Why Choose Mental Health AI?
          </h2>
          <p className="text-xl text-gray-600">
            Cutting-edge technology meets compassionate mental health support
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300"
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                scale: 1.02
              }}
            >
              <motion.div 
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-3xl mb-6 mx-auto`}
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ duration: 0.5 }}
              >
                {feature.icon}
              </motion.div>
              
              <h3 className="text-xl font-semibold text-gray-600 mb-4 text-center">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 text-center leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.h2 
            className="text-4xl font-bold text-white mb-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            Start Your Mental Health Journey Today
          </motion.h2>
          
          <motion.p 
            className="text-xl text-blue-100 mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            Join thousands of users who trust Mental Health AI for their wellness journey
          </motion.p>
          
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/mood-check"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center space-x-3"
                >
                  <span className="text-2xl">🚀</span>
                  <span>Continue Your Journey</span>
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/auth/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center space-x-3"
                >
                  <span className="text-2xl">🎉</span>
                  <span>Get Started Now</span>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default HomePage