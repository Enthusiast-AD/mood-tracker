import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20
      }
    }
  }

  const slideInLeft = {
    hidden: { x: -60, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.8
      }
    }
  }

  const slideInRight = {
    hidden: { x: 60, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.8
      }
    }
  }

  // Animated emoji state
  const faceEmojis = ['😃', '😁', '😊', '😎', '🥳', '😇', '🤩', '😌', '😅', '😂', '😍', '😴', '😐', '😮‍💨', '😔', '😢', '😭', '😡', '😱', '😇']
  const [emojiIndex, setEmojiIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiIndex((prev) => (prev + 1) % faceEmojis.length)
    }, 1200) // Change emoji every 1.2 seconds
    return () => clearInterval(interval)
  }, [])

  const moodCards = [
    { emoji: "😊", label: "Happy", color: "from-blue-500 to-purple-600" },
    { emoji: "🎯", label: "Focused", color: "from-pink-500 to-orange-500" },
    { emoji: "🌟", label: "Motivated", color: "from-green-500 to-teal-500" },
    { emoji: "💪", label: "Strong", color: "from-indigo-500 to-purple-500" }
  ];

  // Helper to get random position/rotation
  const getRandomFloat = (min, max) => Math.random() * (max - min) + min;

  const [cardStates, setCardStates] = useState(
    moodCards.map(() => ({
      top: getRandomFloat(10, 70),
      left: getRandomFloat(5, 65),
      rotate: getRandomFloat(-10, 10)
    }))
  );

  // Animate cards to new random positions every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCardStates(
        moodCards.map(() => ({
          top: getRandomFloat(10, 70),
          left: getRandomFloat(5, 65),
          rotate: getRandomFloat(-10, 10)
        }))
      );
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Stats and Content */}
          <motion.div
            className="space-y-8"
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
          >
            {/* Main Content */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                Your Mental Health
                <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                  Companion
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                AI-powered mood tracking and mental wellness insights designed to help you understand and improve your emotional well-being.
              </p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                {isAuthenticated ? (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/mood-check"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
                      >
                        <span className="text-xl">📝</span>
                        <span>Track Your Mood</span>
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/dashboard"
                        className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center space-x-3"
                      >
                        <span className="text-xl">📊</span>
                        <span>View Dashboard</span>
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/auth/register"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
                      >
                        <span className="text-xl">✨</span>
                        <span>Get Started</span>
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/mood-check"
                        className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center space-x-3"
                      >
                        <span className="text-xl">👀</span>
                        <span>Try Demo</span>
                      </Link>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
              variants={containerVariants}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  AI-Powered
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Advanced sentiment analysis</p>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl font-bold text-green-600 mb-2">
                  24/7
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Crisis support available</p>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  Secure
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Privacy-first approach</p>
              </motion.div>
            </motion.div>


          </motion.div>

          {/* Right Side - Full Image with Floating Cards */}
          <motion.div
            className="relative w-full h-[500px] lg:h-[650px] rounded-3xl overflow-hidden"
            variants={slideInRight}
            initial="hidden"
            animate="visible"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src="/src/assets/mood-background.jpg"
                alt="Mood background"
                className="w-full h-full object-cover"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(ellipse 80% 70% at 50% 50%, #000 80%, transparent 100%)",
                  maskImage:
                    "radial-gradient(ellipse 80% 70% at 50% 50%, #000 80%, transparent 100%)",
                  filter: 'brightness(1.1) contrast(1.05)'
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

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
          <motion.h2
            className="text-5xl font-bold mb-4 overflow-hidden"
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
              Powerful Features for Your Wellness Journey
            </motion.span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Experience cutting-edge technology designed to support your mental health with privacy and compassion at its core.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              variants={itemVariants}
              whileHover={{
                y: -8,
                scale: 1.02
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-6`}
                whileHover={{
                  scale: 1.1,
                  rotate: 5
                }}
                transition={{ duration: 0.3 }}
              >
                {feature.icon}
              </motion.div>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {feature.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>

        <div className="relative max-w-4xl mx-auto text-center px-4 py-20">
          <motion.h2
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Ready to Transform Your Mental Health?
          </motion.h2>

          <motion.p
            className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            Join thousands of users who have discovered a better way to understand and improve their emotional well-being with AI-powered insights.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/mood-check"
                  className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-200 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center space-x-3"
                >
                  <span className="text-xl">🚀</span>
                  <span>Continue Your Journey</span>
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/auth/register"
                    className="bg-white dark:bg-gray-400 text-blue-600 dark:text-blue-200 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center space-x-3"
                  >
                    <span className="text-xl">Start Free Today</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/mood-check"
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-200 transition-all duration-300 inline-flex items-center space-x-3"
                  >
                    <span className="text-xl">👀</span>
                    <span>Try Demo</span>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
      {/* footer */}
      <footer className=" bg-gray-100 text-gray-800 py-8 mt-16 dark:bg-gray-900 dark:text-gray-400 ">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 dark:text-gray-400">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <Link to="/privacy" className="text-gray-800 text-sm dark:text-gray-200">Privacy Policy</Link>
            <span className="mx-2">|</span>
            <Link to="/terms" className="text-gray-800 text-sm dark:text-gray-200">Terms of Service</Link>
            <span className="mx-2">|</span>
            <Link to="/contact" className="text-gray-800 text-sm dark:text-gray-200">Contact Us</Link>
          </div>


          <div className="mt-4">
            <Link to="/about" className="text-gray-800 text-sm dark:text-gray-200">About Us</Link>
            <span className="mx-2">|</span>
            <Link to="/blog" className="text-gray-800 text-sm dark:text-gray-200">Blog</Link>
            <span className="mx-2">|</span>
            <Link to="/help" className="text-gray-800 text-sm dark:text-gray-200">Help Center</Link>

            <div className="ml-auto">
              <Link to="/faq" className="text-gray-800 dark:text-gray-200 text-sm">FAQ</Link>
              <span className="mx-2">|</span>
              <Link to="/support" className="text-gray-800 dark:text-gray-200 text-sm">Support</Link>
            </div>
          </div>


        </div>



        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Mood Tracker. All rights reserved.</p>
          <p className="text-xs mt-2">Made with ❤️</p>
        </div>

      </footer>
    </div>

  )
}

export default HomePage