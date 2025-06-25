"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { clientErrorLogger } from '@/lib/client-error-logger'

export function ErrorLoggerInitializer() {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Initialize error logger
    clientErrorLogger.init()
  }, [])

  useEffect(() => {
    // Set user ID when session is available
    if (status === 'authenticated' && session?.user?.id) {
      clientErrorLogger.setUserId(session.user.id)
    } else if (status === 'unauthenticated') {
      // Clear user ID if user is not authenticated
      clientErrorLogger.setUserId(undefined)
    }
  }, [session, status])

  useEffect(() => {
    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      clientErrorLogger.logCustomError('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise,
      })
    }

    // Global error handler for JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      clientErrorLogger.logCustomError('Global JavaScript error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      })
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  // This component doesn't render anything
  return null
}