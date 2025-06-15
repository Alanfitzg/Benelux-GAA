'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEvent() {
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const startDate = formData.get('startDate') as string;
    
    const data = {
      title: formData.get('title'),
      eventType: formData.get('eventType'),
      location: formData.get('location'),
      startDate: new Date(startDate).toISOString(),
      cost: parseFloat(formData.get('cost') as string),
    };

    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.push('/events');
    } else {
      alert('Failed to create event');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Event Title</label>
          <input type="text" name="title" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block mb-1">Event Type</label>
          <select name="eventType" className="w-full p-2 border rounded" required>
            <option value="">Select Type</option>
            <option value="Match">Match</option>
            <option value="Tournament">Tournament</option>
            <option value="Youth">Youth</option>
            <option value="Social">Social</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Location</label>
          <input type="text" name="location" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block mb-1">Start Date</label>
          <input type="date" name="startDate" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block mb-1">Cost</label>
          <input type="number" name="cost" className="w-full p-2 border rounded" required />
        </div>
        <button type="submit" className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-700">Create Event</button>
      </form>
    </div>
  );
} 