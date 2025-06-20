export const MAP_CONFIG = {
  // Default map center (Paris, France)
  DEFAULT_CENTER: {
    longitude: 2.35,
    latitude: 48.86,
  },
  
  // Zoom levels
  DEFAULT_ZOOM: 5,
  SELECTED_ITEM_ZOOM: 8,
  
  // Mapbox configuration
  STYLE: 'mapbox://styles/mapbox/light-v11',
  
  // Marker configuration
  MARKER_ANCHOR: 'bottom' as const,
  POPUP_ANCHOR: 'top' as const,
  
  // Container dimensions
  CONTAINER_HEIGHT: 'h-[80vh]',
  SIDEBAR_WIDTH: 'w-96',
} as const;