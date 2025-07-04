/**
 * Breadcrumb Navigation - Mental Health AI (No Theme Dependencies)
 * Author: Enthusiast-AD
 * Date: 2025-07-04 09:36:55 UTC
 * Fixed to work without ThemeProvider
 */

import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Breadcrumb = ({ className = '', customBreadcrumbs = null }) => {
  const location = useLocation()

  const routeMap = {
    '/': { label: 'Home', emoji: '🏠' },
    '/mood-check': { label: 'Track Mood', emoji: '📝' },
    '/dashboard': { label: 'Dashboard', emoji: '📊' },
    '/crisis-support': { label: 'Crisis Support', emoji: '🆘' },
    '/settings': { label: 'Settings', emoji: '⚙️' },
    '/settings/pwa': { label: 'PWA Settings', emoji: '📱' },
    '/auth': { label: 'Authentication', emoji: '🔐' },
    '/auth/login': { label: 'Sign In', emoji: '🔑' },
    '/auth/register': { label: 'Sign Up', emoji: '✨' }
  }

  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) return customBreadcrumbs

    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ path: '/', ...routeMap['/'] }]

    let currentPath = ''
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`
      if (routeMap[currentPath]) {
        breadcrumbs.push({ path: currentPath, ...routeMap[currentPath] })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  if (breadcrumbs.length <= 1) return null

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <li key={breadcrumb.path} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              
              {isLast ? (
                <span className="flex items-center space-x-1 font-medium text-blue-600">
                  <span>{breadcrumb.emoji}</span>
                  <span>{breadcrumb.label}</span>
                </span>
              ) : (
                <Link
                  to={breadcrumb.path}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                >
                  <span>{breadcrumb.emoji}</span>
                  <span>{breadcrumb.label}</span>
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb