import { NextRequest, NextResponse } from 'next/server'

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clear rate limit store on module load in development
if (process.env.NODE_ENV === 'development') {
  rateLimitStore.clear()
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  // Maximum number of requests allowed
  limit: number
  // Time window in milliseconds
  window: number
  // Custom message for rate limit exceeded
  message?: string
  // Skip rate limiting for certain conditions
  skip?: (request: NextRequest) => boolean
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Get client identifier for rate limiting
 * Uses IP address as primary identifier, with fallbacks
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from headers (for proxies/CDNs)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIp) return cfConnectingIp
  if (realIp) return realIp
  if (forwarded) return forwarded.split(',')[0].trim()
  
  // Fallback to a combination of user agent and a general identifier
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `fallback-${userAgent.slice(0, 50)}`
}

/**
 * Core rate limiting function
 */
export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): RateLimitResult => {
    // Skip rate limiting if condition is met
    if (config.skip && config.skip(request)) {
      return {
        success: true,
        limit: config.limit,
        remaining: config.limit,
        resetTime: Date.now() + config.window
      }
    }

    const clientId = getClientId(request)
    const key = `${clientId}:${request.nextUrl.pathname}`
    const now = Date.now()
    const resetTime = now + config.window

    const existing = rateLimitStore.get(key)

    if (!existing || now > existing.resetTime) {
      // First request or window has reset
      rateLimitStore.set(key, { count: 1, resetTime })
      return {
        success: true,
        limit: config.limit,
        remaining: config.limit - 1,
        resetTime
      }
    }

    if (existing.count >= config.limit) {
      // Rate limit exceeded
      return {
        success: false,
        limit: config.limit,
        remaining: 0,
        resetTime: existing.resetTime,
        retryAfter: Math.ceil((existing.resetTime - now) / 1000)
      }
    }

    // Increment count
    existing.count++
    rateLimitStore.set(key, existing)

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - existing.count,
      resetTime: existing.resetTime
    }
  }
}

/**
 * Create rate limit response with proper headers
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  message?: string
): NextResponse {
  const response = NextResponse.json(
    {
      error: {
        type: 'RATE_LIMIT_EXCEEDED',
        message: message || 'Too many requests. Please try again later.',
        retryAfter: result.retryAfter
      }
    },
    { status: 429 }
  )

  // Add standard rate limit headers
  response.headers.set('X-RateLimit-Limit', result.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
  
  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString())
  }

  return response
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 */
export function withRateLimit<T extends unknown[]>(
  config: RateLimitConfig,
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  const limiter = rateLimit(config)

  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const result = limiter(request)

    if (!result.success) {
      return createRateLimitResponse(result, config.message)
    }

    // Add rate limit headers to successful responses
    const response = await handler(request, ...args)
    
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString())

    return response
  }
}

// Predefined rate limit configurations for different types of endpoints

export const RATE_LIMITS = {
  // General API endpoints (clubs, events)
  PUBLIC_API: {
    limit: 100, // 100 requests
    window: 60 * 1000, // per minute
    message: 'Too many API requests. Please wait a moment before trying again.'
  },

  // Authentication endpoints (more restrictive)
  AUTH: {
    limit: 20, // 20 attempts
    window: 60 * 1000, // per minute (changed from 15 minutes to 1 minute for development)
    message: 'Too many authentication attempts. Please wait a moment before trying again.'
  },

  // User registration (very restrictive)
  REGISTRATION: {
    limit: 3, // 3 attempts
    window: 60 * 60 * 1000, // per hour
    message: 'Too many registration attempts. Please wait an hour before trying again.'
  },

  // Admin endpoints (moderate restrictions)
  ADMIN: {
    limit: 200, // 200 requests
    window: 60 * 1000, // per minute
    message: 'Too many admin requests. Please wait a moment before trying again.'
  },

  // File upload endpoints (very restrictive)
  UPLOAD: {
    limit: 10, // 10 uploads
    window: 60 * 1000, // per minute
    message: 'Too many upload attempts. Please wait a minute before trying again.'
  },

  // Contact/interest forms (relaxed for important feature)
  FORMS: {
    limit: 50, // 50 submissions (increased from 10)
    window: 60 * 1000, // per minute (changed from per hour)
    message: 'Too many form submissions. Please wait a moment before submitting again.'
  }
} as const

/**
 * Middleware function for applying rate limits in Next.js middleware
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = rateLimit(config)

  return (request: NextRequest) => {
    const result = limiter(request)

    if (!result.success) {
      return createRateLimitResponse(result, config.message)
    }

    return null // Continue to next middleware/route
  }
}