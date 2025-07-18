import React from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">MoodTracker</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Empowering mental wellness through mindful tracking and AI insights.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/tracker" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                    Mood Tracker
                                </Link>
                            </li>
                            <li>
                                <Link to="/insights" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                    AI Insights
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/crisis-support" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                    Crisis Support
                                </Link>
                            </li>
                            <li>
                                <Link to="/help" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Contact</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="mailto:support@moodtracker.com" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                    support@moodtracker.com
                                </a>
                            </li>
                            <li>
                                <a href="https://twitter.com/moodtracker" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                                    @moodtracker
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className=" content-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center md:flex-row ">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            © {new Date().getFullYear()} MoodTracker. All rights reserved.
                        </p>
                        <div className="flex justify-center space-x-1 text-sm text-gray-600 dark:text-gray-300 mt-4 md:mt-0">
                            <span>Made with</span>
                            <Heart className="w-4 h-4 text-red-500 fill-current mt-0.5" />
                            <span>by MoodTracker Team</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer