import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { MoodProvider } from './contexts/MoodContext'
import { ToastProvider } from './components/ui/Toast'  // Add this import
import ProtectedRoute from './components/ProtectedRoute'
import OfflineStatus from './components/OfflineStatus'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import ServiceWorkerUpdate from './components/ServiceWorkerUpdate'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import MoodCheck from './pages/MoodCheck'
import Dashboard from './pages/Dashboard'
import CrisisSupport from './pages/CrisisSupport'
import PWASettings from './pages/settings/PWASettings'
import Navigation from './pages/Navigation'

import './App.css'

function App() {
  return (
    <AuthProvider>
      <MoodProvider>
        <ToastProvider>  {/* Add ToastProvider here */}
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* PWA Status Components */}
            <OfflineStatus />
            <ServiceWorkerUpdate />
            
            <Navigation />
            
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/crisis-support" element={<CrisisSupport />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/mood-check" 
                  element={
                    <ProtectedRoute>
                      <MoodCheck />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings/pwa" 
                  element={
                    <ProtectedRoute>
                      <PWASettings />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            
            {/* PWA Install Prompt */}
            <PWAInstallPrompt />
          </div>
        </ToastProvider>  {/* Close ToastProvider here */}
      </MoodProvider>
    </AuthProvider>
  )
}

export default App