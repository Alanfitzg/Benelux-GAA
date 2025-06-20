import { URLS } from '@/lib/constants';

interface GeocodeResult {
  latitude: number | null;
  longitude: number | null;
}

export async function geocodeLocation(location: string): Promise<GeocodeResult> {
  if (!location) {
    return { latitude: null, longitude: null };
  }

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!mapboxToken) {
    console.error('Mapbox token not configured');
    return { latitude: null, longitude: null };
  }

  try {
    const url = `${URLS.MAPBOX_GEOCODING}/${encodeURIComponent(location)}.json?access_token=${mapboxToken}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error(`Geocoding API error: ${res.status} ${res.statusText}`);
      return { latitude: null, longitude: null };
    }

    const data = await res.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { latitude: lat, longitude: lng };
    }
    
    return { latitude: null, longitude: null };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { latitude: null, longitude: null };
  }
}