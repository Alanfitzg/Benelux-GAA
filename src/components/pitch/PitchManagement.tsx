"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Edit2, Trash2, X, Map } from "lucide-react";
import LocationAutocomplete from "@/app/events/create/LocationAutocomplete";
import MapPitchCreator from "./MapPitchCreator";
import EnhancedMapPitchCreator from "./EnhancedMapPitchCreator";
import toast from "react-hot-toast";

interface PitchLocation {
  id: string;
  name: string;
  address?: string | null;
  city: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  events?: Array<{ id: string }>;
}

interface PitchManagementProps {
  clubId: string;
  canEdit: boolean;
}

export default function PitchManagement({ clubId, canEdit }: PitchManagementProps) {
  const [pitches, setPitches] = useState<PitchLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPitch, setEditingPitch] = useState<PitchLocation | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    latitude: 0,
    longitude: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState("");
  const [showMapCreator, setShowMapCreator] = useState(false);
  const [showEnhancedMapCreator, setShowEnhancedMapCreator] = useState(false);

  useEffect(() => {
    fetchPitches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  const fetchPitches = async () => {
    try {
      const response = await fetch(`/api/pitch-locations?clubId=${clubId}`);
      if (response.ok) {
        const data = await response.json();
        setPitches(data);
      }
    } catch (error) {
      console.error("Error fetching pitches:", error);
      toast.error("Failed to load pitch locations");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: { 
    city: string; 
    address?: string; 
    coordinates: { lat: number; lng: number };
  }) => {
    setFormData({
      ...formData,
      city: location.city,
      address: location.address || "",
      latitude: location.coordinates.lat,
      longitude: location.coordinates.lng,
    });
    setLocation(location.address || location.city);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.city || !formData.latitude || !formData.longitude) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingPitch 
        ? `/api/pitch-locations/${editingPitch.id}`
        : "/api/pitch-locations";
      
      const method = editingPitch ? "PUT" : "POST";
      
      const body = editingPitch 
        ? formData 
        : { ...formData, clubId };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(editingPitch ? "Pitch updated successfully" : "Pitch added successfully");
        setShowModal(false);
        resetForm();
        fetchPitches();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save pitch");
      }
    } catch (error) {
      console.error("Error saving pitch:", error);
      toast.error("Failed to save pitch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pitch location?")) {
      return;
    }

    try {
      const response = await fetch(`/api/pitch-locations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Pitch deleted successfully");
        fetchPitches();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete pitch");
      }
    } catch (error) {
      console.error("Error deleting pitch:", error);
      toast.error("Failed to delete pitch");
    }
  };

  const openEditModal = (pitch: PitchLocation) => {
    setEditingPitch(pitch);
    setFormData({
      name: pitch.name,
      address: pitch.address || "",
      city: pitch.city,
      latitude: pitch.latitude,
      longitude: pitch.longitude,
    });
    setLocation(pitch.address || pitch.city);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      latitude: 0,
      longitude: 0,
    });
    setLocation("");
    setEditingPitch(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Training Pitches</h3>
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowEnhancedMapCreator(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
            >
              <Map className="w-4 h-4" />
              Find Pitch
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Manual
            </button>
          </div>
        )}
      </div>

      {pitches.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No training pitches added yet</p>
          {canEdit && (
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowEnhancedMapCreator(true)}
                className="text-primary hover:text-primary-dark font-medium flex items-center gap-1"
              >
                <Map className="w-4 h-4" />
                Find Pitch
              </button>
              <span className="text-gray-400">or</span>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="text-primary hover:text-primary-dark font-medium"
              >
                Add Manually
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {pitches.map((pitch) => (
            <div
              key={pitch.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{pitch.name}</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {pitch.address || pitch.city}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Coordinates: {pitch.latitude.toFixed(6)}, {pitch.longitude.toFixed(6)}
                  </p>
                  {pitch.events && pitch.events.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Used by {pitch.events.length} event{pitch.events.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(pitch)}
                      className="p-2 text-gray-600 hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pitch.id)}
                      className="p-2 text-gray-600 hover:text-red-600"
                      disabled={pitch.events && pitch.events.length > 0}
                      title={pitch.events && pitch.events.length > 0 ? "Cannot delete pitch used by events" : "Delete pitch"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingPitch ? "Edit Pitch Location" : "Add New Pitch Location"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pitch Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Main Training Pitch"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <LocationAutocomplete
                    onLocationSelect={handleLocationSelect}
                    initialValue={location}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Start typing to search for a location
                  </p>
                </div>

                {formData.latitude && formData.longitude && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>City:</strong> {formData.city}
                    </p>
                    {formData.address && (
                      <p className="text-sm text-gray-600">
                        <strong>Address:</strong> {formData.address}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <strong>Coordinates:</strong> {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.latitude || !formData.longitude}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Saving..." : editingPitch ? "Update Pitch" : "Add Pitch"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Map-based Pitch Creator */}
      <EnhancedMapPitchCreator
        isOpen={showEnhancedMapCreator}
        onClose={() => setShowEnhancedMapCreator(false)}
        preselectedClubId={clubId}
        onPitchCreated={() => {
          fetchPitches();
          setShowEnhancedMapCreator(false);
        }}
      />

      {/* Legacy Map-based Pitch Creator */}
      <MapPitchCreator
        isOpen={showMapCreator}
        onClose={() => setShowMapCreator(false)}
        clubId={clubId}
        onPitchCreated={() => {
          fetchPitches();
          setShowMapCreator(false);
        }}
      />
    </div>
  );
}