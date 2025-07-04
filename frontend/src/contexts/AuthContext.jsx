/**
 * Authentication Context - Day 4 Enhanced
 * Author: Enthusiast-AD
 * Date: 2025-07-03 14:45:26 UTC
 * Features: JWT management, auto-refresh, persistent sessions
 */

import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('auth_token'))
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [preferences, setPreferences] = useState(null)

  // Initialize authentication state
  useEffect(() => {
    initializeAuth()
  }, [])

  // Auto-refresh token every 45 minutes
  useEffect(() => {
    if (token && isAuthenticated) {
      const refreshInterval = setInterval(() => {
        refreshTokenIfNeeded()
      }, 45 * 60 * 1000) // 45 minutes

      return () => clearInterval(refreshInterval)
    }
  }, [token, isAuthenticated])

  const initializeAuth = async () => {
    setIsLoading(true)
    
    const storedToken = localStorage.getItem('auth_token')
    if (!storedToken) {
      setIsLoading(false)
      return
    }

    try {
      // Verify token and get user info
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setToken(storedToken)
        setIsAuthenticated(true)
        
        // Load user preferences
        await loadUserPreferences(storedToken)
        
        console.log('✅ Authentication restored:', userData.username)
      } else {
        // Token is invalid, clear it
        logout()
      }
    } catch (error) {
      console.error('❌ Auth initialization failed:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      setIsLoading(true)

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        const { access_token, user: userData } = data
        
        // Store authentication data
        localStorage.setItem('auth_token', access_token)
        setToken(access_token)
        setUser(userData)
        setIsAuthenticated(true)
        
        // Load user preferences
        await loadUserPreferences(access_token)
        
        console.log('✅ Login successful:', userData.username)
        
        return { success: true, user: userData }
      } else {
        console.error('❌ Login failed:', data.detail)
        return { success: false, error: data.detail }
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setIsLoading(true)

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Registration successful:', data.username)
        
        // Auto-login after registration
        const loginResult = await login(userData.username, userData.password)
        return loginResult
      } else {
        console.error('❌ Registration failed:', data.detail)
        return { success: false, error: data.detail }
      }
    } catch (error) {
      console.error('❌ Registration error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    setPreferences(null)
    console.log('✅ Logged out successfully')
  }

  const loadUserPreferences = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/preferences`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const prefs = await response.json()
        setPreferences(prefs)
        return prefs
      }
    } catch (error) {
      console.error('❌ Failed to load preferences:', error)
    }
  }

  const updatePreferences = async (newPreferences) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      })

      if (response.ok) {
        const updatedPrefs = await response.json()
        setPreferences(updatedPrefs)
        console.log('✅ Preferences updated')
        return { success: true }
      } else {
        throw new Error('Failed to update preferences')
      }
    } catch (error) {
      console.error('❌ Failed to update preferences:', error)
      return { success: false, error: error.message }
    }
  }

  const refreshTokenIfNeeded = async () => {
    // This would implement token refresh logic
    // For now, we'll just verify the current token
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.log('🔄 Token expired, logging out')
        logout()
      }
    } catch (error) {
      console.error('❌ Token refresh check failed:', error)
    }
  }

  const getAuthHeaders = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  const value = {
    // State
    user,
    token,
    isLoading,
    isAuthenticated,
    preferences,
    
    // Actions
    login,
    register,
    logout,
    updatePreferences,
    getAuthHeaders,
    
    // Utils
    refreshTokenIfNeeded
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}