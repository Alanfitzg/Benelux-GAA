import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export type ApiError = {
  code: string
  message: string
  details?: unknown
  statusCode: number
}

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: unknown

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

// Global error handler wrapper for API routes
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

// Centralized error handling for API routes
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
  }

  // Handle known error types
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }))

    // Group errors by field for better client-side handling
    const errorsByField = validationErrors.reduce((acc, err) => {
      if (!acc[err.field]) {
        acc[err.field] = []
      }
      acc[err.field].push({
        message: err.message,
        code: err.code,
      })
      return acc
    }, {} as Record<string, Array<{ message: string; code: string }>>)

    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: {
            errors: validationErrors,
            errorsByField,
            totalErrors: validationErrors.length,
          },
        },
      },
      { status: 400 }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: {
              code: 'UNIQUE_CONSTRAINT_ERROR',
              message: 'A record with this data already exists',
              details: error.meta,
            },
          },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          {
            error: {
              code: 'RECORD_NOT_FOUND',
              message: 'The requested record was not found',
            },
          },
          { status: 404 }
        )
      case 'P2003':
        return NextResponse.json(
          {
            error: {
              code: 'FOREIGN_KEY_CONSTRAINT_ERROR',
              message: 'Cannot perform this operation due to related data',
              details: error.meta,
            },
          },
          { status: 400 }
        )
      default:
        return NextResponse.json(
          {
            error: {
              code: 'DATABASE_ERROR',
              message: 'A database error occurred',
              ...(process.env.NODE_ENV === 'development' && { details: error.message }),
            },
          },
          { status: 500 }
        )
    }
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: {
          code: 'DATABASE_VALIDATION_ERROR',
          message: 'Invalid data provided to database',
          ...(process.env.NODE_ENV === 'development' && { details: error.message }),
        },
      },
      { status: 400 }
    )
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'An internal server error occurred',
          ...(process.env.NODE_ENV === 'development' && { details: error.stack }),
        },
      },
      { status: 500 }
    )
  }

  // Fallback for unknown errors
  return NextResponse.json(
    {
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
      },
    },
    { status: 500 }
  )
}

// Error logging utility for production
export function logError(error: unknown, context?: string) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location?.href : undefined,
    userId: undefined, // Add user context if available
  }

  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo)
    return
  }

  // In production, you would send to your error tracking service
  // Examples: Sentry, LogRocket, Datadog, etc.
  try {
    // Example: Send to external service
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorInfo),
    // })
    
    console.error('Production error:', errorInfo)
  } catch (loggingError) {
    console.error('Failed to log error:', loggingError)
  }
}

// Client-side error boundary helper
export function handleClientError(error: Error) {
  logError(error, 'React Error Boundary')
  
  // Additional client-side error handling
  if (typeof window !== 'undefined') {
    // Track error in analytics
    // gtag?.('event', 'exception', {
    //   description: error.message,
    //   fatal: true,
    // })
  }
}

// Network error handler for fetch requests
export async function handleNetworkError(response: Response) {
  if (!response.ok) {
    let errorData: { error?: { message?: string; code?: string; details?: unknown } }
    
    try {
      errorData = await response.json()
    } catch {
      // If response is not JSON, create a generic error
      errorData = {
        error: {
          code: 'NETWORK_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      }
    }

    const error = new AppError(
      errorData.error?.message || 'Network request failed',
      response.status,
      errorData.error?.code || 'NETWORK_ERROR',
      errorData.error?.details
    )

    throw error
  }

  return response
}

// Utility to create consistent error responses
export function createErrorResponse(
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: unknown
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status: statusCode }
  )
}

// Request validation helper
export async function validateRequest<T>(
  request: NextRequest,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid request data', error.errors)
    }
    throw new ValidationError('Invalid JSON in request body')
  }
}

// Rate limiting error helper
export function checkRateLimit(): boolean {
  // Implementation would depend on your rate limiting strategy
  // This is a placeholder for rate limiting logic
  // Parameters would include: identifier, maxRequests, windowMs
  return true
}

// Async error handling utility
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await operation()
  } catch (error) {
    logError(error, 'Safe async operation')
    return fallback
  }
}