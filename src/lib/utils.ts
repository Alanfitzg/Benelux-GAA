import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export utility functions
export { hasValidCoordinates, isValidCoordinate, getCoordinates, calculateDistance, formatCoordinates } from "./utils/coordinates"
export { formatShortDate, formatEventDate, formatEventDateRange, isUpcoming, isPast, formatISO } from "./utils/date"
export { geocodeLocation } from "./utils/geocoding"
export { withErrorHandling, parseJsonBody, createErrorResponse, createSuccessResponse, handleApiError, validateRequiredFields } from "./utils/api"