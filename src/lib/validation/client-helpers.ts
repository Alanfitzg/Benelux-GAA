"use client"

import { ZodSchema, ZodError } from 'zod'
import { useErrorNotification } from '@/components/ErrorNotification'

// Client-side validation result interface
export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: Array<{
    path: string
    message: string
    code: string
  }>
}

// Client-side validation function
export function validateClientData<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data)
    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      }
    }
    return {
      success: false,
      errors: [{ path: 'unknown', message: 'Validation failed', code: 'unknown' }],
    }
  }
}

// Form validation hook
export function useFormValidation<T>(schema: ZodSchema<T>) {
  const { showError } = useErrorNotification()

  const validate = (data: unknown): ValidationResult<T> => {
    const result = validateClientData(schema, data)
    
    if (!result.success && result.errors) {
      // Show the first error as a notification
      const firstError = result.errors[0]
      showError({
        type: 'error',
        title: 'Validation Error',
        message: firstError.message,
        duration: 5000,
      })
    }
    
    return result
  }

  const getFieldError = (errors: ValidationResult<T>['errors'], fieldName: string): string | undefined => {
    return errors?.find(error => error.path === fieldName)?.message
  }

  const hasFieldError = (errors: ValidationResult<T>['errors'], fieldName: string): boolean => {
    return errors?.some(error => error.path === fieldName) ?? false
  }

  return {
    validate,
    getFieldError,
    hasFieldError,
  }
}

// Real-time field validation
export function validateField<T>(
  schema: ZodSchema<T>,
  fieldName: string,
  value: unknown,
  fullData?: Partial<T>
): { isValid: boolean; error?: string } {
  try {
    // If we have full data, validate the complete object
    if (fullData) {
      const dataToValidate = { ...fullData, [fieldName]: value }
      schema.parse(dataToValidate)
    } else {
      // For individual field validation, we need to extract the field schema
      // This is a simplified approach - in practice you might want to use shape() for objects
      const fieldSchema = (schema as { shape?: Record<string, { parse?: (value: unknown) => unknown }> }).shape?.[fieldName]
      if (fieldSchema && typeof fieldSchema.parse === 'function') {
        fieldSchema.parse(value)
      }
    }
    
    return { isValid: true }
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldError = error.errors.find(err => 
        err.path.length === 0 || err.path[err.path.length - 1] === fieldName
      )
      return {
        isValid: false,
        error: fieldError?.message || 'Invalid value',
      }
    }
    return {
      isValid: false,
      error: 'Validation failed',
    }
  }
}

// Password strength indicator
export function getPasswordStrength(password: string): {
  score: number
  feedback: string[]
  isValid: boolean
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Use at least 8 characters')
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include lowercase letters')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include uppercase letters')
  }

  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include numbers')
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include special characters')
  }

  return {
    score,
    feedback,
    isValid: score >= 4,
  }
}

// Email validation with detailed feedback
export function validateEmailDetailed(email: string): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []

  if (!email) {
    issues.push('Email is required')
    return { isValid: false, issues }
  }

  if (email.length > 254) {
    issues.push('Email is too long')
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    issues.push('Invalid email format')
  }

  const localPart = email.split('@')[0]
  if (localPart && localPart.length > 64) {
    issues.push('Email username part is too long')
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}

// Username validation with detailed feedback
export function validateUsernameDetailed(username: string): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []

  if (!username) {
    issues.push('Username is required')
    return { isValid: false, issues }
  }

  if (username.length < 3) {
    issues.push('Username must be at least 3 characters')
  }

  if (username.length > 30) {
    issues.push('Username must be no more than 30 characters')
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    issues.push('Username can only contain letters, numbers, underscores, and hyphens')
  }

  if (/^[_-]/.test(username) || /[_-]$/.test(username)) {
    issues.push('Username cannot start or end with underscore or hyphen')
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}

// Phone number formatting and validation
export function formatPhoneNumber(phone: string, countryCode = ''): {
  formatted: string
  isValid: boolean
  error?: string
} {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')

  if (!cleaned) {
    return { formatted: '', isValid: false, error: 'Phone number is required' }
  }

  // Basic validation
  if (!/^\+?[1-9]\d{1,14}$/.test(cleaned)) {
    return { formatted: cleaned, isValid: false, error: 'Invalid phone number format' }
  }

  // Add country code if not present
  let formatted = cleaned
  if (countryCode && !cleaned.startsWith('+')) {
    formatted = `${countryCode}${cleaned}`
  }

  return { formatted, isValid: true }
}

// URL validation and formatting
export function validateUrl(url: string): {
  isValid: boolean
  formatted?: string
  error?: string
} {
  if (!url) {
    return { isValid: true } // URLs are often optional
  }

  try {
    // Add protocol if missing
    let formatted = url
    if (!/^https?:\/\//.test(url)) {
      formatted = `https://${url}`
    }

    new URL(formatted)
    return { isValid: true, formatted }
  } catch {
    return { isValid: false, error: 'Invalid URL format' }
  }
}

// File validation
export function validateFile(
  file: File,
  options: {
    maxSize?: number
    allowedTypes?: string[]
    maxWidth?: number
    maxHeight?: number
  } = {}
): Promise<{ isValid: boolean; errors: string[] }> {
  return new Promise((resolve) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    } = options

    const errors: string[] = []

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`)
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${allowedTypes.join(', ')}`)
    }

    // For images, check dimensions if specified
    if (options.maxWidth || options.maxHeight) {
      if (file.type.startsWith('image/')) {
        const img = new Image()
        img.onload = () => {
          if (options.maxWidth && img.width > options.maxWidth) {
            errors.push(`Image width must be less than ${options.maxWidth}px`)
          }
          if (options.maxHeight && img.height > options.maxHeight) {
            errors.push(`Image height must be less than ${options.maxHeight}px`)
          }
          resolve({ isValid: errors.length === 0, errors })
        }
        img.onerror = () => {
          errors.push('Invalid image file')
          resolve({ isValid: false, errors })
        }
        img.src = URL.createObjectURL(file)
      } else {
        resolve({ isValid: errors.length === 0, errors })
      }
    } else {
      resolve({ isValid: errors.length === 0, errors })
    }
  })
}

// Date validation helpers
export function validateDateRange(startDate: string, endDate?: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!startDate) {
    errors.push('Start date is required')
    return { isValid: false, errors }
  }

  const start = new Date(startDate)
  if (isNaN(start.getTime())) {
    errors.push('Invalid start date')
    return { isValid: false, errors }
  }

  // Check if start date is in the past
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Reset time to compare dates only
  start.setHours(0, 0, 0, 0)
  
  if (start < now) {
    errors.push('Start date cannot be in the past')
  }

  if (endDate) {
    const end = new Date(endDate)
    if (isNaN(end.getTime())) {
      errors.push('Invalid end date')
    } else {
      end.setHours(0, 0, 0, 0)
      if (end <= start) {
        errors.push('End date must be after start date')
      }
    }
  }

  return { isValid: errors.length === 0, errors }
}

// Form data sanitization
export function sanitizeFormData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Trim whitespace and remove potential XSS
      sanitized[key] = value.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    } else {
      sanitized[key] = value
    }
  })

  return sanitized
}

// Debounced validation for real-time feedback
export function createDebouncedValidator<T>(
  schema: ZodSchema<T>,
  delay = 300
): (data: unknown, callback: (result: ValidationResult<T>) => void) => void {
  let timeoutId: NodeJS.Timeout

  return (data: unknown, callback: (result: ValidationResult<T>) => void) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      const result = validateClientData(schema, data)
      callback(result)
    }, delay)
  }
}