"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, X } from "lucide-react";
import toast from "react-hot-toast";

interface PitchLocation {
  id: string;
  name: string;
  address?: string | null;
  city: string;
  latitude: number;
  longitude: number;
  club: {
    id: string;
    name: string;
  };
}

interface PitchSelectorProps {
  city: string;
  onPitchSelect: (pitch: PitchLocation | null) => void;
  selectedPitchId?: string;
}

export default function PitchSelector({ city, onPitchSelect, selectedPitchId }: PitchSelectorProps) {
  const [pitches, setPitches] = useState<PitchLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    pitchName: "",
    address: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (city) {
      fetchPitches();
      fetchClubs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const fetchPitches = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pitch-locations?city=${encodeURIComponent(city)}`);
      if (response.ok) {
        const data = await response.json();
        setPitches(data);
      }
    } catch (error) {
      console.error("Error fetching pitches:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const response = await fetch(`/api/clubs?location=${encodeURIComponent(city)}&status=APPROVED`);
      if (response.ok) {
        const data = await response.json();
        setClubs(data.clubs || []);
        if (data.clubs && data.clubs.length > 0) {
          setSelectedClubId(data.clubs[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  const handlePitchSelect = (pitchId: string) => {
    const pitch = pitches.find(p => p.id === pitchId);
    onPitchSelect(pitch || null);
  };

  const handleRequestPitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubId) {
      toast.error("Please select a club");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/pitch-locations/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clubId: selectedClubId,
          pitchName: requestForm.pitchName,
          address: requestForm.address,
          city,
          message: requestForm.message,
        }),
      });

      if (response.ok) {
        toast.success("Pitch request submitted successfully");
        setShowRequestModal(false);
        setRequestForm({ pitchName: "", address: "", message: "" });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting pitch request:", error);
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Training/Event Location
        </label>
        
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : pitches.length > 0 ? (
          <div className="space-y-2">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={selectedPitchId || ""}
              onChange={(e) => handlePitchSelect(e.target.value)}
            >
              <option value="">Select a pitch location</option>
              {pitches.map((pitch) => (
                <option key={pitch.id} value={pitch.id}>
                  {pitch.name} - {pitch.address || pitch.city} ({pitch.club.name})
                </option>
              ))}
            </select>
            
            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Request new pitch location
            </button>
          </div>
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-3">No pitch locations found in {city}</p>
            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="text-primary hover:text-primary-dark font-medium flex items-center gap-1 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Request new pitch location
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Request New Pitch Location</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRequestPitch} className="space-y-4">
                {clubs.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Club
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={selectedClubId}
                      onChange={(e) => setSelectedClubId(e.target.value)}
                      required
                    >
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pitch Name *
                  </label>
                  <input
                    type="text"
                    value={requestForm.pitchName}
                    onChange={(e) => setRequestForm({ ...requestForm, pitchName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Main GAA Pitch"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={requestForm.address}
                    onChange={(e) => setRequestForm({ ...requestForm, address: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Street address (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information
                  </label>
                  <textarea
                    value={requestForm.message}
                    onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Any additional details about the location..."
                  />
                </div>

                <div className="text-sm text-gray-600">
                  Your request will be sent to the club admin for review
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedClubId}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}