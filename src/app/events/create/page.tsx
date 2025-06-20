"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LocationAutocomplete from "./LocationAutocomplete";
import ImageUpload from "../../components/ImageUpload";
import type { Event } from "@/types";
import { EVENT_TYPES } from "@/lib/constants/events";
import { URLS, MESSAGES } from "@/lib/constants";

type EventFormData = Omit<Event, "id">;

export const dynamic = "force-dynamic";

export default function CreateEvent() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    
    const data: EventFormData = {
      title: (form.elements.namedItem("title") as HTMLInputElement)?.value || "",
      eventType: (form.elements.namedItem("eventType") as HTMLSelectElement)?.value || "",
      location,
      startDate: (form.elements.namedItem("startDate") as HTMLInputElement)?.value || "",
      endDate: (form.elements.namedItem("endDate") as HTMLInputElement)?.value || undefined,
      cost: parseFloat((form.elements.namedItem("cost") as HTMLInputElement)?.value) || undefined,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement)?.value || undefined,
      imageUrl: uploadedImageUrl || undefined,
    };
    
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
      setError(MESSAGES.ERROR.GENERIC);
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
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 text-sm font-medium"
                      required
                      defaultValue=""
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

                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
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
                    transition={{ delay: 1.0 }}
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
                  transition={{ delay: 1.1 }}
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