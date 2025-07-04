/**
 * Protected Route Component - Day 4 Enhanced
 * Author: Enthusiast-AD
 * Date: 2025-07-03 14:45:26 UTC
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, fallback = null }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    if (fallback) {
      return fallback
    }
    
    return (
      <Navigate 
        to="/auth/login" 
        state={{ from: location.pathname }}
        replace 
      />
    )
  }

  // User is authenticated, render children
  return children
}

export default ProtectedRoute