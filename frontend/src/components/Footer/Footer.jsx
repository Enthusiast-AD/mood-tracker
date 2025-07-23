import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { Brain } from 'lucide-react'



const Footer = () => {
    return (

        <footer className="bg-slate-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    className="grid md:grid-cols-4 gap-8"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="md:col-span-2">
                        <motion.div
                            className="flex items-center space-x-3 mb-6"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Mental Health Hub</h3>
                        </motion.div>
                        <p className="text-slate-400 leading-relaxed max-w-md mb-6">
                            Empowering millions to understand and improve their mental health
                            through AI-powered insights and compassionate support.
                        </p>
                        <div className="flex space-x-4">
                            {['📱', '💬', '📧', '🌐'].map((emoji, index) => (
                                <motion.div
                                    key={index}
                                    className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center cursor-pointer"
                                    whileHover={{ scale: 1.2, backgroundColor: "#475569" }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <span className="text-lg">{emoji}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Features</h4>
                        <ul className="space-y-2 text-slate-400">
                            {['Mood Tracking', 'AI Insights', 'Crisis Support', 'Analytics', 'Community'].map((item, index) => (
                                <motion.li
                                    key={index}
                                    className="hover:text-white cursor-pointer transition-colors duration-200"
                                    whileHover={{ x: 5 }}
                                >
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Support</h4>
                        <ul className="space-y-2 text-slate-400">
                            {['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact Us', 'FAQ'].map((item, index) => (
                                <motion.li
                                    key={index}
                                    className="hover:text-white cursor-pointer transition-colors duration-200"
                                    whileHover={{ x: 5 }}
                                >
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                <motion.div
                    className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <p>&copy; 2024 Mental Health Hub. Made with ❤️ for your wellbeing.</p>
                </motion.div>
            </div>
        </footer>
    )
}

export default Footer