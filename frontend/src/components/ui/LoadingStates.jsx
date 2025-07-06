import React from 'react'

// Shimmer animation for loading states
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`} 
       style={{ animation: 'shimmer 2s infinite' }} />
)

// Dashboard Loading Skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-fade-in">
    {/* Header Skeleton */}
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shimmer className="w-8 h-8 rounded-full" />
          <div className="space-y-2">
            <Shimmer className="h-6 w-64 rounded" />
            <Shimmer className="h-4 w-48 rounded" />
          </div>
        </div>
        <Shimmer className="w-32 h-6 rounded" />
      </div>
    </div>

    {/* Metric Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-3">
              <Shimmer className="h-4 w-24 rounded" />
              <Shimmer className="h-8 w-16 rounded" />
              <Shimmer className="h-3 w-32 rounded" />
            </div>
            <Shimmer className="w-12 h-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Shimmer className="h-6 w-48 rounded mb-6" />
        <Shimmer className="h-80 w-full rounded" />
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Shimmer className="h-6 w-48 rounded mb-6" />
        <Shimmer className="h-80 w-full rounded" />
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="bg-white rounded-lg shadow-lg p-6">
      <Shimmer className="h-6 w-40 rounded mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Shimmer className="w-12 h-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-3/4 rounded" />
              <Shimmer className="h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

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