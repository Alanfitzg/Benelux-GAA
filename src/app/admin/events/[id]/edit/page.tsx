"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import ImageUpload from '../../../../components/ImageUpload';
import LocationAutocomplete from '../../../../events/create/LocationAutocomplete';
import ClubSelectorOptional from '@/components/ClubSelectorOptional';
import EnhancedPitchSelector from '@/components/events/EnhancedPitchSelector';
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
  visibility?: 'PUBLIC' | 'PRIVATE';
  pitchLocationId?: string;
  pitchLocations?: Array<{
    id: string;
    pitchLocationId: string;
    isPrimary: boolean;
  }>;
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
  const [selectedPitches, setSelectedPitches] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');

  useEffect(() => {
    fetch(`${URLS.API.EVENTS}/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setLocation(data.location || "");
        setImageUrl(data.imageUrl || null);
        setSelectedClubId(data.clubId || "");
        setVisibility(data.visibility || 'PUBLIC');
        // Set pitches - support both old single pitch and new multiple pitches
        if (data.pitchLocations && data.pitchLocations.length > 0) {
          setSelectedPitches(data.pitchLocations.map((p: { pitchLocationId: string }) => p.pitchLocationId));
        } else if (data.pitchLocationId) {
          setSelectedPitches([data.pitchLocationId]);
        }
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
      uploadData.append("type", "event-image");
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
      visibility: visibility,
      pitchLocationId: selectedPitches.length === 1 ? selectedPitches[0] : null,
      pitchLocationIds: selectedPitches,
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
                  className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-8 flex items-center space-x-3 shadow-sm"
                >
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <div className="font-medium">Event Updated Successfully</div>
                    <div className="text-sm text-green-700">Redirecting to events list...</div>
                  </div>
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-8 flex items-center space-x-3 shadow-sm"
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-medium">Update Failed</div>
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Basic Event Information */}
                <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                      Basic Information
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Essential details that define your event
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Event Title - MOST IMPORTANT FIRST */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Event Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={event.title}
                        placeholder="Enter event title"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                        required
                      />
                    </div>

                    {/* Event Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Event Type
                      </label>
                      <select
                        name="eventType"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                        required
                        defaultValue={event.eventType}
                      >
                        <option value="" disabled>Select Type</option>
                        {EVENT_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
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
                          className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
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
                        rows={4}
                        defaultValue={event.description || ''}
                        placeholder="Provide a detailed description of your event..."
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500 resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Section 2: Date & Location */}
                <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-2 h-8 bg-green-600 rounded-full"></div>
                      Date & Location
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Schedule and geographic details for your event
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        defaultValue={event.startDate.split('T')[0]}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
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
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                      />
                    </div>

                    {/* Location */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Location
                      </label>
                      <LocationAutocomplete value={location} onChange={setLocation} />
                    </div>
                  </div>
                </div>

                {/* Section 3: Venue & Facilities */}
                <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-2 h-8 bg-purple-600 rounded-full"></div>
                      Venue & Facilities
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Physical locations and facilities for your event
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Pitch Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Pitch Location(s) <span className="text-gray-400">(Optional)</span>
                        {event.eventType === 'Tournament' && (
                          <span className="ml-2 text-xs text-gray-500">Multiple pitches can be selected for tournaments</span>
                        )}
                      </label>
                      <EnhancedPitchSelector
                        selectedPitches={selectedPitches}
                        onChange={setSelectedPitches}
                        clubId={selectedClubId}
                        isTournament={event.eventType === 'Tournament'}
                        allowCreate={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Organization & Settings */}
                <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-2 h-8 bg-orange-600 rounded-full"></div>
                      Organization & Settings
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Administrative and organizational configuration
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Club Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Club Association <span className="text-gray-400">(Optional)</span>
                      </label>
                      <ClubSelectorOptional
                        value={selectedClubId}
                        onChange={setSelectedClubId}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Associate this event with a specific club for management and branding
                      </p>
                    </div>

                    {/* Tournament Visibility - Only show for tournaments */}
                    {event.eventType === 'Tournament' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Tournament Visibility
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-primary/30 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input
                              type="radio"
                              name="visibility"
                              value="PUBLIC"
                              checked={visibility === 'PUBLIC'}
                              onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
                              className="w-4 h-4 text-primary border-2 border-gray-300 focus:ring-primary focus:ring-2"
                            />
                            <div>
                              <div className="font-medium text-gray-900">Public Tournament</div>
                              <div className="text-sm text-gray-600">Open to new team registrations</div>
                            </div>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-primary/30 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input
                              type="radio"
                              name="visibility"
                              value="PRIVATE"
                              checked={visibility === 'PRIVATE'}
                              onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
                              className="w-4 h-4 text-primary border-2 border-gray-300 focus:ring-primary focus:ring-2"
                            />
                            <div>
                              <div className="font-medium text-gray-900">Private Tournament</div>
                              <div className="text-sm text-gray-600">Official tournament, no new applications</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 5: Visual Assets */}
                <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-2 h-8 bg-pink-600 rounded-full"></div>
                      Visual Assets
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Images and visual content for your event
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Event Image */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Event Image <span className="text-gray-400">(Optional)</span>
                      </label>
                      <ImageUpload
                        value={imageUrl}
                        onChange={(file) => setImageFile(file)}
                        uploading={uploading}
                        error={error}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Upload a high-quality image to showcase your event. Recommended size: 1200×630px
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Changes will be saved immediately and affect how users see your event</span>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href="/admin/events"
                        className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        disabled={uploading}
                        className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                      >
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Update Event</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}