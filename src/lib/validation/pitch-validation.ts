// Pitch location validation utilities

interface PitchValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

interface PitchData {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  
  // Optional fields that need validation if provided
  numberOfPitches?: number | null;
  maxPlayerCapacity?: number | null;
  maxSpectatorCapacity?: number | null;
  tournamentCapacity?: number | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export function validatePitchData(data: PitchData): PitchValidationResult {
  const errors: Record<string, string> = {};

  // Required fields
  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Pitch name is required";
  } else if (data.name.trim().length > 100) {
    errors.name = "Pitch name must be less than 100 characters";
  }

  if (!data.city || data.city.trim().length === 0) {
    errors.city = "City is required";
  }

  if (!data.latitude || isNaN(data.latitude)) {
    errors.latitude = "Valid latitude is required";
  } else if (data.latitude < -90 || data.latitude > 90) {
    errors.latitude = "Latitude must be between -90 and 90";
  }

  if (!data.longitude || isNaN(data.longitude)) {
    errors.longitude = "Valid longitude is required";
  } else if (data.longitude < -180 || data.longitude > 180) {
    errors.longitude = "Longitude must be between -180 and 180";
  }

  // Optional numeric field validations
  if (data.numberOfPitches !== null && data.numberOfPitches !== undefined) {
    if (data.numberOfPitches < 1) {
      errors.numberOfPitches = "Number of pitches must be at least 1";
    } else if (data.numberOfPitches > 20) {
      errors.numberOfPitches = "Number of pitches must be 20 or less";
    }
  }

  if (data.maxPlayerCapacity !== null && data.maxPlayerCapacity !== undefined) {
    if (data.maxPlayerCapacity < 1) {
      errors.maxPlayerCapacity = "Player capacity must be at least 1";
    } else if (data.maxPlayerCapacity > 1000) {
      errors.maxPlayerCapacity = "Player capacity must be 1000 or less";
    }
  }

  if (data.maxSpectatorCapacity !== null && data.maxSpectatorCapacity !== undefined) {
    if (data.maxSpectatorCapacity < 1) {
      errors.maxSpectatorCapacity = "Spectator capacity must be at least 1";
    } else if (data.maxSpectatorCapacity > 100000) {
      errors.maxSpectatorCapacity = "Spectator capacity must be 100,000 or less";
    }
  }

  if (data.tournamentCapacity !== null && data.tournamentCapacity !== undefined) {
    if (data.tournamentCapacity < 2) {
      errors.tournamentCapacity = "Tournament capacity must be at least 2 teams";
    } else if (data.tournamentCapacity > 64) {
      errors.tournamentCapacity = "Tournament capacity must be 64 teams or less";
    }
  }

  // Contact information validation
  if (data.contactEmail && data.contactEmail.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contactEmail)) {
      errors.contactEmail = "Please enter a valid email address";
    }
  }

  if (data.contactPhone && data.contactPhone.trim().length > 0) {
    // Basic phone validation - allow various international formats
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
    if (!phoneRegex.test(data.contactPhone.replace(/\s/g, ''))) {
      errors.contactPhone = "Please enter a valid phone number";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Validation for text fields with length limits
export function validateTextField(value: string | null | undefined, fieldName: string, maxLength: number = 500): string | null {
  if (!value) return null;
  
  if (value.trim().length > maxLength) {
    return `${fieldName} must be ${maxLength} characters or less`;
  }
  
  return null;
}

// Helper to validate all text fields at once
export function validateAllTextFields(data: Record<string, string | null | undefined>): Record<string, string> {
  const errors: Record<string, string> = {};
  const textFieldLimits = {
    changingRooms: 300,
    spectatorFacilities: 300,
    parking: 300,
    otherAmenities: 500,
    seasonalAvailability: 300,
    bookingSystem: 500,
    bookingLeadTime: 200,
    equipmentProvided: 300,
    customDirections: 1000,
    previousEvents: 1000,
    contactName: 100,
  };

  for (const [field, limit] of Object.entries(textFieldLimits)) {
    const error = validateTextField(data[field], field, limit);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

// Complete validation function that combines all validations
export function validateCompletePitchData(data: Record<string, unknown>): PitchValidationResult {
  const basicValidation = validatePitchData(data as unknown as PitchData);
  const textFieldErrors = validateAllTextFields(data as Record<string, string | null | undefined>);
  
  const allErrors = { ...basicValidation.errors, ...textFieldErrors };
  
  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors
  };
}