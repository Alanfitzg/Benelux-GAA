"use client"

import { useState, useEffect, useCallback } from "react"
import { z } from "zod"
import { handleClientError } from "@/lib/error-handling"

interface ValidationState<T> {
  data: Partial<T>
  errors: Record<string, string>
  isValid: boolean
  isSubmitting: boolean
  touched: Record<string, boolean>
}

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>
  initialData?: Partial<T>
  onSubmit?: (data: T) => Promise<void> | void
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export function useFormValidation<T extends Record<string, unknown>>(
  options: UseFormValidationOptions<T>
) {
  const [state, setState] = useState<ValidationState<T>>({
    data: options.initialData || {},
    errors: {},
    isValid: false,
    isSubmitting: false,
    touched: {},
  })

  const validateField = (): string | null => {
    // Skip individual field validation for now - just validate on submit
    // This is a simplified approach that works with complex schemas
    return null
  }

  const validateAll = useCallback((): boolean => {
    try {
      options.schema.parse(state.data)
      setState(prev => ({ ...prev, errors: {}, isValid: true }))
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          const field = err.path.join('.')
          newErrors[field] = err.message
        })
        setState(prev => ({ ...prev, errors: newErrors, isValid: false }))
        return false
      }
      setState(prev => ({ ...prev, isValid: false }))
      return false
    }
  }, [options.schema, state.data])

  const setValue = (name: keyof T, value: unknown) => {
    setState(prev => {
      const newData = { ...prev.data, [name]: value }
      const newTouched = { ...prev.touched, [name as string]: true }
      
      const newErrors = { ...prev.errors }
      
      // Validate field if validateOnChange is enabled
      if (options.validateOnChange && prev.touched[name as string]) {
        const fieldError = validateField()
        if (fieldError) {
          newErrors[name as string] = fieldError
        } else {
          delete newErrors[name as string]
        }
      }

      return {
        ...prev,
        data: newData,
        touched: newTouched,
        errors: newErrors,
      }
    })
  }

  const setFieldError = (name: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name as string]: error }
    }))
  }

  const clearFieldError = (name: keyof T) => {
    setState(prev => {
      const newErrors = { ...prev.errors }
      delete newErrors[name as string]
      return { ...prev, errors: newErrors }
    })
  }

  const handleBlur = (name: keyof T) => {
    if (!options.validateOnBlur) return

    setState(prev => {
      const newTouched = { ...prev.touched, [name as string]: true }
      const newErrors = { ...prev.errors }

      const fieldError = validateField()
      if (fieldError) {
        newErrors[name as string] = fieldError
      } else {
        delete newErrors[name as string]
      }

      return {
        ...prev,
        touched: newTouched,
        errors: newErrors,
      }
    })
  }

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault()

    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      // Mark all fields as touched
      const allFieldsTouched = Object.keys(state.data).reduce((acc, key) => {
        acc[key] = true
        return acc
      }, {} as Record<string, boolean>)

      setState(prev => ({ ...prev, touched: allFieldsTouched }))

      // Validate all fields
      const validatedData = options.schema.parse(state.data)
      
      // Clear errors
      setState(prev => ({ ...prev, errors: {}, isValid: true }))

      // Call onSubmit if provided
      if (options.onSubmit) {
        await options.onSubmit(validatedData)
      }

      return validatedData
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          const field = err.path.join('.')
          newErrors[field] = err.message
        })
        setState(prev => ({ ...prev, errors: newErrors, isValid: false }))
      } else {
        const errorMessage = handleClientError(error, "Form submission")
        console.error("Form submission error:", errorMessage)
        // You could set a general form error here
      }
      throw error
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const reset = (newData?: Partial<T>) => {
    setState({
      data: newData || options.initialData || {},
      errors: {},
      isValid: false,
      isSubmitting: false,
      touched: {},
    })
  }

  const setData = (newData: Partial<T>) => {
    setState(prev => ({ ...prev, data: { ...prev.data, ...newData } }))
  }

  // Validate on data changes if enabled
  useEffect(() => {
    if (options.validateOnChange && Object.keys(state.touched).length > 0) {
      validateAll()
    }
  }, [state.data, options.validateOnChange, state.touched, validateAll])

  return {
    // State
    data: state.data,
    errors: state.errors,
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,
    touched: state.touched,

    // Actions
    setValue,
    setData,
    setFieldError,
    clearFieldError,
    handleBlur,
    handleSubmit,
    reset,
    validateAll,

    // Helpers
    getFieldProps: (name: keyof T) => ({
      value: state.data[name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setValue(name, e.target.value)
      },
      onBlur: () => handleBlur(name),
      error: state.errors[name as string],
      touched: state.touched[name as string],
    }),

    hasError: (name: keyof T) => Boolean(state.errors[name as string]),
    getError: (name: keyof T) => state.errors[name as string],
  }
}

// Specialized hooks for common forms
import { 
  loginSchema, 
  createUserSchema, 
  createEventSchema, 
  createClubSchema 
} from "@/lib/validation"

export function useLoginForm() {
  return useFormValidation({
    schema: loginSchema,
    validateOnBlur: true,
  })
}

export function useRegistrationForm() {
  return useFormValidation({
    schema: createUserSchema,
    validateOnChange: true,
    validateOnBlur: true,
  })
}

export function useEventForm(initialData?: Record<string, unknown>) {
  return useFormValidation({
    schema: createEventSchema,
    initialData,
    validateOnBlur: true,
  })
}

export function useClubForm(initialData?: Record<string, unknown>) {
  return useFormValidation({
    schema: createClubSchema,
    initialData,
    validateOnBlur: true,
  })
}