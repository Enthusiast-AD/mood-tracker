import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/layout/Footer'
import { 
  LineChart, 
  Shield, 
  Smartphone, 
  AlertTriangle, 
  BarChart2, 
  Bot,
  Smile,
  Target,
  Zap,
  ShieldCheck,
  Heart,
  HelpCircle,
  BookOpen,
  Mail,
  Info
} from 'lucide-react'

function HomePage() {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: <BarChart2 size={24} />,
      title: 'AI-Powered Mood Tracking',
      description: 'Track your daily emotions with advanced AI analysis and sentiment detection',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Bot size={24} />,
      title: 'Smart Insights',
      description: 'Get personalized recommendations and pattern recognition from your mood data',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <AlertTriangle size={24} />,
      title: 'Crisis Support',
      description: 'Immediate help and resources available 24/7 when you need them most',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: <LineChart size={24} />,
      title: 'Beautiful Analytics',
      description: 'Visualize your mental health journey with stunning charts and trends',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'Privacy & Security',
      description: 'Your mental health data is encrypted and completely private',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: <Smartphone size={24} />,
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

  const moodCards = [
    { emoji: <Smile size={28} />, label: "Happy", color: "from-blue-500 to-purple-600" },
    { emoji: <Target size={28} />, label: "Focused", color: "from-pink-500 to-orange-500" },
    { emoji: <Zap size={28} />, label: "Motivated", color: "from-green-500 to-teal-500" },
    { emoji: <Heart size={28} />, label: "Strong", color: "from-indigo-500 to-purple-500" }
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
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
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-50 leading-tight">
                Your Mental Health
                <motion.h2
                  className="relative text-6xl font-bold overflow-hidden justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 1.2 }}
                >
                  {/* Base gradient text */}
                  <span className="inline-block bg-gradient-to-r from-blue-500 via-blue-600 to-blue-800 dark:from-blue-400 dark:via-blue-500 dark:to-blue-700 bg-clip-text text-transparent">
                    Companion
                  </span>

                  {/* Smooth shimmer effect */}
                  <motion.span
                    className="absolute inset-0 bg-clip-text text-transparent"
                    style={{
                      backgroundSize: '200% 100%',
                      backgroundImage: 'linear-gradient(90deg, transparent 0%, transparent 45%, rgba(59, 30, 246, 0.9) 50%, transparent 55%, transparent 100%)'
                    }}
                    animate={{
                      backgroundPosition: ['200% 0', '-200% 0']
                    }}
                    transition={{
                      duration: 10,
                      ease: "linear",
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  >
                    Companion
                  </motion.span>
                </motion.h2>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
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
                        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
                      >
                        <BarChart2 className="w-5 h-5" />
                        <span>Track Your Mood</span>
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/dashboard"
                        className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 flex items-center space-x-3"
                      >
                        <LineChart className="w-5 h-5" />
                        <span>View Dashboard</span>
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/auth/register"
                        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
                      >
                        <Zap className="w-5 h-5" />
                        <span>Get Started</span>
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/mood-check"
                        className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 flex items-center space-x-3"
                      >
                        <Info className="w-5 h-5" />
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
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-100 dark:border-slate-700"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl font-bold text-blue-500 dark:text-blue-400 mb-2">
                  AI-Powered
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm">Advanced sentiment analysis</p>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-100 dark:border-slate-700"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 mb-2">
                  24/7
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm">Crisis support available</p>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-100 dark:border-slate-700"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-500 mb-2">
                  Secure
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm">Privacy-first approach</p>
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
              className="inline-block bg-gradient-to-r from-blue-500 via-blue-600 to-blue-800 dark:from-blue-400 dark:via-blue-500 dark:to-blue-700 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 100%'
              }}
            >
              Powerful Features for Your Wellness Journey
            </motion.span>
          </motion.h2>
          <motion.p
            className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
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
              className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-8 border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
              variants={itemVariants}
              whileHover={{
                y: -8,
                scale: 1.02
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6`}
                whileHover={{
                  scale: 1.1,
                  rotate: 5
                }}
                transition={{ duration: 0.3 }}
              >
                {feature.icon}
              </motion.div>

              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                {feature.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden"
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
                  className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center space-x-3"
                >
                  <Zap className="w-5 h-5" />
                  <span>Continue Your Journey</span>
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/auth/register"
                    className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center space-x-3"
                  >
                    <span>Start Free Today</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/mood-check"
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 inline-flex items-center space-x-3"
                  >
                    <Info className="w-5 h-5" />
                    <span>Try Demo</span>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
      
    </div>
  )
}

export default HomePage