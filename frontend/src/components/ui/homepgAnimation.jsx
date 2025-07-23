import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, Sun, Cloud, Star, Smile } from 'lucide-react';

const MoodTracker = () => {
    const [currentMoodIndex, setCurrentMoodIndex] = useState(0);
    const [isInteracting, setIsInteracting] = useState(false);
    const [particles, setParticles] = useState([]);
    const canvasRef = useRef(null);
    const intervalRef = useRef(null);

    const moodCards = [
        {
            label: 'Joyful',
            icon: Smile,
            color: 'from-emerald-400 to-teal-500',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            textColor: 'text-emerald-600 dark:text-emerald-400',
            description: 'Feeling amazing and energetic!',
            intensity: 0.9
        },
        {
            label: 'Excited',
            icon: Zap,
            color: 'from-yellow-400 to-orange-500',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            textColor: 'text-yellow-600 dark:text-yellow-400',
            description: 'Ready to take on the world!',
            intensity: 0.85
        },
        {
            label: 'Peaceful',
            icon: Sun,
            color: 'from-blue-400 to-cyan-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400',
            description: 'Calm and centered today.',
            intensity: 0.7
        },
        {
            label: 'Thoughtful',
            icon: Cloud,
            color: 'from-purple-400 to-indigo-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            textColor: 'text-purple-600 dark:text-purple-400',
            description: 'Reflecting and processing.',
            intensity: 0.6
        },
        {
            label: 'Hopeful',
            icon: Star,
            color: 'from-pink-400 to-rose-500',
            bgColor: 'bg-pink-50 dark:bg-pink-900/20',
            textColor: 'text-pink-600 dark:text-pink-400',
            description: 'Looking forward to better days.',
            intensity: 0.75
        },
        {
            label: 'Grateful',
            icon: Heart,
            color: 'from-red-400 to-pink-500',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            textColor: 'text-red-600 dark:text-red-400',
            description: 'Appreciating life\'s moments.',
            intensity: 0.8
        }
    ];

    // Particle system for background animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Generate particles
        const generateParticles = () => {
            const newParticles = [];
            for (let i = 0; i < 20; i++) {
                newParticles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 3 + 1,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random() * 0.3 + 0.1,
                });
            }
            setParticles(newParticles);
        };

        generateParticles();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [particles]);

    // Auto-cycle through moods
    useEffect(() => {
        if (!isInteracting) {
            intervalRef.current = setInterval(() => {
                setCurrentMoodIndex((prev) => (prev + 1) % moodCards.length);
            }, 4000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isInteracting, moodCards.length]);

    const handleMoodClick = (index) => {
        setIsInteracting(true);
        setCurrentMoodIndex(index);

        // Resume auto-cycling after 10 seconds
        setTimeout(() => {
            setIsInteracting(false);
        }, 10000);
    };

    const floatingVariants = {
        animate: {
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const CurrentIcon = moodCards[currentMoodIndex].icon;

    return (
        <motion.div
            className="relative lg:h-[600px] h-[500px] overflow-hidden"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        >
            {/* Enhanced Canvas Background */}
            {/* <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full rounded-3xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))',
                }}
            /> */}

            {/* Glassmorphism overlay */}
            <div className="absolute bg-transparent" />

            {/* Central Mood Display */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    className="relative z-10"
                    key={currentMoodIndex}
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                >
                    {/* Main mood circle */}
                    <motion.div
                        className={`relative w-36 h-36 rounded-full bg-gradient-to-br ${moodCards[currentMoodIndex].color} flex items-center justify-center shadow-2xl cursor-pointer group`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMoodClick(currentMoodIndex)}
                    >
                        <CurrentIcon
                            size={48}
                            className="text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                        />

                        {/* Pulse effect */}
                        <motion.div
                            className="absolute inset-0 rounded-full bg-white/20"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </motion.div>

                    {/* Mood label and description */}
                    <motion.div
                        className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center min-w-max"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className={`text-2xl font-bold ${moodCards[currentMoodIndex].textColor} mb-1`}>
                            {moodCards[currentMoodIndex].label}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 px-4">
                            {moodCards[currentMoodIndex].description}
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Interactive Floating Mood Cards */}
            <AnimatePresence>
                {moodCards.map((mood, index) => {
                    if (index === currentMoodIndex) return null;

                    const positions = [
                        { top: '8%', left: '12%' },
                        { top: '15%', right: '8%' },
                        { bottom: '25%', left: '15%' },
                        { bottom: '12%', right: '12%' },
                        { top: '45%', left: '3%' },
                        { top: '55%', right: '3%' }
                    ];

                    const MoodIcon = mood.icon;

                    return (
                        <motion.div
                            key={index}
                            className={`absolute w-20 h-20 rounded-2xl ${mood.bgColor} backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30 dark:border-slate-700/30 cursor-pointer group`}
                            style={positions[index % positions.length]}
                            variants={floatingVariants}
                            animate="animate"
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.15, type: "spring" }}
                            whileHover={{
                                scale: 1.15,
                                zIndex: 10,
                                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
                                y: -5
                            }}
                            whileTap={{ scale: 1.05 }}
                            onClick={() => handleMoodClick(index)}
                        >
                            <MoodIcon
                                size={24}
                                className={`${mood.textColor} group-hover:scale-110 transition-transform duration-300`}
                            />

                            {/* Tooltip */}
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="bg-slate-800 dark:bg-slate-700 text-white text-xs px-3 py-1 rounded-lg shadow-lg whitespace-nowrap">
                                    {mood.label}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Enhanced Progress Ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.svg
                    width="220"
                    height="220"
                    className="transform -rotate-90"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <circle
                        cx="110"
                        cy="110"
                        r="100"
                        stroke="rgba(59, 130, 246, 0.1)"
                        strokeWidth="2"
                        fill="none"
                    />
                    <motion.circle
                        cx="110"
                        cy="110"
                        r="100"
                        stroke="url(#moodGradient)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: moodCards[currentMoodIndex].intensity }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <defs>
                        <linearGradient id="moodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="50%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                    </defs>
                </motion.svg>
            </div>

            {/* Interaction indicator */}
            {isInteracting && (
                <motion.div
                    className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    Interactive mode
                </motion.div>
            )}

            {/* Bottom instruction text */}
            <motion.div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
            >

            </motion.div>
        </motion.div>
    );
};

export default MoodTracker;