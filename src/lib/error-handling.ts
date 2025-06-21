import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"

// Error types for better handling
export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  AUTHORIZATION = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT_ERROR",
  RATE_LIMIT = "RATE_LIMIT_ERROR",
  INTERNAL = "INTERNAL_ERROR",
  EXTERNAL_API = "EXTERNAL_API_ERROR",
  DATABASE = "DATABASE_ERROR",
}

export interface AppError {
  type: ErrorType
  message: string
  statusCode: number
  details?: unknown
  timestamp: string
  requestId?: string
}

export class CustomError extends Error {
  public readonly type: ErrorType
  public readonly statusCode: number
  public readonly details?: unknown
  public readonly timestamp: string

  constructor(type: ErrorType, message: string, statusCode: number, details?: unknown) {
    super(message)
    this.type = type
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date().toISOString()
    this.name = "CustomError"
  }
}

// Specific error classes
export class ValidationError extends CustomError {
  constructor(message: string, details?: unknown) {
    super(ErrorType.VALIDATION, message, 400, details)
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = "Authentication required") {
    super(ErrorType.AUTHENTICATION, message, 401)
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = "Insufficient permissions") {
    super(ErrorType.AUTHORIZATION, message, 403)
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string = "Resource") {
    super(ErrorType.NOT_FOUND, `${resource} not found`, 404)
  }
}

export class ConflictError extends CustomError {
  constructor(message: string) {
    super(ErrorType.CONFLICT, message, 409)
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = "Rate limit exceeded") {
    super(ErrorType.RATE_LIMIT, message, 429)
  }
}

export class InternalError extends CustomError {
  constructor(message: string = "Internal server error") {
    super(ErrorType.INTERNAL, message, 500)
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string, details?: unknown) {
    super(ErrorType.DATABASE, message, 500, details)
  }
}

export class ExternalApiError extends CustomError {
  constructor(service: string, message: string, details?: unknown) {
    super(ErrorType.EXTERNAL_API, `${service}: ${message}`, 502, details)
  }
}

// Error handling utility functions
export function handleApiError(error: unknown, context?: string): NextResponse {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error)

  // Handle known custom errors
  if (error instanceof CustomError) {
    return NextResponse.json(
      {
        error: {
          type: error.type,
          message: error.message,
          timestamp: error.timestamp,
          ...(process.env.NODE_ENV === "development" && { details: error.details })
        }
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))

    return NextResponse.json(
      {
        error: {
          type: ErrorType.VALIDATION,
          message: "Validation failed",
          details: validationErrors,
          timestamp: new Date().toISOString()
        }
      },
      { status: 400 }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error)
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: {
          type: ErrorType.VALIDATION,
          message: "Invalid data provided",
          timestamp: new Date().toISOString(),
          ...(process.env.NODE_ENV === "development" && { details: error.message })
        }
      },
      { status: 400 }
    )
  }

  // Handle generic errors
  if (error instanceof Error) {
    const isDevelopment = process.env.NODE_ENV === "development"
    return NextResponse.json(
      {
        error: {
          type: ErrorType.INTERNAL,
          message: isDevelopment ? error.message : "An unexpected error occurred",
          timestamp: new Date().toISOString(),
          ...(isDevelopment && { stack: error.stack })
        }
      },
      { status: 500 }
    )
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: {
        type: ErrorType.INTERNAL,
        message: "An unexpected error occurred",
        timestamp: new Date().toISOString()
      }
    },
    { status: 500 }
  )
}

function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse {
  const timestamp = new Date().toISOString()

  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[] | undefined
      const fieldName = field?.[0] || 'field'
      return NextResponse.json(
        {
          error: {
            type: ErrorType.CONFLICT,
            message: `A record with this ${fieldName} already exists`,
            timestamp,
            field: fieldName
          }
        },
        { status: 409 }
      )

    case 'P2025':
      // Record not found
      return NextResponse.json(
        {
          error: {
            type: ErrorType.NOT_FOUND,
            message: "The requested record was not found",
            timestamp
          }
        },
        { status: 404 }
      )

    case 'P2003':
      // Foreign key constraint violation
      return NextResponse.json(
        {
          error: {
            type: ErrorType.VALIDATION,
            message: "Invalid reference to related record",
            timestamp
          }
        },
        { status: 400 }
      )

    case 'P2014':
      // Required relation violation
      return NextResponse.json(
        {
          error: {
            type: ErrorType.VALIDATION,
            message: "Cannot delete record due to related data",
            timestamp
          }
        },
        { status: 400 }
      )

    default:
      return NextResponse.json(
        {
          error: {
            type: ErrorType.DATABASE,
            message: "Database operation failed",
            timestamp,
            ...(process.env.NODE_ENV === "development" && { 
              code: error.code,
              details: error.message 
            })
          }
        },
        { status: 500 }
      )
  }
}

// Client-side error handling
export function handleClientError(error: unknown, context?: string): string {
  console.error(`Client Error${context ? ` in ${context}` : ''}:`, error)

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message)
  }

  return "An unexpected error occurred"
}

// Error recovery utilities
export function withErrorRecovery<T>(
  operation: () => Promise<T>,
  fallback: T,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise(async (resolve) => {
    let attempts = 0

    const attempt = async (): Promise<void> => {
      try {
        const result = await operation()
        resolve(result)
      } catch (error) {
        attempts++
        console.error(`Operation failed (attempt ${attempts}):`, error)

        if (attempts >= maxRetries) {
          console.error(`Operation failed after ${maxRetries} attempts, using fallback`)
          resolve(fallback)
        } else {
          setTimeout(attempt, delay * attempts) // Exponential backoff
        }
      }
    }

    attempt()
  })
}

// Network error detection
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Network Error') ||
      error.message.includes('fetch') ||
      error.name === 'NetworkError' ||
      error.name === 'TypeError' && error.message.includes('Failed to fetch')
    )
  }
  return false
}

// Error logging for external services
export function logError(error: AppError | Error, context?: Record<string, unknown>): void {
  const errorData = {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  }

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Integration point for services like Sentry, LogRocket, etc.
    console.error('Production error:', errorData)
  } else {
    console.error('Development error:', errorData)
  }
}

// Type guards
export function isAppError(error: unknown): error is AppError {
  return typeof error === 'object' && 
         error !== null && 
         'type' in error && 
         'message' in error && 
         'statusCode' in error
}

export function isValidationError(error: unknown): error is ZodError {
  return error instanceof ZodError
}