"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface PitchLocation {
  id: string;
  name: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  facilities?: string[];
  club?: {
    name: string;
  };
}

interface NewPitchData {
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  facilities: string[];
  description?: string;
  contactInfo?: string;
}

interface EnhancedPitchSelectorProps {
  selectedPitches: string[];
  onChange: (pitches: string[]) => void;
  clubId?: string;
  isTournament?: boolean;
  allowCreate?: boolean;
}

export default function EnhancedPitchSelector({
  selectedPitches,
  onChange,
  clubId,
  isTournament = false,
  allowCreate = true,
}: EnhancedPitchSelectorProps) {
  const [pitches, setPitches] = useState<PitchLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingPitch, setCreatingPitch] = useState(false);
  const [newPitch, setNewPitch] = useState<NewPitchData>({
    name: "",
    address: "",
    city: "",
    facilities: [],
    description: "",
    contactInfo: "",
  });

  const commonFacilities = [
    "Full 15-a-side Pitch",
    "Training Pitch",
    "Changing Rooms",
    "Showers",
    "Parking",
    "Floodlights",
    "Spectator Stand",
    "Refreshments",
    "First Aid",
    "Equipment Storage",
  ];

  useEffect(() => {
    const fetchPitches = async () => {
      try {
        const url = clubId
          ? `/api/pitch-locations?clubId=${clubId}`
          : "/api/pitch-locations";

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setPitches(data);
        }
      } catch (error) {
        console.error("Error fetching pitches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPitches();
  }, [clubId]);

  const handlePitchToggle = (pitchId: string) => {
    if (selectedPitches.includes(pitchId)) {
      onChange(selectedPitches.filter((id) => id !== pitchId));
    } else {
      if (isTournament) {
        onChange([...selectedPitches, pitchId]);
      } else {
        onChange([pitchId]);
      }
    }
  };

  const handleCreatePitch = async () => {
    if (!newPitch.name || !newPitch.address || !newPitch.city) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!newPitch.latitude || !newPitch.longitude) {
      toast.error(
        'Please geocode the address first by clicking the "📍 Locate" button'
      );
      return;
    }

    setCreatingPitch(true);
    try {
      const pitchData = {
        ...newPitch,
        clubId: clubId, // Use the clubId from props if available
        // Map facilities array to the expected format
        facilities: newPitch.facilities.join(", "), // Convert array to comma-separated string
        contactInfo: newPitch.contactInfo,
      };

      const response = await fetch("/api/pitch-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pitchData),
      });

      if (response.ok) {
        const createdPitch = await response.json();
        setPitches((prev) => [createdPitch, ...prev]);
        onChange(
          isTournament
            ? [...selectedPitches, createdPitch.id]
            : [createdPitch.id]
        );
        setShowCreateForm(false);
        setNewPitch({
          name: "",
          address: "",
          city: "",
          facilities: [],
          description: "",
          contactInfo: "",
        });
        toast.success("Pitch location created successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create pitch location");
      }
    } catch (error) {
      console.error("Error creating pitch:", error);
      toast.error("Failed to create pitch location");
    } finally {
      setCreatingPitch(false);
    }
  };

  const handleFacilityToggle = (facility: string) => {
    setNewPitch((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const geocodeAddress = async () => {
    if (!newPitch.address || !newPitch.city) return;

    try {
      const query = `${newPitch.address}, ${newPitch.city}`;
      const response = await fetch(
        `/api/clubs/geocode?address=${encodeURIComponent(query)}`
      );

      if (response.ok) {
        const data = await response.json();
        setNewPitch((prev) => ({
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude,
        }));
        toast.success("Address geocoded successfully");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to geocode address");
    }
  };

  const filteredPitches = pitches.filter(
    (pitch) =>
      pitch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pitch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pitch.club?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg mb-3"></div>
        <div className="space-y-2">
          <div className="h-16 bg-gray-100 rounded-lg"></div>
          <div className="h-16 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Create Button */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search pitches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
        />
        {allowCreate && (
          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add New
          </button>
        )}
      </div>

      {/* Create New Pitch Form */}
      {showCreateForm && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Create New Pitch Location
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newPitch.name}
                onChange={(e) =>
                  setNewPitch((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Enter pitch name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newPitch.city}
                onChange={(e) =>
                  setNewPitch((prev) => ({ ...prev, city: e.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Enter city"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPitch.address}
                onChange={(e) =>
                  setNewPitch((prev) => ({ ...prev, address: e.target.value }))
                }
                className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Enter street address"
              />
              <button
                type="button"
                onClick={geocodeAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Locate
              </button>
            </div>
            {newPitch.latitude && newPitch.longitude && (
              <p className="text-xs text-green-600 mt-1">
                Location found: {newPitch.latitude.toFixed(4)},{" "}
                {newPitch.longitude.toFixed(4)}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facilities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonFacilities.map((facility) => (
                <label
                  key={facility}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={newPitch.facilities.includes(facility)}
                    onChange={() => handleFacilityToggle(facility)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{facility}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newPitch.description}
              onChange={(e) =>
                setNewPitch((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              rows={3}
              placeholder="Additional details about the pitch..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreatePitch}
              disabled={
                creatingPitch ||
                !newPitch.name ||
                !newPitch.address ||
                !newPitch.city
              }
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {creatingPitch && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {creatingPitch ? "Creating..." : "Create Pitch"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Pitches List */}
      <div className="max-h-64 overflow-y-auto space-y-2 border-2 border-gray-200 rounded-xl p-3">
        {filteredPitches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">
              {searchTerm
                ? "No pitches found matching your search"
                : "No pitches available"}
            </p>
            {allowCreate && !searchTerm && (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Create the first pitch location
              </button>
            )}
          </div>
        ) : (
          filteredPitches.map((pitch) => (
            <label
              key={pitch.id}
              className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedPitches.includes(pitch.id)
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-gray-50 border-2 border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedPitches.includes(pitch.id)}
                onChange={() => handlePitchToggle(pitch.id)}
                className="mt-1 w-4 h-4 text-primary border-2 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{pitch.name}</div>
                <div className="text-sm text-gray-600">
                  {pitch.city}
                  {pitch.address && ` • ${pitch.address}`}
                </div>
                {pitch.club && (
                  <div className="text-xs text-gray-500 mt-1">
                    {pitch.club.name}
                  </div>
                )}
                {pitch.facilities && pitch.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pitch.facilities.slice(0, 3).map((facility) => (
                      <span
                        key={facility}
                        className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                      >
                        {facility}
                      </span>
                    ))}
                    {pitch.facilities.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{pitch.facilities.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </label>
          ))
        )}
      </div>

      {/* Selection Summary */}
      {selectedPitches.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm font-medium text-green-800">
            {selectedPitches.length} pitch
            {selectedPitches.length !== 1 ? "es" : ""} selected
            {isTournament && " for this tournament"}
          </p>
        </div>
      )}
    </div>
  );
}
