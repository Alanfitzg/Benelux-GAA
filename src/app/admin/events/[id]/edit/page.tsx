"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUpload from '../../../../components/ImageUpload';
import { EVENT_TYPES } from "@/lib/constants/events";
import { URLS, MESSAGES } from "@/lib/constants";

// Use EVENT_TYPES from constants

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  interface EventData {
    title: string;
    eventType: string;
    location: string;
    startDate: string;
    cost: number;
    imageUrl?: string;
  }

  const [event, setEvent] = useState<EventData | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetch(`${URLS.API.EVENTS}/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setImageUrl(data.imageUrl || null);
      });
  }, [eventId]);

  async function handleSubmit(eventForm: React.FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();
    setError("");
    setSuccess(false);
    setUploading(false);
    const form = eventForm.currentTarget;
    const file = imageFile;
    let uploadedImageUrl = imageUrl || "";
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
    const data = {
      title: (form.title as unknown as HTMLInputElement).value,
      eventType: (form.eventType as unknown as HTMLSelectElement).value,
      location: (form.location as unknown as HTMLInputElement).value,
      startDate: (form.startDate as unknown as HTMLInputElement).value,
      cost: parseFloat((form.cost as unknown as HTMLInputElement).value),
      imageUrl: uploadedImageUrl || undefined,
    };
    const res = await fetch(`${URLS.API.EVENTS}/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSuccess(true);
      router.refresh();
    } else {
      setError(MESSAGES.ERROR.GENERIC);
    }
  }

  if (!event) return <div className="p-8">{MESSAGES.LOADING.EVENTS}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-2">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-[#032572] text-center">
          Edit Event
        </h1>
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {MESSAGES.SUCCESS.EVENT_UPDATED}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Event Type
            </label>
            <select
              name="eventType"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-[#032572] focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
              required
              defaultValue={event.eventType}
            >
              <option value="" disabled>
                Select Type
              </option>
              {/* EVENT_TYPES contains ["Tournament", "Individual Team Trip"] */}
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              defaultValue={event.title}
              placeholder="Event Title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-[#032572] focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              defaultValue={event.location}
              placeholder="Location"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-[#032572] focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              defaultValue={event.startDate?.slice(0, 10)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-[#032572] focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Cost
            </label>
            <input
              type="number"
              name="cost"
              defaultValue={event.cost}
              placeholder="Cost"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-[#032572] focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Event Image
            </label>
            <ImageUpload
              value={imageUrl}
              onChange={file => setImageFile(file)}
              uploading={uploading}
              error={error}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#032572] hover:bg-blue-900 text-white font-bold py-2 rounded-lg transition mt-2 tracking-widest"
          >
            Update Event
          </button>
        </form>
      </div>
    </div>
  );
}
