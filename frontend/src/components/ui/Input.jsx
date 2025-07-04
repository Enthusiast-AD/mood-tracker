/**
 * Mobile-Optimized Input Components - Mental Health AI
 * Author: Enthusiast-AD
 * Date: 2025-07-03 15:51:07 UTC
 * Touch-friendly, accessible inputs with beautiful design
 */

import React, { useState, forwardRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  size = 'md',
  variant = 'default',
  fullWidth = false,
  disabled = false,
  required = false,
  mood = null,
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { moodTheme } = useTheme()

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }

  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    filled: 'bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500',
    outline: 'border-2 border-gray-300 focus:border-blue-500'
  }

  const moodClasses = {
    excellent: 'focus:border-emerald-500 focus:ring-emerald-500',
    good: 'focus:border-cyan-500 focus:ring-cyan-500',
    neutral: 'focus:border-violet-500 focus:ring-violet-500',
    challenging: 'focus:border-amber-500 focus:ring-amber-500',
    difficult: 'focus:border-red-500 focus:ring-red-500'
  }

  const getInputClasses = () => {
    let classes = `
      w-full rounded-lg border transition-all duration-200
      placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-offset-0
      ${sizeClasses[size]}
      ${fullWidth ? 'w-full' : ''}
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
        mood && moodClasses[mood] ? moodClasses[mood] : variantClasses[variant]}
      ${icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''}
      ${type === 'password' ? 'pr-10' : ''}
      ${className}
    `

    if (variant === 'filled') {
      classes += ' bg-gray-50 focus:bg-white'
    }

    return classes
  }

  const handleFocus = (e) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={`
            block text-sm font-medium mb-2 transition-colors duration-200
            ${error ? 'text-red-600' : 
              mood && moodTheme ? `text-${moodTheme}-700` : 'text-gray-700'}
            ${required ? "after:content-['*'] after:text-red-500 after:ml-1" : ''}
          `}
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={getInputClasses()}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}

        {/* Focus Ring Effect */}
        {isFocused && !error && (
          <div className={`
            absolute inset-0 rounded-lg border-2 pointer-events-none
            ${mood && moodClasses[mood] ? 
              `border-${mood}-500` : 'border-blue-500'}
            opacity-20 animate-pulse
          `} />
        )}
      </div>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <p className={`
          mt-2 text-sm
          ${error ? 'text-red-600' : 'text-gray-500'}
        `}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

// Textarea Component
export const Textarea = forwardRef(({
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  rows = 4,
  resize = 'vertical',
  mood = null,
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const { moodTheme } = useTheme()

  const moodClasses = {
    excellent: 'focus:border-emerald-500 focus:ring-emerald-500',
    good: 'focus:border-cyan-500 focus:ring-cyan-500',
    neutral: 'focus:border-violet-500 focus:ring-violet-500',
    challenging: 'focus:border-amber-500 focus:ring-amber-500',
    difficult: 'focus:border-red-500 focus:ring-red-500'
  }

  const inputId = `textarea-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div>
      {label && (
        <label 
          htmlFor={inputId}
          className={`
            block text-sm font-medium mb-2
            ${error ? 'text-red-600' : 
              mood && moodTheme ? `text-${moodTheme}-700` : 'text-gray-700'}
          `}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={rows}
          className={`
            w-full px-4 py-3 border rounded-lg transition-all duration-200
            placeholder-gray-400 focus:outline-none focus:ring-2
            ${resize === 'none' ? 'resize-none' : 
              resize === 'vertical' ? 'resize-y' : 'resize'}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
              mood && moodClasses[mood] ? moodClasses[mood] : 
              'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
            ${className}
          `}
          {...props}
        />

        {/* Character Counter */}
        {props.maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {value?.length || 0}/{props.maxLength}
          </div>
        )}
      </div>

      {(helperText || error) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

// Select Component
export const Select = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  error,
  helperText,
  mood = null,
  className = '',
  ...props
}, ref) => {
  const { moodTheme } = useTheme()

  const moodClasses = {
    excellent: 'focus:border-emerald-500 focus:ring-emerald-500',
    good: 'focus:border-cyan-500 focus:ring-cyan-500',
    neutral: 'focus:border-violet-500 focus:ring-violet-500',
    challenging: 'focus:border-amber-500 focus:ring-amber-500',
    difficult: 'focus:border-red-500 focus:ring-red-500'
  }

  const inputId = `select-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div>
      {label && (
        <label 
          htmlFor={inputId}
          className={`
            block text-sm font-medium mb-2
            ${error ? 'text-red-600' : 
              mood && moodTheme ? `text-${moodTheme}-700` : 'text-gray-700'}
          `}
        >
          {label}
        </label>
      )}

      <select
        ref={ref}
        id={inputId}
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-3 border rounded-lg transition-all duration-200
          bg-white focus:outline-none focus:ring-2 cursor-pointer
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
            mood && moodClasses[mood] ? moodClasses[mood] : 
            'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>

      {(helperText || error) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
Textarea.displayName = 'Textarea'
Select.displayName = 'Select'

export default Input