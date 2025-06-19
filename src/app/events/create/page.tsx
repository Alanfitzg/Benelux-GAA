"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LocationAutocomplete from './LocationAutocomplete';
import ImageUpload from '../../components/ImageUpload';

export const dynamic = "force-dynamic";

interface EventFormData {
  title: string;
  eventType: string;
  location: string;
  startDate: string;
  cost: number;
  imageUrl?: string;
}

export default function CreateEvent() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setUploading(false);
    setImageUrl(null);
    const formData = new FormData(event.currentTarget);
    const startDate = formData.get("startDate") as string;
    const file = imageFile;
    let uploadedImageUrl = "";
    if (file && file.size > 0) {
      setUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      setUploading(false);
      if (!uploadRes.ok) {
        setError("Image upload failed.");
        return;
      }
      const uploadJson = await uploadRes.json();
      uploadedImageUrl = uploadJson.url;
      setImageUrl(uploadedImageUrl);
    }
    const data: EventFormData = {
      title: formData.get("title") as string,
      eventType: formData.get("eventType") as string,
      location,
      startDate: new Date(startDate).toISOString(),
      cost: parseFloat(formData.get("cost") as string),
      imageUrl: uploadedImageUrl || undefined,
    };
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      router.push("/events");
    } else {
      setError("Failed to create event");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-2">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8">
        <h1 className="text-3xl font-bold tracking-wide mb-8 text-green-800 text-center">Create Event</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Event Type</label>
            <select
              name="eventType"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400"
              required
              defaultValue=""
            >
              <option value="" disabled>Select Type</option>
              <option value="Mens Gaelic Football">Mens Gaelic Football</option>
              <option value="LGFA">LGFA</option>
              <option value="Hurling">Hurling</option>
              <option value="Camogie">Camogie</option>
              <option value="Rounders">Rounders</option>
              <option value="G4MO">G4MO</option>
              <option value="Dads & Lads">Dads & Lads</option>
              <option value="Higher Education">Higher Education</option>
              <option value="Youth">Youth</option>
              <option value="Elite training camp">Elite training camp</option>
              <option value="Beach GAA">Beach GAA</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Event Title</label>
            <input
              type="text"
              name="title"
              placeholder="Event Title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
            <LocationAutocomplete value={location} onChange={setLocation} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Cost</label>
            <input
              type="number"
              name="cost"
              placeholder="Cost"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-green-700 focus:ring-2 focus:ring-green-200 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Event Image</label>
            <ImageUpload
              value={imageUrl}
              onChange={file => setImageFile(file)}
              uploading={uploading}
              error={error}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 rounded-lg transition mt-2 tracking-widest"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
}
