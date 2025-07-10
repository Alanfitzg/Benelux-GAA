import { URLS } from '@/lib/constants';

interface GeocodeResult {
  latitude: number | null;
  longitude: number | null;
}

interface CachedGeocodeResult {
  result: GeocodeResult;
  timestamp: number;
}

// In-memory cache for geocoding results
// TODO: Replace with Redis for production scaling across multiple instances
const geocodeCache = new Map<string, CachedGeocodeResult>();
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days (locations don't change often)

function normalizeLocation(location: string): string {
  return location.toLowerCase().trim().replace(/\s+/g, ' ');
}

function getCachedResult(location: string): GeocodeResult | null {
  const normalized = normalizeLocation(location);
  const cached = geocodeCache.get(normalized);
  
  if (!cached) {
    return null;
  }
  
  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    geocodeCache.delete(normalized);
    return null;
  }
  
  return cached.result;
}

function setCachedResult(location: string, result: GeocodeResult): void {
  const normalized = normalizeLocation(location);
  geocodeCache.set(normalized, {
    result,
    timestamp: Date.now()
  });
}

export async function geocodeLocation(location: string): Promise<GeocodeResult> {
  if (!location) {
    return { latitude: null, longitude: null };
  }

  // Check cache first
  const cachedResult = getCachedResult(location);
  if (cachedResult) {
    console.log(`Geocoding cache hit for: ${location}`);
    return cachedResult;
  }

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!mapboxToken) {
    console.error('Mapbox token not configured');
    return { latitude: null, longitude: null };
  }

  try {
    console.log(`Geocoding API call for: ${location}`);
    const url = `${URLS.MAPBOX_GEOCODING}/${encodeURIComponent(location)}.json?access_token=${mapboxToken}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error(`Geocoding API error: ${res.status} ${res.statusText}`);
      return { latitude: null, longitude: null };
    }

    const data = await res.json();
    
    let result: GeocodeResult;
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      result = { latitude: lat, longitude: lng };
    } else {
      result = { latitude: null, longitude: null };
    }
    
    // Cache the result (even null results to avoid repeated failed lookups)
    setCachedResult(location, result);
    
    return result;
  } catch (error) {
    console.error('Geocoding error:', error);
    return { latitude: null, longitude: null };
  }
}

// Utility function to get cache statistics (useful for monitoring)
export function getGeocodeStats() {
  return {
    cacheSize: geocodeCache.size,
    cacheEntries: Array.from(geocodeCache.keys())
  };
}

// Utility function to clear expired cache entries
export function cleanupGeocodeCache(): number {
  const now = Date.now();
  let removed = 0;
  
  for (const [key, cached] of geocodeCache.entries()) {
    if (now - cached.timestamp > CACHE_TTL) {
      geocodeCache.delete(key);
      removed++;
    }
  }
  
  return removed;
}