import React from 'react'
import { motion } from 'framer-motion'

// Shimmer animation for loading states
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`}
    style={{ animation: 'shimmer 2s infinite' }} />
)

// Dashboard Loading Skeleton
export const DashboardSkeleton = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-8">
      {/* Header Section Skeleton - Exact match */}
      <div className="mb-8 mt-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-3xl flex items-center justify-center mb-4">
            <Shimmer className="w-8 h-8 rounded" />
          </div>
          <div>
            <Shimmer className="h-10 w-64 mx-auto mb-2" />
            <Shimmer className="h-6 w-96 mx-auto" />
          </div>
        </div>
      </div>

      {/* Main Grid Layout - Exact match to lg:grid-cols-3 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - AI Insights Dashboard (lg:col-span-2) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Shimmer className="w-8 h-8 rounded-full" />
                <Shimmer className="h-6 w-48" />
              </div>
              <Shimmer className="w-6 h-6 rounded" />
            </div>

            {/* Main Chart Area */}
            <div className="mb-6">
              <Shimmer className="h-80 w-full rounded-lg" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Shimmer className="h-8 w-12 mx-auto mb-2" />
                  <Shimmer className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>

            {/* Additional sections */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <Shimmer className="h-5 w-32 mb-3" />
                <Shimmer className="h-32 w-full" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <Shimmer className="h-5 w-32 mb-3" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Shimmer className="w-6 h-6 rounded" />
                      <div className="flex-1">
                        <Shimmer className="h-4 w-3/4 mb-1" />
                        <Shimmer className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar widgets */}
        <div className="space-y-6">
          {/* AI Insight Widget Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-600 dark:to-purple-600 rounded-full flex items-center justify-center">
                <Shimmer className="w-6 h-6 rounded" />
              </div>
              <div className="flex-1">
                <Shimmer className="h-5 w-32 mb-2" />
                <Shimmer className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <Shimmer className="h-4 w-full" />
              <Shimmer className="h-4 w-5/6" />
              <Shimmer className="h-4 w-3/4" />
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <Shimmer className="h-10 w-full rounded-lg" />
            </div>
          </div>

          {/* Quick Actions Widget Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <Shimmer className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '💬', name: 'Chat' },
                { icon: '📊', name: 'Analytics' },
                { icon: '🎯', name: 'Goals' },
                { icon: '⚡', name: 'Quick Check' }
              ].map((item, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                  <div className="text-2xl mb-2 text-center">{item.icon}</div>
                  <Shimmer className="h-4 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mood Check Loading Skeleton
export const MoodCheckSkeleton = () => (
  <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
    <div className="text-center mb-8">
      <Shimmer className="h-10 w-64 rounded mx-auto mb-4" />
      <Shimmer className="h-6 w-96 rounded mx-auto" />
    </div>

    <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
      {/* Mood Slider Skeleton */}
      <div>
        <Shimmer className="h-6 w-48 rounded mb-4" />
        <Shimmer className="h-3 w-full rounded mb-2" />
        <div className="flex justify-between">
          <Shimmer className="h-4 w-16 rounded" />
          <Shimmer className="h-4 w-16 rounded" />
          <Shimmer className="h-4 w-16 rounded" />
        </div>
      </div>

      {/* Emotions Grid Skeleton */}
      <div>
        <Shimmer className="h-6 w-56 rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="p-3 border-2 border-gray-200 rounded-lg">
              <Shimmer className="w-8 h-8 rounded mx-auto mb-1" />
              <Shimmer className="h-4 w-16 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Form Fields Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Shimmer className="h-6 w-32 rounded mb-2" />
          <Shimmer className="h-12 w-full rounded" />
        </div>
        <div>
          <Shimmer className="h-6 w-32 rounded mb-2" />
          <Shimmer className="h-12 w-full rounded" />
        </div>
      </div>

      {/* Notes Skeleton */}
      <div>
        <Shimmer className="h-6 w-40 rounded mb-4" />
        <Shimmer className="h-32 w-full rounded" />
      </div>

      {/* Submit Button Skeleton */}
      <Shimmer className="h-12 w-full rounded" />
    </div>
  </div>
)

// Chart Loading Skeleton
export const ChartSkeleton = ({ title, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <Shimmer className="h-6 w-48 rounded" />
      <Shimmer className="w-2 h-2 rounded-full" />
    </div>
    <Shimmer className="h-80 w-full rounded mb-6" />
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
          <Shimmer className="h-8 w-12 rounded mx-auto mb-2" />
          <Shimmer className="h-4 w-20 rounded mx-auto" />
        </div>
      ))}
    </div>
  </div>
)

// Generic Card Skeleton
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
    <div className="space-y-4">
      <Shimmer className="h-6 w-48 rounded" />
      <Shimmer className="h-4 w-full rounded" />
      <Shimmer className="h-4 w-3/4 rounded" />
      <div className="flex space-x-4 mt-6">
        <Shimmer className="h-10 w-24 rounded" />
        <Shimmer className="h-10 w-24 rounded" />
      </div>
    </div>
  </div>
)