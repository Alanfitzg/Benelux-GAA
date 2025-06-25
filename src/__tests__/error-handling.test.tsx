import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, MapErrorBoundary, FormErrorBoundary } from '@/components/ErrorBoundary'
import { PageErrorBoundary, AuthPageErrorBoundary } from '@/components/PageErrorBoundary'
import { ErrorFallback, LoadingErrorFallback, NotFoundErrorFallback } from '@/components/ui/ErrorFallbacks'
// We'll import error handlers dynamically to avoid Next.js dependencies in tests
// import { AppError, ValidationError, handleApiError, withErrorHandler } from '@/lib/error-handlers'
import { clientErrorLogger, ClientErrorLogger, monitoredFetch, measurePerformance } from '@/lib/client-error-logger'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock Next.js
jest.mock('next/link', () => {
  const MockNextLink = ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>
  MockNextLink.displayName = 'MockNextLink'
  return MockNextLink
})

// Mock global Response
global.Response = class Response {
  status: number
  statusText: string
  ok: boolean
  
  constructor(_body?: string, init?: { status?: number; statusText?: string }) {
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.ok = this.status >= 200 && this.status < 300
  }
  
  async json() {
    return {}
  }
} as typeof Response

// Mock window.location for tests
delete (window as { location?: Location }).location
window.location = {
  href: 'http://localhost:3000/test',
  reload: jest.fn(),
} as Location

// Component that throws an error
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('Error Boundaries', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('ErrorBoundary', () => {
    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('renders error UI when there is an error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
      expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument()
    })

    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    it('calls onError callback when error occurs', () => {
      const onError = jest.fn()

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      )
    })

    it('allows retry functionality', () => {
      // Create a component that throws on first render but not on retry
      let throwError = true
      
      function RetryableComponent() {
        if (throwError) {
          throw new Error('Test error')
        }
        return <div>Component recovered</div>
      }

      render(
        <ErrorBoundary>
          <RetryableComponent />
        </ErrorBoundary>
      )

      // Should show error UI
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()

      // Simulate retry by stopping the error and clicking retry
      throwError = false
      const retryButton = screen.getByText('Try Again')
      fireEvent.click(retryButton)

      // After retry, should show recovered component
      expect(screen.getByText('Component recovered')).toBeInTheDocument()
    })
  })

  describe('Specialized Error Boundaries', () => {
    it('renders map-specific error message', () => {
      render(
        <MapErrorBoundary>
          <ThrowError shouldThrow={true} />
        </MapErrorBoundary>
      )

      expect(screen.getByText('Map Loading Error')).toBeInTheDocument()
      expect(screen.getByText(/Unable to load the map/)).toBeInTheDocument()
    })

    it('renders form-specific error message', () => {
      render(
        <FormErrorBoundary>
          <ThrowError shouldThrow={true} />
        </FormErrorBoundary>
      )

      expect(screen.getByText('Form Error')).toBeInTheDocument()
      expect(screen.getByText(/There was an error with this form/)).toBeInTheDocument()
    })
  })

  describe('Page Error Boundaries', () => {
    it('renders page error with custom name', () => {
      render(
        <PageErrorBoundary pageName="Test Page">
          <ThrowError shouldThrow={true} />
        </PageErrorBoundary>
      )

      expect(screen.getByText('Test Page Error')).toBeInTheDocument()
    })

    it('renders auth page error boundary', () => {
      render(
        <AuthPageErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AuthPageErrorBoundary>
      )

      expect(screen.getByText('Authentication Error')).toBeInTheDocument()
    })
  })
})

