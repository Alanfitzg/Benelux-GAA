import { useState, useEffect } from 'react';

export function extractCityFromLocation(location: string): string {
  const parts = location.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    return parts[0].toLowerCase();
  }
  
  return location.toLowerCase();
}

export function useCityDefaultImage(location: string | null | undefined) {
  const [cityImage, setCityImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location) {
      setCityImage(null);
      return;
    }

    const fetchCityImage = async () => {
      setLoading(true);
      try {
        const city = extractCityFromLocation(location);
        const response = await fetch(`/api/city-images/${encodeURIComponent(city)}`);
        
        if (response.ok) {
          const data = await response.json();
          setCityImage(data.imageUrl);
        }
      } catch (error) {
        console.error('Error fetching city default image:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCityImage();
  }, [location]);

  return { cityImage, loading };
}