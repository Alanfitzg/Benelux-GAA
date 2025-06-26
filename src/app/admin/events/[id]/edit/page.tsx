"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import ImageUpload from '../../../../components/ImageUpload';
import LocationAutocomplete from '../../../../events/create/LocationAutocomplete';
import ClubSelectorOptional from '@/components/ClubSelectorOptional';
import { EVENT_TYPES } from "@/lib/constants/events";
import { URLS, MESSAGES } from "@/lib/constants";

interface EventData {
  title: string;
  eventType: string;
  location: string;
  startDate: string;
  endDate?: string;
  cost: number;
  description?: string;
  imageUrl?: string;
  clubId?: string;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [selectedClubId, setSelectedClubId] = useState<string>("");

  useEffect(() => {
    fetch(`${URLS.API.EVENTS}/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setLocation(data.location || "");
        setImageUrl(data.imageUrl || null);
        setSelectedClubId(data.clubId || "");
      });
  }, [eventId]);

  async function handleSubmit(eventForm: React.FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();
    setError("");
    setSuccess(false);
    
    const formData = new FormData(eventForm.target as HTMLFormElement);
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
    
    const costValue = formData.get("cost") as string;
    const parsedCost = costValue ? parseFloat(costValue) : null;
    
    // Validate cost
    if (costValue && (isNaN(parsedCost!) || parsedCost! < 0)) {
      setError("Please enter a valid cost amount");
      return;
    }
    
    const data = {
      title: formData.get("title") as string,
      eventType: formData.get("eventType") as string,
      location,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string || null,
      cost: parsedCost,
      description: formData.get("description") as string || null,
      imageUrl: uploadedImageUrl || imageUrl || null,
      clubId: selectedClubId || null,
    };
    
    console.log('Sending data:', data);
    
    const res = await fetch(`${URLS.API.EVENTS}/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push('/admin/events'), 2000);
    } else {
      const errorData = await res.json();
      console.error('Update error:', errorData);
      setError(errorData.details || MESSAGES.ERROR.GENERIC);
    }
  }

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/admin/events"
              className="text-primary hover:text-primary/80 transition mb-4 inline-block"
            >
              ← Back to Events
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-8 md:p-12">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-8 flex items-center space-x-3"
                >
                  <span className="text-green-500">✅</span>
                  <span>Event updated successfully! Redirecting...</span>
                </motion.div>
              )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Club Selection */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Club Association
                    </label>
                    <ClubSelectorOptional
                      value={selectedClubId}
                      onChange={setSelectedClubId}
                    />
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Event Type
                    </label>
                    <select
                      name="eventType"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                      required
                      defaultValue={event.eventType}
                    >
                      <option value="" disabled>Select Type</option>
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Event Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Event Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={event.title}
                      placeholder="Enter event title"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Location
                    </label>
                    <LocationAutocomplete value={location} onChange={setLocation} />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={event.startDate.split('T')[0]}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      End Date <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={event.endDate ? event.endDate.split('T')[0] : ''}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                    />
                  </div>

                  {/* Cost */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">€</span>
                      <input
                        type="number"
                        name="cost"
                        defaultValue={event.cost}
                        placeholder="0.00"
                        step="0.01"
                        className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Description <span className="text-gray-400">(Optional)</span>
                    </label>
                    <textarea
                      name="description"
                      rows={5}
                      defaultValue={event.description || ''}
                      placeholder="Provide a detailed description of your event..."
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500 resize-none"
                    ></textarea>
                  </div>

                  {/* Event Image */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Event Image <span className="text-gray-400">(Optional)</span>
                    </label>
                    <ImageUpload
                      value={imageUrl}
                      onChange={(file) => setImageFile(file)}
                      uploading={uploading}
                      error={error}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-8 border-t border-gray-200 flex justify-between">
                  <Link
                    href="/admin/events"
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <span className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </span>
                    ) : (
                      "Update Event"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}