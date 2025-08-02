export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEventDates(startDate: string, endDate?: string): DateValidationResult {
  // Check if start date is provided
  if (!startDate) {
    return {
      isValid: false,
      error: "Start date is required"
    };
  }

  // Parse dates
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  // Check if start date is valid
  if (isNaN(start.getTime())) {
    return {
      isValid: false,
      error: "Invalid start date format. Please select a valid date."
    };
  }

  // Check if start date is in the past
  if (start < today) {
    return {
      isValid: false,
      error: "Start date cannot be in the past. Please select today or a future date."
    };
  }

  // Check if start date is too far in the future (e.g., more than 2 years)
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
  if (start > twoYearsFromNow) {
    return {
      isValid: false,
      error: "Start date cannot be more than 2 years in the future."
    };
  }

  // If end date is provided, validate it
  if (endDate) {
    const end = new Date(endDate);

    // Check if end date is valid
    if (isNaN(end.getTime())) {
      return {
        isValid: false,
        error: "Invalid end date format. Please select a valid date."
      };
    }

    // Check if end date is before start date
    if (end < start) {
      return {
        isValid: false,
        error: "End date cannot be before the start date."
      };
    }

    // Check if event duration is too long (e.g., more than 30 days)
    const durationInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (durationInDays > 30) {
      return {
        isValid: false,
        error: "Event duration cannot exceed 30 days. Please adjust your dates."
      };
    }
  }

  return { isValid: true };
}

export function formatDateForDisplay(date: string): string {
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-IE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return date;
  }
}