import { NextRequest } from 'next/server'
import { ZodSchema, ZodError } from 'zod'
import { ValidationError } from '@/lib/error-handlers'

// Validation middleware for API routes
export function withValidation<T>(schema: ZodSchema<T>) {
  return function (handler: (validatedData: T, request: NextRequest) => Promise<Response>) {
    return async (request: NextRequest): Promise<Response> => {
      try {
        let data: unknown

        // Handle different content types
        const contentType = request.headers.get('content-type') || ''
        
        if (contentType.includes('application/json')) {
          data = await request.json()
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData()
          data = Object.fromEntries(formData.entries())
        } else if (request.method === 'GET') {
          // For GET requests, validate query parameters
          const url = new URL(request.url)
          data = Object.fromEntries(url.searchParams.entries())
        } else {
          throw new ValidationError('Unsupported content type')
        }

        // Validate the data
        const validatedData = schema.parse(data)
        
        // Call the handler with validated data
        return await handler(validatedData, request)
        
      } catch (error) {
        if (error instanceof ZodError) {
          throw new ValidationError('Validation failed', {
            errors: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          })
        }
        throw error
      }
    }
  }
}

// Query parameter validation
export function validateQuery<T>(request: NextRequest, schema: ZodSchema<T>): T {
  try {
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    return schema.parse(queryParams)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid query parameters', {
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      })
    }
    throw error
  }
}

// Request body validation
export async function validateBody<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid request body', {
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      })
    }
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON in request body')
    }
    throw error
  }
}

// Form data validation
export async function validateFormData<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
  try {
    const formData = await request.formData()
    const data: Record<string, unknown> = {}
    
    // Convert FormData entries to proper format
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        data[key] = {
          name: value.name,
          size: value.size,
          type: value.type,
          lastModified: value.lastModified,
        }
      } else {
        data[key] = value
      }
    }
    
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid form data', {
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      })
    }
    throw error
  }
}

// File validation
export function validateFile(file: File, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) {
  if (!file) {
    throw new ValidationError('No file provided')
  }
  
  if (file.size > maxSize) {
    throw new ValidationError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`)
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError(`File type must be one of: ${allowedTypes.join(', ')}`)
  }
  
  return true
}

// ID validation helper
export function validateId(id: string, fieldName = 'ID'): string {
  if (!id || typeof id !== 'string') {
    throw new ValidationError(`${fieldName} is required`)
  }
  
  // Basic CUID validation (starts with 'c' and is 25 characters long)
  if (!/^c[a-z0-9]{24}$/.test(id)) {
    throw new ValidationError(`Invalid ${fieldName} format`)
  }
  
  return id
}

// Pagination validation
export function validatePagination(page?: string, limit?: string) {
  const pageNum = page ? parseInt(page, 10) : 1
  const limitNum = limit ? parseInt(limit, 10) : 10
  
  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError('Page must be a positive integer')
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new ValidationError('Limit must be between 1 and 100')
  }
  
  return {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
  }
}

// Date validation helpers
export function validateDateRange(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return { startDate: undefined, endDate: undefined }
  
  const start = startDate ? new Date(startDate) : undefined
  const end = endDate ? new Date(endDate) : undefined
  
  if (start && isNaN(start.getTime())) {
    throw new ValidationError('Invalid start date format')
  }
  
  if (end && isNaN(end.getTime())) {
    throw new ValidationError('Invalid end date format')
  }
  
  if (start && end && start >= end) {
    throw new ValidationError('Start date must be before end date')
  }
  
  return { startDate: start, endDate: end }
}

// Email validation (additional to Zod)
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// URL validation (additional to Zod)
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Phone validation (additional to Zod)
export function validatePhone(phone: string): boolean {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Check if it matches international format
  return /^\+?[1-9]\d{1,14}$/.test(cleaned)
}

// Coordinate validation
export function validateCoordinates(lat?: number, lng?: number) {
  if (lat !== undefined && (lat < -90 || lat > 90)) {
    throw new ValidationError('Latitude must be between -90 and 90')
  }
  
  if (lng !== undefined && (lng < -180 || lng > 180)) {
    throw new ValidationError('Longitude must be between -180 and 180')
  }
  
  // If one coordinate is provided, both must be provided
  if ((lat !== undefined && lng === undefined) || (lat === undefined && lng !== undefined)) {
    throw new ValidationError('Both latitude and longitude must be provided together')
  }
  
  return { latitude: lat, longitude: lng }
}

// Search query sanitization
export function sanitizeSearchQuery(query: string): string {
  if (!query) return ''
  
  // Remove special characters that could be used for injection
  return query
    .replace(/[<>\"'%;()&+]/g, '')
    .trim()
    .substring(0, 100) // Limit length
}

// Array validation helper
export function validateArray<T>(
  data: unknown, 
  itemSchema: ZodSchema<T>, 
  minLength = 0, 
  maxLength = 100
): T[] {
  if (!Array.isArray(data)) {
    throw new ValidationError('Expected an array')
  }
  
  if (data.length < minLength) {
    throw new ValidationError(`Array must have at least ${minLength} items`)
  }
  
  if (data.length > maxLength) {
    throw new ValidationError(`Array must have no more than ${maxLength} items`)
  }
  
  try {
    return data.map((item, index) => {
      try {
        return itemSchema.parse(item)
      } catch (error) {
        if (error instanceof ZodError) {
          throw new ValidationError(`Invalid item at index ${index}: ${error.errors[0]?.message}`)
        }
        throw error
      }
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error
    }
    throw new ValidationError('Array validation failed')
  }
}

// File extension validation
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase()
  return extension ? allowedExtensions.includes(extension) : false
}

// Content type validation
export function validateContentType(request: NextRequest, allowedTypes: string[]): boolean {
  const contentType = request.headers.get('content-type')
  if (!contentType) return false
  
  return allowedTypes.some(type => contentType.includes(type))
}

// Authorization header validation
export function validateAuthHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  
  const [type, token] = authHeader.split(' ')
  if (type !== 'Bearer' || !token) {
    throw new ValidationError('Invalid authorization header format')
  }
  
  return token
}

// Rate limiting helper (basic validation)
export function validateRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  // This is a basic validation - in production you'd use Redis or similar
  // For now, just validate the parameters
  if (!identifier || typeof identifier !== 'string') {
    throw new ValidationError('Invalid rate limit identifier')
  }
  
  if (typeof maxRequests !== 'number' || maxRequests < 1) {
    throw new ValidationError('Invalid max requests value')
  }
  
  if (typeof windowMs !== 'number' || windowMs < 1000) {
    throw new ValidationError('Invalid time window value')
  }
  
  return true
}