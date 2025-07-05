import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setIsAuthenticated(true)
        console.log('✅ Authentication restored:', userData.username)
      } else {
        localStorage.removeItem('authToken')
        setUser(null)
        setIsAuthenticated(false)
        console.log('❌ Invalid token, cleared auth')
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('authToken', data.access_token)
        setUser(data.user)
        setIsAuthenticated(true)
        console.log('✅ Login successful:', data.user.username)
        return { success: true, user: data.user }
      } else {
        const errorData = await response.json()
        console.error('❌ Login failed:', errorData)
        
        // Handle different error formats
        let errorMessage = 'Login failed'
        
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail
        } else if (Array.isArray(errorData.detail)) {
          // Handle validation errors array
          errorMessage = errorData.detail.map(err => err.msg || err).join(', ')
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
        
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('❌ Login network error:', error)
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Registration successful:', data.username)
        return { success: true, user: data }
      } else {
        const errorData = await response.json()
        console.error('❌ Registration failed:', errorData)
        
        let errorMessage = 'Registration failed'
        
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map(err => err.msg || err).join(', ')
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
        
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('❌ Registration network error:', error)
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    setIsAuthenticated(false)
    console.log('✅ Logged out successfully')
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}