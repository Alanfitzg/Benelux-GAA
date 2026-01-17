"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Edit2, Trash2, Search, Map } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import EnhancedMapPitchCreator from "@/components/pitch/EnhancedMapPitchCreator";

interface PitchLocation {
  id: string;
  name: string;
  address?: string | null;
  city: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  club: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    name?: string | null;
    email: string;
  };
  events?: Array<{ id: string }>;
}

interface PitchRequest {
  id: string;
  pitchName: string;
  address?: string | null;
  city: string;
  message?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    id: string;
    name?: string | null;
    email: string;
  };
}

export default function AdminPitchesPage() {
  const [pitches, setPitches] = useState<PitchLocation[]>([]);
  const [requests, setRequests] = useState<PitchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pitches" | "requests">("pitches");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [showEnhancedCreator, setShowEnhancedCreator] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch pitches
      const pitchesRes = await fetch("/api/pitch-locations");
      if (pitchesRes.ok) {
        const pitchesData = await pitchesRes.json();
        setPitches(pitchesData);

        // Extract unique cities
        const uniqueCities = [
          ...new Set(pitchesData.map((p: PitchLocation) => p.city)),
        ];
        setCities((uniqueCities as string[]).sort());

        // Extract unique clubs
        const clubIds = new Set<string>();
        const uniqueClubs: { id: string; name: string }[] = [];

        pitchesData.forEach((p: PitchLocation) => {
          if (!clubIds.has(p.club.id)) {
            clubIds.add(p.club.id);
            uniqueClubs.push({ id: p.club.id, name: p.club.name });
          }
        });

        setClubs(uniqueClubs.sort((a, b) => a.name.localeCompare(b.name)));
      }

      // Fetch requests
      const requestsRes = await fetch(
        "/api/pitch-locations/request?status=PENDING"
      );
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRequests(requestsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load pitch data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePitch = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pitch location?")) {
      return;
    }

    try {
      const response = await fetch(`/api/pitch-locations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Pitch deleted successfully");
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete pitch");
      }
    } catch (error) {
      console.error("Error deleting pitch:", error);
      toast.error("Failed to delete pitch");
    }
  };

  const filteredPitches = pitches.filter((pitch) => {
    const matchesSearch =
      pitch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pitch.club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pitch.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || pitch.city === selectedCity;
    const matchesClub = !selectedClub || pitch.club.id === selectedClub;

    return matchesSearch && matchesCity && matchesClub;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading pitch data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white">
              Pitch Management
            </h1>
            <p className="text-xs sm:text-base text-gray-300 mt-1 sm:mt-2">
              Manage training pitches and location requests
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowEnhancedCreator(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white text-gray-900 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-1 sm:gap-2 font-medium shadow-lg"
            >
              <Map className="w-3 h-3 sm:w-4 sm:h-4" />
              Find Pitch
            </button>
            <Link
              href="/admin/pitches/create"
              className="hidden sm:flex px-4 py-2 text-sm border border-white text-white rounded-lg hover:bg-white hover:text-gray-900 items-center gap-2 font-medium"
            >
              <Map className="w-4 h-4" />
              Legacy Create
            </Link>
          </div>
        </div>

        {/* Context Explanation */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
            Why Pitch Management Matters
          </h3>
          <div className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
            <p>
              Every event on PlayAway must be linked to a{" "}
              <strong>verifiable location</strong> with accurate GPS
              coordinates. This ensures travelling teams can find venues easily
              and builds trust in our platform.
            </p>
            <p>
              Pitches are added by admins, requested by users, or submitted by
              club administrators. Review and approve locations here to maintain
              a reliable database of GAA venues worldwide.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/20 mb-4 sm:mb-6">
          <nav className="-mb-px flex space-x-4 sm:space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab("pitches")}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === "pitches"
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-white hover:border-gray-400"
              }`}
            >
              Pitches ({pitches.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm relative ${
                activeTab === "requests"
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-white hover:border-gray-400"
              }`}
            >
              Requests
              {requests.length > 0 && (
                <span className="ml-1 sm:ml-2 inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-red-100 text-red-800">
                  {requests.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {activeTab === "pitches" && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="hidden sm:block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="hidden sm:block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="hidden sm:block text-sm font-medium text-gray-700 mb-1">
                    Club
                  </label>
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Clubs</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="hidden sm:flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCity("");
                      setSelectedClub("");
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-600">
                Showing {filteredPitches.length} of {pitches.length} pitches
              </div>
            </div>

            {/* Pitches Grid */}
            <div className="grid gap-4">
              {filteredPitches.map((pitch) => (
                <motion.div
                  key={pitch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{pitch.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {pitch.club.name}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {pitch.address || pitch.city}
                        </p>
                        <p>
                          Coordinates: {pitch.latitude.toFixed(6)},{" "}
                          {pitch.longitude.toFixed(6)}
                        </p>
                        <p>
                          Created by:{" "}
                          {pitch.creator?.name ||
                            pitch.creator?.email ||
                            "Unknown"}
                        </p>
                        <p>
                          Created:{" "}
                          {new Date(pitch.createdAt).toLocaleDateString()}
                        </p>
                        {pitch.events && pitch.events.length > 0 && (
                          <p className="text-green-600">
                            Used by {pitch.events.length} event
                            {pitch.events.length !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/admin/pitches/${pitch.id}/edit`}
                        className="p-2 text-gray-600 hover:text-primary"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeletePitch(pitch.id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                        disabled={pitch.events && pitch.events.length > 0}
                        title={
                          pitch.events && pitch.events.length > 0
                            ? "Cannot delete pitch used by events"
                            : "Delete pitch"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredPitches.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-xl border border-gray-100">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  No pitches found matching your filters
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "requests" && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-xl border border-gray-100">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No pending pitch requests</p>
              </div>
            ) : (
              requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-xl border border-gray-100 p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {request.pitchName}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>City: {request.city}</p>
                        {request.address && <p>Address: {request.address}</p>}
                        <p>
                          Requested by:{" "}
                          {request.user.name || request.user.email}
                        </p>
                        <p>
                          Date:{" "}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        {request.message && (
                          <p className="mt-2 p-2 bg-gray-50 rounded">
                            Message: {request.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {request.status}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Enhanced Map-based Pitch Creator */}
        <EnhancedMapPitchCreator
          isOpen={showEnhancedCreator}
          onClose={() => setShowEnhancedCreator(false)}
          onPitchCreated={() => {
            fetchData();
            setShowEnhancedCreator(false);
          }}
        />
      </div>
    </div>
  );
}
