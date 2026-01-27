"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import LocationAutocomplete from "@/app/(main)/events/create/LocationAutocomplete";
import Link from "next/link";
import toast from "react-hot-toast";

interface PitchEditPageProps {
  params: Promise<{ id: string }>;
}

export default function PitchEditPage({ params }: PitchEditPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    latitude: 0,
    longitude: 0,
  });
  const [location, setLocation] = useState("");
  const [clubName, setClubName] = useState("");

  useEffect(() => {
    fetchPitch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPitch = async () => {
    try {
      const response = await fetch(`/api/pitch-locations/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name,
          address: data.address || "",
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
        });
        setLocation(data.address || data.city);
        setClubName(data.club.name);
      } else {
        toast.error("Failed to load pitch details");
        router.push("/admin/pitches");
      }
    } catch (error) {
      console.error("Error fetching pitch:", error);
      toast.error("Failed to load pitch details");
      router.push("/admin/pitches");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (locationData: {
    city: string;
    address?: string;
    coordinates: { lat: number; lng: number };
  }) => {
    setFormData({
      ...formData,
      city: locationData.city,
      address: locationData.address || "",
      latitude: locationData.coordinates.lat,
      longitude: locationData.coordinates.lng,
    });
    setLocation(locationData.address || locationData.city);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.city ||
      !formData.latitude ||
      !formData.longitude
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/pitch-locations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Pitch updated successfully");
        router.push("/admin/pitches");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update pitch");
      }
    } catch (error) {
      console.error("Error updating pitch:", error);
      toast.error("Failed to update pitch");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pitch details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/pitches"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pitches
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Pitch Location
          </h1>
          <p className="text-gray-600 mt-2">
            Update pitch details for {clubName}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pitch Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Main Training Pitch"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Location Details
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>City:</strong> {formData.city}
                  </p>
                  {formData.address && (
                    <p>
                      <strong>Address:</strong> {formData.address}
                    </p>
                  )}
                  <p>
                    <strong>Coordinates:</strong> {formData.latitude.toFixed(6)}
                    , {formData.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Link
                href="/admin/pitches"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || !formData.latitude || !formData.longitude}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
