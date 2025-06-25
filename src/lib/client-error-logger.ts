"use client"

interface ErrorReport {
  id: string
  timestamp: string
  type: 'javascript' | 'unhandled-rejection' | 'react-error' | 'network' | 'custom'
  message: string
  stack?: string
  url: string
  userAgent: string
  userId?: string
  sessionId: string
  additional?: Record<string, unknown>
}

class ClientErrorLogger {
  private sessionId: string
  private userId?: string
  private errorQueue: ErrorReport[] = []
  private isInitialized = false

  constructor() {
    this.sessionId = this.generateSessionId()
    this.init()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return

    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript',
        message: event.message,
        stack: event.error?.stack,
        additional: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      })
    })

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandled-rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        additional: {
          reason: event.reason,
        },
      })
    })

    // Network errors (you can extend this for specific fetch monitoring)
    this.setupFetchMonitoring()

    this.isInitialized = true
  }

  private setupFetchMonitoring() {
    const originalFetch = window.fetch
    
    window.fetch = async (...args) => {
      const startTime = Date.now()
      
      try {
        const response = await originalFetch(...args)
        
        // Log failed requests
        if (!response.ok) {
          this.logError({
            type: 'network',
            message: `HTTP ${response.status}: ${response.statusText}`,
            additional: {
              url: args[0],
              status: response.status,
              statusText: response.statusText,
              duration: Date.now() - startTime,
              method: args[1]?.method || 'GET',
            },
          })
        }
        
        return response
      } catch (error) {
        // Log network errors
        this.logError({
          type: 'network',
          message: error instanceof Error ? error.message : 'Network request failed',
          stack: error instanceof Error ? error.stack : undefined,
          additional: {
            url: args[0],
            duration: Date.now() - startTime,
            method: args[1]?.method || 'GET',
          },
        })
        throw error
      }
    }
  }

  setUserId(userId: string | undefined) {
    this.userId = userId
  }

  logError(params: {
    type: ErrorReport['type']
    message: string
    stack?: string
    additional?: Record<string, unknown>
  }) {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: params.type,
      message: params.message,
      stack: params.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      additional: params.additional,
    }

    // Add to queue
    this.errorQueue.push(errorReport)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Client Error [${params.type}]`)
      console.error('Message:', params.message)
      if (params.stack) console.error('Stack:', params.stack)
      if (params.additional) console.error('Additional:', params.additional)
      console.groupEnd()
    }

    // Send to server (debounced)
    this.debouncedSendErrors()
  }

  private sendTimeout?: NodeJS.Timeout
  private debouncedSendErrors = () => {
    if (this.sendTimeout) clearTimeout(this.sendTimeout)
    
    this.sendTimeout = setTimeout(() => {
      this.sendErrorsToServer()
    }, 1000) // Batch errors for 1 second
  }

  private async sendErrorsToServer() {
    if (this.errorQueue.length === 0) return

    const errorsToSend = [...this.errorQueue]
    this.errorQueue = []

    try {
      // Only send to server in production or if explicitly enabled
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true') {
        await fetch('/api/errors/client', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ errors: errorsToSend }),
        })
      }
    } catch (error) {
      // If sending fails, put errors back in queue
      this.errorQueue.unshift(...errorsToSend)
      console.error('Failed to send error reports:', error)
    }
  }

  // Manual error logging
  logCustomError(message: string, additional?: Record<string, unknown>) {
    this.logError({
      type: 'custom',
      message,
      additional,
    })
  }

  // React error boundary integration
  logReactError(error: Error, errorInfo: { componentStack: string }) {
    this.logError({
      type: 'react-error',
      message: error.message,
      stack: error.stack,
      additional: {
        componentStack: errorInfo.componentStack,
      },
    })
  }

  // Get current session info for debugging
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      queuedErrors: this.errorQueue.length,
    }
  }

  // Clear error queue (useful for testing)
  clearQueue() {
    this.errorQueue = []
  }
}

// Singleton instance
const clientErrorLogger = new ClientErrorLogger()

// Export both the instance and the class
export { clientErrorLogger, ClientErrorLogger }

// Convenience hooks and utilities
export function useErrorLogger() {
  return {
    logError: (message: string, additional?: Record<string, unknown>) => {
      clientErrorLogger.logCustomError(message, additional)
    },
    logReactError: (error: Error, errorInfo: { componentStack: string }) => {
      clientErrorLogger.logReactError(error, errorInfo)
    },
    setUserId: (userId: string | undefined) => {
      clientErrorLogger.setUserId(userId)
    },
    getSessionInfo: () => clientErrorLogger.getSessionInfo(),
  }
}

// Enhanced fetch wrapper with automatic error logging
export async function monitoredFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const startTime = Date.now()
  
  try {
    const response = await fetch(input, init)
    
    if (!response.ok) {
      clientErrorLogger.logError({
        type: 'network',
        message: `HTTP ${response.status}: ${response.statusText}`,
        additional: {
          url: input.toString(),
          status: response.status,
          statusText: response.statusText,
          duration: Date.now() - startTime,
          method: init?.method || 'GET',
        },
      })
    }
    
    return response
  } catch (error) {
    clientErrorLogger.logError({
      type: 'network',
      message: error instanceof Error ? error.message : 'Network request failed',
      stack: error instanceof Error ? error.stack : undefined,
      additional: {
        url: input.toString(),
        duration: Date.now() - startTime,
        method: init?.method || 'GET',
      },
    })
    throw error
  }
}

// Performance monitoring helpers
export function measurePerformance<T>(
  name: string,
  operation: () => T | Promise<T>
): T | Promise<T> {
  const startTime = Date.now()
  
  try {
    const result = operation()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = Date.now() - startTime
        if (duration > 5000) { // Log slow operations
          clientErrorLogger.logCustomError(`Slow operation: ${name}`, {
            duration,
            type: 'performance',
          })
        }
      })
    } else {
      const duration = Date.now() - startTime
      if (duration > 1000) { // Log slow sync operations
        clientErrorLogger.logCustomError(`Slow synchronous operation: ${name}`, {
          duration,
          type: 'performance',
        })
      }
      return result
    }
  } catch (error) {
    clientErrorLogger.logError({
      type: 'custom',
      message: `Operation failed: ${name}`,
      stack: error instanceof Error ? error.stack : undefined,
      additional: {
        operation: name,
        duration: Date.now() - startTime,
      },
    })
    throw error
  }
}