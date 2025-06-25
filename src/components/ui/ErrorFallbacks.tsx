"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"

interface ErrorFallbackProps {
  title?: string
  message?: string
  showRetry?: boolean
  showHome?: boolean
  onRetry?: () => void
  className?: string
}

export function ErrorFallback({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  showRetry = true,
  showHome = true,
  onRetry,
  className = "",
}: ErrorFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-red-600"
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

      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        {showRetry && (
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold"
          >
            Try Again
          </button>
        )}
        {showHome && (
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Go Home
          </Link>
        )}
      </div>
    </motion.div>
  )
}

export function LoadingErrorFallback({
  onRetry,
  resource = "data",
}: {
  onRetry?: () => void
  resource?: string
}) {
  return (
    <ErrorFallback
      title={`Failed to load ${resource}`}
      message={`We couldn't load the ${resource}. This might be a temporary issue.`}
      onRetry={onRetry}
      showHome={false}
      className="min-h-[200px]"
    />
  )
}

export function NetworkErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorFallback
      title="Connection Problem"
      message="Please check your internet connection and try again."
      onRetry={onRetry}
      showHome={false}
      className="min-h-[200px]"
    />
  )
}

export function NotFoundErrorFallback({
  resource = "page",
  description,
}: {
  resource?: string
  description?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]"
    >
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8a7.962 7.962 0 01-2 5.291z"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        {resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found
      </h2>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {description || `The ${resource} you're looking for doesn't exist or has been moved.`}
      </p>

      <div className="space-y-3">
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold"
        >
          Go to Homepage
        </Link>
        <div>
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Go back
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function PermissionErrorFallback() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]"
    >
      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zM12 9V7a3 3 0 00-6 0v2"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
      
      <p className="text-gray-600 mb-6 max-w-md">
        You don&apos;t have permission to access this resource. Please contact an administrator if you believe this is an error.
      </p>

      <div className="space-y-3">
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-semibold"
        >
          Go to Homepage
        </Link>
        <div>
          <Link
            href="/contact"
            className="text-primary hover:text-primary-dark text-sm"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export function MaintenanceErrorFallback() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]"
    >
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">Under Maintenance</h2>
      
      <p className="text-gray-600 mb-6 max-w-md">
        We&apos;re currently performing maintenance to improve your experience. 
        Please check back in a few minutes.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
      >
        Check Again
      </button>
    </motion.div>
  )
}

// Skeleton loading components for better UX during errors
export function ClubCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    </div>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}