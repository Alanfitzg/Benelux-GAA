"use client"

import React, { ReactNode } from "react"
import { ErrorBoundary } from "./ErrorBoundary"
import { motion } from "framer-motion"
import Link from "next/link"

interface PageErrorBoundaryProps {
  children: ReactNode
  pageName?: string
  showHomeButton?: boolean
  customFallback?: ReactNode
}

export function PageErrorBoundary({ 
  children, 
  pageName = "Page",
  showHomeButton = true,
  customFallback 
}: PageErrorBoundaryProps) {
  if (customFallback) {
    return (
      <ErrorBoundary fallback={customFallback}>
        {children}
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-[80vh] bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {pageName} Error
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              We encountered an issue loading this page. This could be due to a temporary problem 
              or an unexpected error. Our team has been notified.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold"
              >
                Reload Page
              </button>
              
              {showHomeButton && (
                <Link
                  href="/"
                  className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Go to Homepage
                </Link>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                If this problem persists, please{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  contact support
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error(`${pageName} Error:`, error, errorInfo)
        // Additional page-specific error handling could go here
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Specialized page error boundaries for different sections

export function AuthPageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <PageErrorBoundary 
      pageName="Authentication"
      showHomeButton={true}
      customFallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zM12 1v6m0 0V1m0 6l4-4M12 7L8 3" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Error
            </h2>
            
            <p className="text-gray-600 mb-6">
              There was an issue with the authentication system. Please try again or return to the homepage.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold"
              >
                Try Again
              </button>
              
              <Link
                href="/"
                className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Go to Homepage
              </Link>
            </div>
          </motion.div>
        </div>
      }
    >
      {children}
    </PageErrorBoundary>
  )
}

export function AdminPageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <PageErrorBoundary 
      pageName="Admin Dashboard"
      showHomeButton={true}
      customFallback={
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border-l-4 border-red-500">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Admin Dashboard Error
            </h2>
            
            <p className="text-gray-600 mb-6 text-sm">
              The admin dashboard encountered an error. Please refresh the page or check your permissions.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                Reload Dashboard
              </button>
              
              <Link
                href="/"
                className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Exit to Homepage
              </Link>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </PageErrorBoundary>
  )
}

export function ClubPageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <PageErrorBoundary 
      pageName="Club"
      showHomeButton={true}
    >
      {children}
    </PageErrorBoundary>
  )
}

export function EventPageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <PageErrorBoundary 
      pageName="Event"
      showHomeButton={true}
    >
      {children}
    </PageErrorBoundary>
  )
}