"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import LocationAutocomplete from "./LocationAutocomplete";
import ImageUpload from "../../components/ImageUpload";
import ClubSelectorOptional from "@/components/ClubSelectorOptional";
import type { Event } from "@/types";
import { EVENT_TYPES } from "@/lib/constants/events";
import { TEAM_TYPES } from "@/lib/constants/teams";
import { URLS, MESSAGES } from "@/lib/constants";

type EventFormData = Omit<Event, "id" | "club"> & { 
  clubId?: string;
  acceptedTeamTypes?: string[];
};

export const dynamic = "force-dynamic";

export default function CreateEvent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [isIndependentEvent, setIsIndependentEvent] = useState<boolean>(false);
  
  // Tournament-specific state
  const [eventType, setEventType] = useState<string>("");
  const [minTeams, setMinTeams] = useState<number | undefined>();
  const [maxTeams, setMaxTeams] = useState<number | undefined>();
  const [acceptedTeamTypes, setAcceptedTeamTypes] = useState<string[]>([]);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/signin');
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the form if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setUploading(false);
    setImageUrl(null);
    const form = event.currentTarget;
    const file = imageFile;
    let uploadedImageUrl = "";
    
    if (file && file.size > 0) {
      setUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadRes = await fetch(URLS.API.UPLOAD, {
        method: "POST",
        body: uploadData,
      });
      setUploading(false);
      if (!uploadRes.ok) {
        setError(MESSAGES.ERROR.UPLOAD_FAILED);
        return;
      }
      const uploadJson = await uploadRes.json();
      uploadedImageUrl = uploadJson.url;
      setImageUrl(uploadedImageUrl);
    }
    
    // Club is now optional - no validation needed

    const data: EventFormData = {
      title: (form.elements.namedItem("title") as HTMLInputElement)?.value || "",
      eventType: eventType,
      location,
      startDate: (form.elements.namedItem("startDate") as HTMLInputElement)?.value || "",
      endDate: (form.elements.namedItem("endDate") as HTMLInputElement)?.value || undefined,
      cost: parseFloat((form.elements.namedItem("cost") as HTMLInputElement)?.value) || undefined,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement)?.value || undefined,
      imageUrl: uploadedImageUrl || undefined,
      clubId: isIndependentEvent ? undefined : selectedClubId || undefined,
      // Tournament-specific fields
      ...(eventType === "Tournament" && {
        minTeams: minTeams || undefined,
        maxTeams: maxTeams || undefined,
        acceptedTeamTypes: acceptedTeamTypes.length > 0 ? acceptedTeamTypes : undefined,
      }),
    };
    
    console.log('Submitting event data:', JSON.stringify(data, null, 2));
    
    const response = await fetch(URLS.API.EVENTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      router.push("/events");
    } else {
      console.error('Failed to create event:', response.status, response.statusText);
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
        setError(errorData.error || MESSAGES.ERROR.GENERIC);
      } catch {
        console.error('Could not parse error response');
        setError(MESSAGES.ERROR.GENERIC);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-light to-secondary text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              Create Your Event
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Share your Gaelic event with the global community and connect with passionate players worldwide.
            </p>
          </motion.div>
        </div>
        {/* Animated background shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Form Section */}
      <div className="relative -mt-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-professional-lg border border-gray-200/50 overflow-hidden">
            <div className="p-8 md:p-12">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center space-x-3"
                >
                  <span className="text-red-500">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Event Type */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-1"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Event Type
                    </label>
                    <select
                      name="eventType"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 text-sm font-medium"
                      required
                    >
                      <option value="" disabled>
                        Select Event Type
                      </option>
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Event Title */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-1"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Event Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter event title"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                      required
                    />
                  </motion.div>

                  {/* Location */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Location
                    </label>
                    <LocationAutocomplete value={location} onChange={setLocation} />
                  </motion.div>

                  {/* Start Date */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                      required
                    />
                  </motion.div>

                  {/* End Date */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      End Date <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                    />
                  </motion.div>

                  {/* Cost */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Cost <span className="text-gray-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">€</span>
                      <input
                        type="number"
                        name="cost"
                        placeholder="0.00"
                        step="0.01"
                        className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                      />
                    </div>
                  </motion.div>

                  {/* Tournament-specific fields */}
                  {eventType === "Tournament" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.85 }}
                      className="md:col-span-2"
                    >
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-bold text-amber-800">Tournament Settings</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Accepted Team Types */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Accepted Team Categories <span className="text-gray-400">(Optional)</span>
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-white">
                              {TEAM_TYPES.map((type) => (
                                <label key={type} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={acceptedTeamTypes.includes(type)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setAcceptedTeamTypes([...acceptedTeamTypes, type]);
                                      } else {
                                        setAcceptedTeamTypes(acceptedTeamTypes.filter(t => t !== type));
                                      }
                                    }}
                                    className="w-4 h-4 text-primary border-2 border-gray-300 rounded focus:ring-primary focus:ring-2"
                                  />
                                  <span className="text-sm text-gray-700">{type}</span>
                                </label>
                              ))}
                            </div>
                            {acceptedTeamTypes.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-600 mb-2">Selected categories:</p>
                                <div className="flex flex-wrap gap-2">
                                  {acceptedTeamTypes.map((type) => (
                                    <span key={type} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                      {type}
                                      <button
                                        type="button"
                                        onClick={() => setAcceptedTeamTypes(acceptedTeamTypes.filter(t => t !== type))}
                                        className="ml-2 w-4 h-4 rounded-full hover:bg-primary/20 flex items-center justify-center"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Minimum Teams */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Minimum Teams <span className="text-gray-400">(Optional)</span>
                            </label>
                            <input
                              type="number"
                              value={minTeams || ""}
                              onChange={(e) => setMinTeams(e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="e.g., 4"
                              min="2"
                              max="64"
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                            />
                          </div>

                          {/* Maximum Teams */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Maximum Teams <span className="text-gray-400">(Optional)</span>
                            </label>
                            <input
                              type="number"
                              value={maxTeams || ""}
                              onChange={(e) => setMaxTeams(e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="e.g., 16"
                              min={minTeams || 2}
                              max="64"
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                            />
                          </div>
                        </div>

                        {/* Tournament Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-800">
                              <p className="font-medium mb-1">Tournament Information</p>
                              <p>All tournament settings are optional. Select which team categories can participate, set participation limits, or leave open to all. Teams can register through the event page once published.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Club Association */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: eventType === "Tournament" ? 0.95 : 0.9 }}
                    className="md:col-span-2"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="independentEvent"
                          checked={isIndependentEvent}
                          onChange={(e) => {
                            setIsIndependentEvent(e.target.checked);
                            if (e.target.checked) {
                              setSelectedClubId("");
                            }
                          }}
                          className="w-4 h-4 text-primary border-2 border-gray-300 rounded focus:ring-primary focus:ring-2"
                        />
                        <label htmlFor="independentEvent" className="text-sm font-medium text-gray-700">
                          This is an independent event (not associated with a specific club)
                        </label>
                      </div>
                      
                      {!isIndependentEvent && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Club Association <span className="text-gray-400">(Optional)</span>
                          </label>
                          <ClubSelectorOptional
                            value={selectedClubId}
                            onChange={setSelectedClubId}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: eventType === "Tournament" ? 1.05 : 1.0 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Description <span className="text-gray-400">(Optional)</span>
                    </label>
                    <textarea
                      name="description"
                      rows={5}
                      placeholder="Provide a detailed description of your event, including what participants can expect, skill level requirements, and any special information..."
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500 resize-none"
                    ></textarea>
                  </motion.div>

                  {/* Event Image */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: eventType === "Tournament" ? 1.15 : 1.1 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Event Image <span className="text-gray-400">(Optional)</span>
                    </label>
                    <ImageUpload
                      value={imageUrl}
                      onChange={(file) => setImageFile(file)}
                      uploading={uploading}
                      error={error}
                    />
                  </motion.div>
                </div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: eventType === "Tournament" ? 1.25 : 1.2 }}
                  className="pt-8 border-t border-gray-200"
                >
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Event...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <span>Create Event</span>
                        <span>→</span>
                      </span>
                    )}
                  </button>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}