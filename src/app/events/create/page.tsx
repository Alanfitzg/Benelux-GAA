"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setUploading(false);
    setImageUrl(null);
    const formData = new FormData(event.currentTarget);
    const startDate = formData.get("startDate") as string;
    const file = formData.get("image") as File;
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
      location: formData.get("location") as string,
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
    <div>
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Event Type</label>
          <select
            name="eventType"
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Type</option>
            <option value="Match">Match</option>
            <option value="Tournament">Tournament</option>
            <option value="Youth">Youth</option>
            <option value="Social">Social</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Event Title</label>
          <input
            type="text"
            name="title"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Location</label>
          <input
            type="text"
            name="location"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Cost</label>
          <input
            type="number"
            name="cost"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Event Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="w-full p-2 border rounded"
          />
          {uploading && <div className="text-blue-700">Uploading image...</div>}
          {imageUrl && <img src={imageUrl} alt="Uploaded event" className="max-h-32 mt-2" />}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-700"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}
