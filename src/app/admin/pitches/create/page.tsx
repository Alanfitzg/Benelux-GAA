"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Save, ArrowLeft, Map } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface MapboxFeature {
  id: string;
  place_name: string;
  text?: string;
  properties: {
    name?: string;
    category?: string;
    address?: string;
  };
  center: [number, number];
  geometry: {
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface Club {
  id: string;
  name: string;
  location?: string;
}

export default function CreatePitchPage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    address: string;
    city: string;
    coordinates: [number, number];
  } | null>(null);
  const [pitchName, setPitchName] = useState("");
  const [selectedClubId, setSelectedClubId] = useState("");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [saving, setSaving] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    fetchClubs();
    if (!mapContainer.current || map.current) return;

    initializeMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await fetch("/api/clubs?status=APPROVED");
      if (response.ok) {
        const data = await response.json();
        setClubs(data.clubs || []);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  const initializeMap = async () => {
    const mapboxgl = (await import('mapbox-gl')).default;
    
    if (!mapboxgl.supported()) {
      toast.error("Your browser doesn't support Mapbox GL");
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-6.2603, 53.3498], // Dublin, Ireland as default
      zoom: 10,
      attributionControl: false
    });

    // Add attribution control
    map.current.addControl(new mapboxgl.AttributionControl({
      compact: true
    }), 'bottom-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Add click handler to place marker
    map.current.on('click', (e) => {
      const coordinates = [e.lngLat.lng, e.lngLat.lat] as [number, number];
      placeMarker(coordinates);
      
      // Reverse geocode to get location details
      reverseGeocode(coordinates);
    });
  };

  const searchPlaces = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `types=poi&` +
        `category=sports_complex,park,recreation,stadium&` +
        `limit=10`
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    }
  };

  const reverseGeocode = async (coordinates: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `types=poi,address,place&` +
        `limit=1`
      );

      if (!response.ok) throw new Error('Reverse geocoding failed');

      const data = await response.json();
      const feature = data.features?.[0];

      if (feature) {
        const city = extractCityFromFeature(feature);
        setSelectedLocation({
          name: feature.properties?.name || feature.text || 'Custom Location',
          address: feature.place_name,
          city,
          coordinates
        });
        setPitchName(feature.properties?.name || feature.text || '');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setSelectedLocation({
        name: 'Custom Location',
        address: `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`,
        city: 'Unknown',
        coordinates
      });
      setPitchName('');
    }
  };

  const extractCityFromFeature = (feature: MapboxFeature): string => {
    if (feature.context) {
      const place = feature.context.find(ctx => ctx.id.startsWith('place.'));
      if (place) return place.text;
    }
    return feature.properties?.address || 'Unknown';
  };

  const placeMarker = async (coordinates: [number, number]) => {
    if (!map.current) return;

    if (marker.current) {
      marker.current.remove();
    }

    const mapboxgl = (await import('mapbox-gl')).default;
    marker.current = new mapboxgl.Marker({
      color: '#3B82F6',
      draggable: true
    })
      .setLngLat(coordinates)
      .addTo(map.current);

    marker.current.on('dragend', () => {
      const lngLat = marker.current!.getLngLat();
      const newCoordinates = [lngLat.lng, lngLat.lat] as [number, number];
      reverseGeocode(newCoordinates);
    });

    map.current.flyTo({
      center: coordinates,
      zoom: 15,
      duration: 1000
    });
  };

  const handleSearchResultClick = (result: MapboxFeature) => {
    const coordinates = result.center;
    const city = extractCityFromFeature(result);
    
    setSelectedLocation({
      name: result.properties?.name || result.text || result.place_name,
      address: result.place_name,
      city,
      coordinates
    });
    
    setPitchName(result.properties?.name || result.text || '');
    placeMarker(coordinates);
    setSearchResults([]);
    setSearchQuery(result.properties?.name || result.text || '');
  };

  const handleSave = async () => {
    if (!selectedLocation || !pitchName.trim() || !selectedClubId) {
      toast.error('Please select a location, enter a pitch name, and choose a club');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/pitch-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: pitchName.trim(),
          address: selectedLocation.address,
          city: selectedLocation.city,
          latitude: selectedLocation.coordinates[1],
          longitude: selectedLocation.coordinates[0],
          clubId: selectedClubId
        }),
      });

      if (response.ok) {
        toast.success('Pitch location created successfully!');
        router.push('/admin/pitches');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create pitch location');
      }
    } catch (error) {
      console.error('Error creating pitch:', error);
      toast.error('Failed to create pitch location');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/pitches"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pitch Management
          </Link>
          <div className="flex items-center gap-3">
            <Map className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Pitch Location</h1>
              <p className="text-gray-600 mt-1">Search for sports grounds or click on the map to add a new pitch</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[80vh] flex">
          {/* Left Panel */}
          <div className="w-96 p-6 border-r flex flex-col">
            {/* Club Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Club *
              </label>
              <select
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Choose a club...</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>
                    {club.name} {club.location ? `(${club.location})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for Sports Grounds
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchPlaces(e.target.value);
                  }}
                  placeholder="e.g., Croke Park, Phoenix Park..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Results
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-sm">
                        {result.properties?.name || result.text}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {result.place_name}
                      </div>
                      {result.properties?.category && (
                        <div className="text-xs text-blue-600 mt-1">
                          {result.properties.category.replace('_', ' ')}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Location */}
            {selectedLocation && (
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pitch Name *
                  </label>
                  <input
                    type="text"
                    value={pitchName}
                    onChange={(e) => setPitchName(e.target.value)}
                    placeholder="Enter pitch name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Location Details</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Address:</strong> {selectedLocation.address}</p>
                    <p><strong>City:</strong> {selectedLocation.city}</p>
                    <p>
                      <strong>Coordinates:</strong> {selectedLocation.coordinates[1].toFixed(6)}, {selectedLocation.coordinates[0].toFixed(6)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || !pitchName.trim() || !selectedClubId}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Creating...' : 'Create Pitch Location'}
                </button>
              </div>
            )}

            {!selectedLocation && !searchResults.length && (
              <div className="flex-1 flex items-center justify-center text-center text-gray-500">
                <div>
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Search above or click on the map to select a location</p>
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <div ref={mapContainer} className="w-full h-full" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading map...</p>
                </div>
              </div>
            )}
            {mapLoaded && !selectedLocation && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Click anywhere on the map to place a marker
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}