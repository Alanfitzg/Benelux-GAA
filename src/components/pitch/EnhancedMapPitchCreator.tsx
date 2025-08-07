"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Save, X, ChevronRight, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import EnhancedPitchForm, { PitchFormData } from "./EnhancedPitchForm";

interface EnhancedMapPitchCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onPitchCreated: () => void;
  preselectedClubId?: string; // For club admins
}

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

type Step = 'city' | 'pitch' | 'club' | 'details' | 'confirm';

export default function EnhancedMapPitchCreator({ 
  isOpen, 
  onClose, 
  onPitchCreated,
  preselectedClubId 
}: EnhancedMapPitchCreatorProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  // Workflow state
  const [currentStep, setCurrentStep] = useState<Step>('city');
  
  // Step 1: City selection
  const [citySearch, setCitySearch] = useState("");
  const [cityResults, setCityResults] = useState<MapboxFeature[]>([]);
  const [selectedCity, setSelectedCity] = useState<{
    name: string;
    coordinates: [number, number];
  } | null>(null);
  
  // Step 2: Pitch selection
  const [pitchSearch, setPitchSearch] = useState("");
  const [pitchResults, setPitchResults] = useState<MapboxFeature[]>([]);
  const [selectedPitch, setSelectedPitch] = useState<{
    name: string;
    address: string;
    coordinates: [number, number];
    isCustom: boolean;
  } | null>(null);
  const [customPitchName, setCustomPitchName] = useState("");
  
  // Step 3: Club association
  const [availableClubs, setAvailableClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState(preselectedClubId || "");
  const [clubSearch, setClubSearch] = useState("");
  
  // Step 4: Pitch details (optional fields)
  const [pitchDetails, setPitchDetails] = useState<Partial<PitchFormData>>({});
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!isOpen || !mapContainer.current || map.current) return;

    initializeMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (selectedCity && currentStep === 'club') {
      fetchClubsInCity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, currentStep]);

  // Store click handler reference
  const mapClickHandler = useRef<((e: mapboxgl.MapMouseEvent) => void) | null>(null);

  // Update click handler when step changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove previous click handler if it exists
    if (mapClickHandler.current) {
      map.current.off('click', mapClickHandler.current);
    }

    // Only add click handler in pitch step
    if (currentStep === 'pitch') {
      mapClickHandler.current = async (e: mapboxgl.MapMouseEvent) => {
        const coordinates = [e.lngLat.lng, e.lngLat.lat] as [number, number];
        await placeMarker(coordinates);
        
        // Set as custom pitch
        setSelectedPitch({
          name: 'Custom Location',
          address: `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`,
          coordinates,
          isCustom: true
        });
        setCustomPitchName('');
      };
      map.current.on('click', mapClickHandler.current);
    }

    // Cleanup on unmount
    return () => {
      if (map.current && mapClickHandler.current) {
        map.current.off('click', mapClickHandler.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, mapLoaded]);

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
      zoom: 6,
      attributionControl: false
    });

    map.current.addControl(new mapboxgl.AttributionControl({
      compact: true
    }), 'bottom-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });
  };

  const searchCities = async (query: string) => {
    if (!query || query.length < 2) {
      setCityResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `types=place&` +
        `limit=8`
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setCityResults(data.features || []);
    } catch (error) {
      console.error('City search error:', error);
      toast.error('City search failed. Please try again.');
    }
  };

  const searchPitches = async (query: string) => {
    if (!query || query.length < 3 || !selectedCity) {
      setPitchResults([]);
      return;
    }

    try {
      // Search near the selected city
      const proximity = `${selectedCity.coordinates[0]},${selectedCity.coordinates[1]}`;
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `proximity=${proximity}&` +
        `bbox=${selectedCity.coordinates[0] - 0.1},${selectedCity.coordinates[1] - 0.1},${selectedCity.coordinates[0] + 0.1},${selectedCity.coordinates[1] + 0.1}&` +
        `types=poi&` +
        `category=sports_complex,park,recreation,stadium,school&` +
        `limit=10`
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setPitchResults(data.features || []);
    } catch (error) {
      console.error('Pitch search error:', error);
      toast.error('Pitch search failed. Please try again.');
    }
  };

  const fetchClubsInCity = async () => {
    if (!selectedCity) return;

    try {
      const response = await fetch(`/api/clubs?status=APPROVED&city=${encodeURIComponent(selectedCity.name)}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableClubs(data.clubs || []);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  const placeMarker = async (coordinates: [number, number]) => {
    if (!map.current) return;

    if (marker.current) {
      marker.current.remove();
    }

    const mapboxgl = (await import('mapbox-gl')).default;
    marker.current = new mapboxgl.Marker({
      color: '#3B82F6',
      draggable: currentStep === 'pitch'
    })
      .setLngLat(coordinates)
      .addTo(map.current);

    if (currentStep === 'pitch') {
      marker.current.on('dragend', async () => {
        const lngLat = marker.current!.getLngLat();
        const newCoordinates = [lngLat.lng, lngLat.lat] as [number, number];
        
        if (selectedPitch?.isCustom) {
          setSelectedPitch({
            ...selectedPitch,
            coordinates: newCoordinates,
            address: `${newCoordinates[1].toFixed(6)}, ${newCoordinates[0].toFixed(6)}`
          });
        }
      });
    }

    map.current.flyTo({
      center: coordinates,
      zoom: currentStep === 'city' ? 11 : 15,
      duration: 1000
    });
  };

  const handleCitySelect = async (city: MapboxFeature) => {
    setSelectedCity({
      name: city.text || city.place_name,
      coordinates: city.center
    });
    
    await placeMarker(city.center);
    setCityResults([]);
    setCitySearch(city.text || city.place_name);
    setCurrentStep('pitch');
  };

  const handlePitchSelect = async (pitch: MapboxFeature) => {
    const pitchData = {
      name: pitch.properties?.name || pitch.text || pitch.place_name,
      address: pitch.place_name,
      coordinates: pitch.center,
      isCustom: false
    };
    
    setSelectedPitch(pitchData);
    setCustomPitchName(pitchData.name);
    await placeMarker(pitch.center);
    setPitchResults([]);
    setPitchSearch(pitchData.name);
    setCurrentStep('club');
  };

  const handleCustomPitchConfirm = () => {
    if (!customPitchName.trim() || !selectedPitch) {
      toast.error('Please enter a name for the pitch');
      return;
    }

    setSelectedPitch({
      ...selectedPitch,
      name: customPitchName.trim()
    });
    setCurrentStep('club');
  };

  const handlePitchDetailsSubmit = (formData: PitchFormData) => {
    setPitchDetails(formData);
    setCurrentStep('confirm');
  };

  const handleSave = async () => {
    if (!selectedPitch || !selectedClubId || !selectedCity) {
      toast.error('Please complete all steps');
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
          name: selectedPitch.name,
          address: selectedPitch.address,
          city: selectedCity.name,
          latitude: selectedPitch.coordinates[1],
          longitude: selectedPitch.coordinates[0],
          clubId: selectedClubId,
          ...pitchDetails
        }),
      });

      if (response.ok) {
        toast.success('Pitch location created successfully!');
        onPitchCreated();
        handleClose();
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

  const handleClose = () => {
    onClose();
    // Reset all state
    setCurrentStep('city');
    setSelectedCity(null);
    setSelectedPitch(null);
    setSelectedClubId(preselectedClubId || "");
    setPitchDetails({});
    setCitySearch("");
    setPitchSearch("");
    setCustomPitchName("");
    setCityResults([]);
    setPitchResults([]);
    setAvailableClubs([]);
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
    // Remove click handler
    if (map.current && mapClickHandler.current) {
      map.current.off('click', mapClickHandler.current);
      mapClickHandler.current = null;
    }
  };

  const filteredClubs = availableClubs.filter(club =>
    club.name.toLowerCase().includes(clubSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-6xl w-full h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Progress */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-bold">Add Pitch Location</h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <span className={currentStep === 'city' ? 'text-primary font-medium' : ''}>
                1. Select City
              </span>
              <ChevronRight className="w-3 h-3" />
              <span className={currentStep === 'pitch' ? 'text-primary font-medium' : ''}>
                2. Find Pitch
              </span>
              <ChevronRight className="w-3 h-3" />
              <span className={currentStep === 'club' ? 'text-primary font-medium' : ''}>
                3. Associate Club
              </span>
              <ChevronRight className="w-3 h-3" />
              <span className={currentStep === 'details' ? 'text-primary font-medium' : ''}>
                4. Add Details
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Left Panel */}
          <div className="w-80 p-6 border-r flex flex-col">
            <AnimatePresence mode="wait">
              {/* Step 1: City Selection */}
              {currentStep === 'city' && (
                <motion.div
                  key="city"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search for a City
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => {
                          setCitySearch(e.target.value);
                          searchCities(e.target.value);
                        }}
                        placeholder="e.g., Dublin, Cork, London..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {cityResults.length > 0 && (
                    <div className="flex-1 overflow-y-auto">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select City
                      </label>
                      <div className="space-y-1">
                        {cityResults.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleCitySelect(result)}
                            className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                          >
                            <div className="font-medium text-sm">
                              {result.text}
                            </div>
                            <div className="text-xs text-gray-600">
                              {result.place_name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Pitch Selection */}
              {currentStep === 'pitch' && (
                <motion.div
                  key="pitch"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => setCurrentStep('city')}
                        className="text-primary hover:text-primary-dark text-sm"
                      >
                        ← Back to City
                      </button>
                    </div>
                    <h4 className="font-medium text-gray-900">
                      Find Pitch in {selectedCity?.name}
                    </h4>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search for Sports Facilities
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={pitchSearch}
                        onChange={(e) => {
                          setPitchSearch(e.target.value);
                          searchPitches(e.target.value);
                        }}
                        placeholder="e.g., GAA club, sports ground..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {pitchResults.length > 0 && (
                    <div className="flex-1 overflow-y-auto">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Facilities
                      </label>
                      <div className="space-y-1">
                        {pitchResults.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handlePitchSelect(result)}
                            className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                          >
                            <div className="font-medium text-sm">
                              {result.properties?.name || result.text}
                            </div>
                            <div className="text-xs text-gray-600">
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

                  {selectedPitch?.isCustom && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Custom Location Selected</h4>
                      <input
                        type="text"
                        value={customPitchName}
                        onChange={(e) => setCustomPitchName(e.target.value)}
                        placeholder="Enter pitch name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-3"
                      />
                      <button
                        onClick={handleCustomPitchConfirm}
                        disabled={!customPitchName.trim()}
                        className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                      >
                        Confirm Custom Pitch
                      </button>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 text-center">
                      Can&apos;t find the right facility? Click anywhere on the map to create a custom location.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Club Association */}
              {currentStep === 'club' && (
                <motion.div
                  key="club"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-4">
                    <button
                      onClick={() => setCurrentStep('pitch')}
                      className="text-primary hover:text-primary-dark text-sm mb-2"
                    >
                      ← Back to Pitch
                    </button>
                    <h4 className="font-medium text-gray-900">
                      Associate with Club
                    </h4>
                    <p className="text-sm text-gray-600">
                      Selected: {selectedPitch?.name}
                    </p>
                  </div>

                  {!preselectedClubId && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Clubs in {selectedCity?.name}
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={clubSearch}
                          onChange={(e) => setClubSearch(e.target.value)}
                          placeholder="Search clubs..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto">
                    {preselectedClubId ? (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          This pitch will be associated with your club.
                        </p>
                      </div>
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Clubs ({filteredClubs.length})
                        </label>
                        <div className="space-y-1">
                          {filteredClubs.map((club) => (
                            <label
                              key={club.id}
                              className="flex items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-200 cursor-pointer transition-colors"
                            >
                              <input
                                type="radio"
                                name="club"
                                value={club.id}
                                checked={selectedClubId === club.id}
                                onChange={(e) => setSelectedClubId(e.target.value)}
                                className="mr-3"
                              />
                              <div>
                                <div className="font-medium text-sm">{club.name}</div>
                                {club.location && (
                                  <div className="text-xs text-gray-600">{club.location}</div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
                    <button
                      onClick={() => setCurrentStep('details')}
                      disabled={!selectedClubId}
                      className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                      Continue to Details
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !selectedClubId}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      <Save className="w-3 h-3" />
                      {saving ? 'Creating...' : 'Skip Details & Save'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Pitch Details */}
              {currentStep === 'details' && (
                <motion.div
                  key="details"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="flex flex-col h-full overflow-y-auto"
                >
                  <div className="mb-4">
                    <button
                      onClick={() => setCurrentStep('club')}
                      className="text-primary hover:text-primary-dark text-sm mb-2"
                    >
                      ← Back to Club
                    </button>
                    <h4 className="font-medium text-gray-900">
                      Add Pitch Details (Optional)
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Provide additional information about the pitch facilities and features.
                    </p>
                  </div>

                  <div className="flex-1 pr-2">
                    <EnhancedPitchForm
                      initialData={{
                        name: selectedPitch?.name || '',
                        address: selectedPitch?.address || '',
                        city: selectedCity?.name || '',
                        latitude: selectedPitch?.coordinates[1] || 0,
                        longitude: selectedPitch?.coordinates[0] || 0,
                        ...pitchDetails
                      }}
                      onSubmit={handlePitchDetailsSubmit}
                      onCancel={() => setCurrentStep('club')}
                      submitLabel="Continue to Confirm"
                      isSubmitting={false}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 5: Confirmation */}
              {currentStep === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-4">
                    <button
                      onClick={() => setCurrentStep('details')}
                      className="text-primary hover:text-primary-dark text-sm mb-2"
                    >
                      ← Back to Details
                    </button>
                    <h4 className="font-medium text-gray-900">
                      Confirm Pitch Creation
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Review your pitch information before creating.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Basic Information</h5>
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium">Name:</span> {selectedPitch?.name}</div>
                          <div><span className="font-medium">Address:</span> {selectedPitch?.address}</div>
                          <div><span className="font-medium">City:</span> {selectedCity?.name}</div>
                          <div><span className="font-medium">Club:</span> {availableClubs.find(c => c.id === selectedClubId)?.name}</div>
                        </div>
                      </div>

                      {Object.keys(pitchDetails).length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">Additional Details</h5>
                          <div className="text-sm text-gray-600">
                            {Object.keys(pitchDetails).length} additional fields provided
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Creating Pitch...' : 'Create Pitch Location'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
            {mapLoaded && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {currentStep === 'city' && "Search for a city to get started"}
                  {currentStep === 'pitch' && "Search for facilities or click to place a custom marker"}
                  {currentStep === 'club' && "Review your selection and choose a club"}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}