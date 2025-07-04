/**
 * Error States & Empty States - Mental Health AI
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:51:07 UTC
 * Beautiful error handling and empty state components
 */

import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import Button from './Button'

// Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="Something went wrong"
          message="We encountered an unexpected error. Please try refreshing the page."
          type="error"
          actionButton={{
            label: 'Refresh Page',
            onClick: () => window.location.reload()
          }}
          details={this.props.showDetails ? this.state.error?.toString() : null}
        />
      )
    }

    return this.props.children
  }
}

// Generic Error State Component
export const ErrorState = ({
  type = 'error',
  title,
  message,
  icon,
  actionButton,
  secondaryButton,
  details,
  mood = null,
  className = ''
}) => {
  const { moodTheme } = useTheme()

  const errorTypes = {
    error: {
      icon: '❌',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-200'
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200'
    },
    network: {
      icon: '📡',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200'
    },
    permission: {
      icon: '🔒',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-200'
    }
  }

  const config = errorTypes[type] || errorTypes.error

  return (
    <div className={`
      max-w-lg mx-auto text-center p-8 rounded-lg border
      ${config.bgColor} ${config.borderColor}
      ${className}
    `}>
      <div className="text-6xl mb-4">
        {icon || config.icon}
      </div>
      
      <h3 className={`text-xl font-semibold mb-2 ${config.textColor}`}>
        {title}
      </h3>
      
      <p className={`mb-6 ${config.textColor} opacity-80`}>
        {message}
      </p>

      {(actionButton || secondaryButton) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actionButton && (
            <Button
              variant={type === 'error' ? 'danger' : 'primary'}
              onClick={actionButton.onClick}
              mood={mood}
            >
              {actionButton.label}
            </Button>
          )}
          {secondaryButton && (
            <Button
              variant="outline"
              onClick={secondaryButton.onClick}
            >
              {secondaryButton.label}
            </Button>
          )}
        </div>
      )}

      {details && (
        <details className="mt-6 text-left">
          <summary className={`cursor-pointer text-sm ${config.textColor} opacity-60 hover:opacity-100`}>
            Technical Details
          </summary>
          <pre className="mt-2 text-xs bg-white/50 p-3 rounded border overflow-auto">
            {details}
          </pre>
        </details>
      )}
    </div>
  )
}

// Empty State Component
export const EmptyState = ({
  title,
  message,
  icon,
  actionButton,
  secondaryButton,
  illustration,
  mood = null,
  className = ''
}) => {
  const { moodTheme } = useTheme()

  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {illustration ? (
        <div className="mb-6">
          {illustration}
        </div>
      ) : (
        <div className="text-8xl mb-6 opacity-50">
          {icon || '📝'}
        </div>
      )}
      
      <h3 className={`
        text-2xl font-semibold mb-3
        ${moodTheme ? `text-${moodTheme}-800` : 'text-gray-900'}
      `}>
        {title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {message}
      </p>

      {(actionButton || secondaryButton) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actionButton && (
            <Button
              variant="primary"
              onClick={actionButton.onClick}
              mood={mood}
              icon={actionButton.icon}
            >
              {actionButton.label}
            </Button>
          )}
          {secondaryButton && (
            <Button
              variant="outline"
              onClick={secondaryButton.onClick}
            >
              {secondaryButton.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Specific Empty States
export const NoMoodDataState = ({ onStartTracking }) => (
  <EmptyState
    icon="📊"
    title="No mood data yet"
    message="Start tracking your moods to see beautiful insights and analytics about your mental health journey."
    actionButton={{
      label: 'Track Your First Mood',
      onClick: onStartTracking,
      icon: '📝'
    }}
  />
)

export const NoInternetState = ({ onRetry }) => (
  <ErrorState
    type="network"
    title="No Internet Connection"
    message="Please check your internet connection and try again. Your data is safely stored offline."
    actionButton={{
      label: 'Try Again',
      onClick: onRetry
    }}
  />
)

export const LoadingErrorState = ({ onRetry, error }) => (
  <ErrorState
    type="error"
    title="Failed to Load Data"
    message="We couldn't load your data right now. This might be a temporary issue."
    actionButton={{
      label: 'Retry',
      onClick: onRetry
    }}
    secondaryButton={{
      label: 'Go Back',
      onClick: () => window.history.back()
    }}
    details={error?.message}
  />
)

export const PermissionDeniedState = ({ onRequestPermission, feature }) => (
  <ErrorState
    type="permission"
    title={`${feature} Permission Required`}
    message={`To use this feature, please grant ${feature.toLowerCase()} permission in your browser settings.`}
    actionButton={{
      label: 'Grant Permission',
      onClick: onRequestPermission
    }}
  />
)

// Crisis State (Special handling)
export const CrisisState = ({ onGetHelp, onDismiss }) => {
  const { moodTheme } = useTheme()

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-6xl mb-4">🆘</div>
      <h3 className="text-xl font-semibold text-red-800 mb-3">
        Crisis Support Available
      </h3>
      <p className="text-red-700 mb-6">
        We noticed you might be going through a difficult time. 
        Remember that you're not alone and help is available 24/7.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="danger"
          onClick={onGetHelp}
          className="font-semibold"
        >
          🆘 Get Help Now
        </Button>
        <Button
          variant="outline"
          onClick={onDismiss}
          className="text-gray-600"
        >
          I'm Safe
        </Button>
      </div>
      
      <div className="mt-4 text-sm text-red-600">
        <p>Crisis Hotline: <a href="tel:988" className="font-semibold underline">988</a></p>
      </div>
    </div>
  )
}