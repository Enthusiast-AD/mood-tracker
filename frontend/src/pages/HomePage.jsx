import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
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
  Info,
  Brain,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  Eye
} from 'lucide-react'

function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [currentMoodIndex, setCurrentMoodIndex] = useState(0)
  const canvasRef = useRef(null)
  const animationRef = useRef()
  const particlesRef = useRef([])

  const features = [
    {
      icon: <Brain size={24} />,
      title: 'AI-Powered Mood Tracking',
      description: 'Advanced neural networks analyze your emotional patterns with 97% accuracy',
      color: 'from-blue-500 to-cyan-500',
      stats: '50k+ analyses'
    },
    {
      icon: <Sparkles size={24} />,
      title: 'Smart Insights',
      description: 'Personalized recommendations based on your unique emotional fingerprint',
      color: 'from-purple-500 to-pink-500',
      stats: '10k+ insights'
    },
    {
      icon: <AlertTriangle size={24} />,
      title: 'Crisis Support',
      description: 'Immediate help and resources available 24/7 when you need them most',
      color: 'from-red-500 to-orange-500',
      stats: '24/7 support'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Beautiful Analytics',
      description: 'Visualize your mental health journey with stunning interactive dashboards',
      color: 'from-green-500 to-teal-500',
      stats: '15+ charts'
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'Privacy & Security',
      description: 'Military-grade encryption protects your most sensitive data',
      color: 'from-indigo-500 to-purple-500',
      stats: '256-bit encryption'
    },
    {
      icon: <Users size={24} />,
      title: 'Community Support',
      description: 'Connect with others on similar journeys in safe, moderated spaces',
      color: 'from-yellow-500 to-orange-500',
      stats: '25k+ members'
    }
  ]

  const moodCards = [
    { emoji: "😊", label: "Happy", color: "from-yellow-400 to-orange-500", bg: "bg-yellow-50" },
    { emoji: "🎯", label: "Focused", color: "from-blue-500 to-indigo-600", bg: "bg-blue-50" },
    { emoji: "⚡", label: "Energized", color: "from-green-400 to-emerald-600", bg: "bg-green-50" },
    { emoji: "❤️", label: "Loved", color: "from-pink-400 to-rose-600", bg: "bg-pink-50" },
    { emoji: "🌟", label: "Inspired", color: "from-purple-400 to-violet-600", bg: "bg-purple-50" },
    { emoji: "🌈", label: "Peaceful", color: "from-cyan-400 to-teal-600", bg: "bg-cyan-50" }
  ]

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Cycling mood display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMoodIndex((prev) => (prev + 1) % moodCards.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Particle system for canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`
        })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particlesRef.current.forEach(particle => {
        particle.x += particle.speedX
        particle.y += particle.speedY
        
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }

    initParticles()
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 blur-3xl"
          animate={{
            x: mousePosition.x / 50,
            y: mousePosition.y / 50,
          }}
          transition={{ type: "spring", damping: 50 }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-purple-200 dark:bg-purple-900 rounded-full opacity-20 blur-3xl"
          animate={{
            x: -mousePosition.x / 80,
            y: -mousePosition.y / 80,
          }}
          transition={{ type: "spring", damping: 50 }}
          style={{ bottom: '20%', right: '20%' }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side Content */}
          <motion.div
            className="space-y-8 z-10 relative"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Main Headlines */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <motion.div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/50 px-4 py-2 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Mental Wellness</span>
                </motion.div>

                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="text-slate-900 dark:text-slate-50">Your Mental</span>
                  <br />
                  <motion.span
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{ backgroundSize: '200% 100%' }}
                  >
                    Health Hub
                  </motion.span>
                </h1>
              </motion.div>

              <motion.p 
                className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Transform your emotional well-being with AI-powered insights, 
                real-time mood tracking, and personalized mental health support.
              </motion.p>

              {/* Interactive Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-4 py-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {[
                  { number: '50k+', label: 'Happy Users', icon: <Users className="w-5 h-5" /> },
                  { number: '97%', label: 'Accuracy', icon: <Target className="w-5 h-5" /> },
                  { number: '24/7', label: 'Support', icon: <Shield className="w-5 h-5" /> }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 text-center border border-slate-200/50 dark:border-slate-700/50"
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" 
                    }}
                  >
                    <div className="flex justify-center mb-2 text-blue-600 dark:text-blue-400">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.number}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 pt-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <motion.button
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl flex items-center justify-center space-x-3 relative overflow-hidden"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <Brain className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Start Your Journey</span>
                  <motion.div
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-4 h-4" />
                  </motion.div>
                </motion.button>

                <motion.button
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye className="w-5 h-5" />
                  <span>Watch Demo</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Interactive Mood Visualization */}
          <motion.div
            className="relative lg:h-[600px] h-[500px]"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          >
            {/* Canvas Background */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full rounded-3xl"
              style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))' }}
            />

            {/* Central Mood Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="relative"
                key={currentMoodIndex}
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
              >
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${moodCards[currentMoodIndex].color} flex items-center justify-center text-6xl shadow-2xl`}>
                  {moodCards[currentMoodIndex].emoji}
                </div>
                <motion.div
                  className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {moodCards[currentMoodIndex].label}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Feeling great today!</div>
                </motion.div>
              </motion.div>
            </div>

            {/* Floating Mood Cards */}
            <AnimatePresence>
              {moodCards.map((mood, index) => {
                if (index === currentMoodIndex) return null
                
                const positions = [
                  { top: '10%', left: '15%' },
                  { top: '20%', right: '10%' },
                  { bottom: '20%', left: '20%' },
                  { bottom: '15%', right: '15%' },
                  { top: '45%', left: '5%' },
                  { top: '55%', right: '5%' }
                ]
                
                return (
                  <motion.div
                    key={index}
                    className={`absolute w-16 h-16 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50`}
                    style={positions[index % positions.length]}
                    variants={floatingVariants}
                    animate="animate"
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.2, 
                      zIndex: 10,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" 
                    }}
                  >
                    {mood.emoji}
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Progress Ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.svg
                width="200"
                height="200"
                className="transform -rotate-90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="rgba(59, 130, 246, 0.2)"
                  strokeWidth="2"
                  fill="none"
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 0.75 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Features Grid */}
      <motion.div
        className="relative max-w-7xl mx-auto px-4 py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.h2
            className="text-4xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Revolutionary Features
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Experience the future of mental health technology with cutting-edge AI, 
            beautiful visualizations, and compassionate support systems.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
              variants={itemVariants}
              whileHover={{
                y: -10,
                scale: 1.02
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Icon Container */}
              <motion.div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6 relative z-10`}
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)"
                }}
                transition={{ duration: 0.3 }}
              >
                {feature.icon}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-white/20"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>

              <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {feature.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {feature.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {feature.stats}
                  </span>
                  <motion.div
                    className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.2 }}
                  >
                    <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                </div>
              </div>

              {/* Hover Effect Particles */}
              <motion.div
                className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Enhanced CTA Section */}
      <motion.div
        className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 bg-black/10"
            animate={{
              background: [
                "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%)",
                "radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 60% 60%, rgba(255, 119, 198, 0.3), transparent 50%)",
                "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%)"
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 py-20">
          <motion.h2
            className="text-4xl lg:text-6xl font-bold text-white mb-8"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Ready to Transform Your
            <br />
            <motion.span
              className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ backgroundSize: '200% 100%' }}
            >
              Mental Health?
            </motion.span>
          </motion.h2>

          <motion.p
            className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Join over 50,000 users who have discovered a smarter, more compassionate 
            approach to emotional well-being with our AI-powered platform.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <motion.button
              className="group bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center space-x-3 relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <Calendar className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Start Free Today</span>
            </motion.button>

            <motion.button
              className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="w-5 h-5" />
              <span>Learn More</span>
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-80"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 0.8 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {[
              "🏆 #1 Mental Health App",
              "🔒 HIPAA Compliant",
              "⭐ 4.9/5 User Rating",
              "🌍 Available Globally"
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-white/80 text-sm font-medium"
                whileHover={{ scale: 1.1, color: "#ffffff" }}
                transition={{ duration: 0.2 }}
              >
                {item}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="text-center mb-16"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              What Our Users Say
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Real stories from real people transforming their mental health
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah M.",
              role: "Software Engineer",
              content: "This app helped me understand my anxiety patterns. The AI insights are incredibly accurate and the support is amazing.",
              avatar: "👩‍💻",
              rating: 5
            },
            {
              name: "Michael R.",
              role: "Teacher",
              content: "The mood tracking features are intuitive and the analytics help me see progress I wouldn't have noticed otherwise.",
              avatar: "👨‍🏫",
              rating: 5
            },
            {
              name: "Jessica L.",
              role: "Designer",
              content: "Beautiful interface and genuinely helpful. It's like having a therapist in my pocket 24/7.",
              avatar: "👩‍🎨",
              rating: 5
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{testimonial.name}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="text-yellow-400 text-lg"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2 + i * 0.1 }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
              
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{testimonial.content}"
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Newsletter/Updates Section */}
      <motion.div
        className="bg-slate-100 dark:bg-slate-800 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Stay Updated
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              Get the latest insights on mental health, new features, and wellness tips
            </p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-colors duration-300"
              />
              <motion.button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="w-5 h-5" />
                <span>Subscribe</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      
    </div>
  )
}

export default HomePage