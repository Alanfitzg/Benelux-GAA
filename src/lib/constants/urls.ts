export const URLS = {
  // S3 Bucket URLs
  S3_BUCKET: 'https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com',
  DEFAULT_TOURNAMENT_IMAGE: 'https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/tournament-icon.jpg',
  PLACEHOLDER_CREST: 'https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png',
  
  // API Endpoints
  MAPBOX_GEOCODING: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
  
  // Internal API Routes
  API: {
    CLUBS: '/api/clubs',
    EVENTS: '/api/events',
    INTEREST: '/api/interest',
    UPLOAD: '/api/upload',
    GEOCODE: '/api/clubs/geocode',
  },
} as const;