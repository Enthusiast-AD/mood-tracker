import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Brain, Shield } from 'lucide-react';

const QuickActionsWidget = ({ onChatClick }) => {
    const actions = [
        {
            icon: <Heart className="w-5 h-5" />,
            title: "Track Mood",
            description: "Record how you're feeling",
            path: "/mood-check",
            gradient: "from-blue-500 via-blue-400 to-blue-600",
            hoverBg: "hover:bg-blue-100/50 dark:hover:bg-blue-900/20",
            activeColor: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
        },
        {
            icon: <Shield className="w-5 h-5" />,
            title: "Crisis Support",
            description: "24/7 emergency help",
            path: "/crisis-support",
            gradient: "from-red-500 via-red-400 to-red-600",
            hoverBg: "hover:bg-red-100/50 dark:hover:bg-red-900/20",
            activeColor: "group-hover:text-red-600 dark:group-hover:text-red-400"
        },
        {
            icon: <Brain className="w-5 h-5" />,
            title: "AI Chat",
            description: "Get personalized support",
            action: onChatClick,
            gradient: "from-pink-500 via-purple-400 to-blue-500",
            hoverBg: "hover:bg-purple-100/50 dark:hover:bg-purple-900/20",
            activeColor: "group-hover:text-purple-600 dark:group-hover:text-purple-400"
        }
    ];

    const ActionButton = ({ action }) => {
        // Add text-left to the base className to ensure consistent left alignment
        const baseClassName = `group block w-full p-3 ${action.hoverBg} hover:shadow-md rounded-lg transition-all duration-300 text-left`;
        
        const content = (
            <div className="flex items-center space-x-3">
                <div className={`p-2 bg-gradient-to-r ${action.gradient} rounded-lg transition-transform group-hover:scale-110`}>
                    <div className="text-white">{action.icon}</div>
                </div>
                <div className="flex-1"> {/* Add flex-1 to ensure proper spacing */}
                    <p className={`font-medium text-gray-900 dark:text-white ${action.activeColor} transition-colors`}>
                        {action.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {action.description}
                    </p>
                </div>
            </div>
        );

        return action.path ? (
            <Link to={action.path} className={baseClassName}>
                {content}
            </Link>
        ) : (
            <button onClick={action.action} className={baseClassName}>
                {content}
            </button>
        );
    };

    return (
        <motion.div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                </h3>

                <div className="space-y-3">
                    {actions.map((action, index) => (
                        <motion.div
                            key={action.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <ActionButton action={action} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default QuickActionsWidget;