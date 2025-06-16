"use client";

import React, { useEffect, useState } from "react";

interface Event {
  id: string;
  title: string;
  eventType: string;
  location: string;
  startDate: string;
  cost: number;
  description?: string;
}

export const dynamic = "force-dynamic";

export default function EventDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (eventForm: React.FormEvent<HTMLFormElement>) => {
    eventForm.preventDefault();
    const form = eventForm.currentTarget;
    const formData = new FormData(form);
    const data = {
      eventId: id,
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    const response = await fetch("/api/interest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Interest expressed successfully!");
      form.reset();
    } else {
      alert("Failed to express interest");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Event Detail</h1>
      <div className="bg-white p-4 rounded shadow mb-8">
        {loading ? (
          <p>Loading...</p>
        ) : event ? (
          <>
            <h2 className="text-xl font-semibold mb-2 text-green-800">
              {event.title}
            </h2>
            <p className="text-gray-700">
              <strong>Type:</strong> {event.eventType}
            </p>
            <p className="text-gray-700">
              <strong>Location:</strong> {event.location}
            </p>
            <p className="text-gray-700">
              <strong>Start Date:</strong>{" "}
              {new Date(event.startDate).toLocaleDateString()}
            </p>
            <p className="text-gray-700">
              <strong>Cost:</strong> ${event.cost}
            </p>
            {event.description && (
              <p className="text-gray-700 mt-2">{event.description}</p>
            )}
          </>
        ) : (
          <p>Event not found.</p>
        )}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Express Interest</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              name="name"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Message (Optional)</label>
            <textarea
              name="message"
              className="w-full p-2 border rounded"
            ></textarea>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
