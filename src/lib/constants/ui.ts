export const UI = {
  // Image dimensions
  IMAGE_SIZES: {
    AVATAR_SM: { width: 32, height: 32 },
    AVATAR_MD: { width: 40, height: 40 },
    AVATAR_LG: { width: 64, height: 64 },
    DETAIL_IMAGE: { width: 300, height: 192 },
  },
  
  // CSS Classes
  CLASSES: {
    AVATAR_SM: 'w-8 h-8',
    AVATAR_MD: 'w-10 h-10',
    AVATAR_LG: 'w-16 h-16',
    MAX_HEIGHT_SM: 'max-h-40',
    MAX_HEIGHT_MD: 'max-h-48',
  },
  
  // Button styles
  BUTTON_STYLES: {
    PRIMARY: 'bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition',
    SECONDARY: 'bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90 transition',
    DANGER: 'px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700',
    INFO: 'px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700',
  },
  
  // Card styles
  CARD_STYLES: {
    DEFAULT: 'bg-white p-4 rounded shadow hover:bg-gray-50',
    IMAGE: 'rounded-lg object-contain bg-white border',
  },
  
  // Grid layouts
  GRID_LAYOUTS: {
    RESPONSIVE: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  
  // Container dimensions
  MIN_HEIGHT_DETAIL: 'min-h-[80vh]',
  
  // Timeouts
  AUTOCOMPLETE_BLUR_TIMEOUT: 100,
  AUTOCOMPLETE_MIN_LENGTH: 2,
} as const;