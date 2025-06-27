'use client';

import { useState } from 'react';
import { URLS } from '@/lib/constants';

export default function GeocodeClubsButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ total?: number; updated?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGeocode = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(URLS.API.GEOCODE, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to geocode clubs');
      }

      const data = await response.json();
      setResult(data);
      
      // Reload the page after successful geocoding to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleGeocode}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        <span>📍</span>
        <span>{loading ? 'Geocoding...' : 'Geocode Clubs'}</span>
      </button>
      
      {result && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg">
          Successfully geocoded {result.updated} of {result.total} clubs
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          Error: {error}
        </div>
      )}
    </>
  );
}