describe('Error Fallback Components', () => {
  it('renders basic error fallback', () => {
    render(
      <ErrorFallback
        title="Test Error"
        message="Test error message"
      />
    )

    expect(screen.getByText('Test Error')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('renders loading error fallback', () => {
    const onRetry = jest.fn()

    render(
      <LoadingErrorFallback
        onRetry={onRetry}
        resource="clubs"
      />
    )

    expect(screen.getByText('Failed to load clubs')).toBeInTheDocument()
    
    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)
    expect(onRetry).toHaveBeenCalled()
  })

  it('renders not found error fallback', () => {
    render(
      <NotFoundErrorFallback
        resource="club"
        description="This club does not exist"
      />
    )

    expect(screen.getByText('Club Not Found')).toBeInTheDocument()
    expect(screen.getByText('This club does not exist')).toBeInTheDocument()
  })
})

// Note: Error handler tests are skipped in Jest environment due to Next.js dependencies
// These would be tested in integration tests or with proper Next.js test setup

describe('Client Error Logger', () => {
  beforeEach(() => {
    // Clear any existing errors
    clientErrorLogger.clearQueue()
    
    // Mock fetch
    global.fetch = jest.fn()
    
    // Set NODE_ENV to development for console logging
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('logs custom errors', () => {
    const consoleSpy = jest.spyOn(console, 'group').mockImplementation()
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    
    clientErrorLogger.logCustomError('Test error', { context: 'test' })
    
    expect(consoleSpy).toHaveBeenCalledWith('🚨 Client Error [custom]')
    expect(consoleErrorSpy).toHaveBeenCalledWith('Message:', 'Test error')
  })

  it('logs React errors', () => {
    const error = new Error('React error')
    const errorInfo = { componentStack: 'Component stack' }
    
    clientErrorLogger.logReactError(error, errorInfo)
    
    const sessionInfo = clientErrorLogger.getSessionInfo()
    expect(sessionInfo.queuedErrors).toBe(1)
  })

  it('sets user ID', () => {
    clientErrorLogger.setUserId('user123')
    
    const sessionInfo = clientErrorLogger.getSessionInfo()
    expect(sessionInfo.userId).toBe('user123')
  })

  it('generates unique session ID', () => {
    const sessionInfo1 = clientErrorLogger.getSessionInfo()
    const logger2 = new ClientErrorLogger()
    const sessionInfo2 = logger2.getSessionInfo()
    
    expect(sessionInfo1.sessionId).not.toBe(sessionInfo2.sessionId)
  })
})

describe('Network Error Handling', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('handles successful responses', async () => {
    const mockResponse = new Response('success', { status: 200 })
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    const response = await monitoredFetch('/api/test')
    
    expect(response.status).toBe(200)
  })

  it('logs failed HTTP responses', async () => {
    const mockResponse = new Response('error', { status: 404 })
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    const response = await monitoredFetch('/api/test')
    
    expect(response.status).toBe(404)
    // Error should be logged to the queue
    const sessionInfo = clientErrorLogger.getSessionInfo()
    expect(sessionInfo.queuedErrors).toBeGreaterThan(0)
  })

  it('logs network failures', async () => {
    const networkError = new Error('Network error')
    ;(global.fetch as jest.Mock).mockRejectedValue(networkError)

    
    await expect(monitoredFetch('/api/test')).rejects.toThrow('Network error')
    
    // Error should be logged to the queue
    const sessionInfo = clientErrorLogger.getSessionInfo()
    expect(sessionInfo.queuedErrors).toBeGreaterThan(0)
  })
})

describe('Performance Monitoring', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    clientErrorLogger.clearQueue()
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('logs slow operations', () => {
    
    const slowOperation = () => {
      // Simulate slow operation
      jest.advanceTimersByTime(2000)
      return 'result'
    }

    const result = measurePerformance('slow-test', slowOperation)
    
    expect(result).toBe('result')
    // Should log slow operation
    const sessionInfo = clientErrorLogger.getSessionInfo()
    expect(sessionInfo.queuedErrors).toBeGreaterThan(0)
  })

  it('does not log fast operations', () => {
    // Clear queue before test
    clientErrorLogger.clearQueue()
    
    
    const fastOperation = () => {
      jest.advanceTimersByTime(100)
      return 'result'
    }

    const result = measurePerformance('fast-test', fastOperation)
    
    expect(result).toBe('result')
    // Should not log fast operation
    const sessionInfo = clientErrorLogger.getSessionInfo()
    expect(sessionInfo.queuedErrors).toBe(0)
  })
})