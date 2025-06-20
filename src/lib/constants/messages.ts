export const MESSAGES = {
  // Loading states
  LOADING: {
    EVENTS: 'Loading events...',
    TEAMS: 'Loading teams...',
    CLUBS: 'Loading clubs...',
  },
  
  // Empty states
  EMPTY: {
    EVENTS: 'No events found.',
    TEAMS: 'No teams found.',
    CLUBS: 'No clubs found.',
  },
  
  // Default values
  DEFAULTS: {
    LOCATION: 'Location not specified',
    REGION: 'Region not specified',
    PLACEHOLDER: '-',
    LOCATION_PLACEHOLDER: 'City, Country',
  },
  
  // Button texts
  BUTTONS: {
    VIEW_DETAILS: 'View Details',
    VIEW_ALL_EVENTS: 'View All Events',
    REGISTER_INTEREST: 'Register Interest',
    SUBMIT: 'Submit',
    BACK_TO_CLUBS: 'Back to Clubs',
    BACK_TO_EVENTS: 'Back to Events',
    DELETE: 'Delete',
    EDIT: 'Edit',
    SAVE: 'Save',
    CANCEL: 'Cancel',
  },
  
  // Form labels
  FORM: {
    NAME: 'Name',
    EMAIL: 'Email',
    MESSAGE: 'Message (Optional)',
    PHONE: 'Phone',
    CLUB: 'Club',
  },
  
  // Success messages
  SUCCESS: {
    INTEREST_EXPRESSED: 'Interest expressed successfully!',
    CLUBS_UPDATED: 'Clubs updated successfully',
    EVENT_CREATED: 'Event created successfully',
    EVENT_UPDATED: 'Event updated successfully',
    EVENT_DELETED: 'Event deleted successfully',
    CLUB_CREATED: 'Club created successfully',
    CLUB_UPDATED: 'Club updated successfully',
    CLUB_DELETED: 'Club deleted successfully',
  },
  
  // Error messages
  ERROR: {
    INTEREST_FAILED: 'Failed to express interest',
    UPLOAD_FAILED: 'Upload failed',
    NO_FILE_UPLOADED: 'No file uploaded',
    CLUBS_UPDATE_FAILED: 'Failed to update clubs',
    CLUB_NOT_FOUND: 'Club not found.',
    EVENT_NOT_FOUND: 'Event not found.',
    GENERIC: 'An error occurred. Please try again.',
  },
  
  // Confirmation messages
  CONFIRM: {
    DELETE_CLUB: 'Are you sure you want to delete this club?',
    DELETE_EVENT: 'Are you sure you want to delete this event?',
  },
} as const;