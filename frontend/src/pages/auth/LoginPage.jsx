import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login(formData)
      
      if (result.success) {
        console.log('✅ Login successful, redirecting...')
        navigate('/dashboard')
      } else {
        // Make sure we're setting a string, not an object
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.detail || 'Login failed'
        setError(errorMessage)
      }
    } catch (err) {
      console.error('❌ Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🧠 Mental Health AI
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
            Sign in to your account
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Access your AI-powered mental health dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Enter your username or email"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-xl mr-2">❌</span>
                <span className="font-medium">
                  {typeof error === 'string' ? error : 'An error occurred'}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-white font-semibold transition-colors ${
              isLoading
                ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link 
                to="/auth/register" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 Demo Credentials
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p><strong>Username:</strong> aitest_user</p>
            <p><strong>Password:</strong> password123</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormData({
                username: 'aitest_user',
                password: 'password123'
              })
            }}
            className="mt-2 text-xs bg-blue-600 dark:bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            Use Demo Credentials
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage