"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { Event } from "@/types";

export const dynamic = "force-dynamic";

export default function EventDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
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
    <div className="min-h-screen flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg">
        {/* Event Image */}
        <div className="flex justify-center mb-6">
          <Image
            src={event?.imageUrl || "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"}
            alt={event?.title || "Event Image"}
            width={300}
            height={192}
            className="max-h-48 rounded-lg shadow object-contain"
          />
        </div>
        {/* Hero Section */}
        <div className="bg-[#032572] rounded-t-xl p-8 text-white shadow-lg">
          <h1 className="text-4xl font-extrabold mb-2">{event?.title || 'Event Title'}</h1>
          <p className="text-lg mb-1">{event?.location || 'Event Location'}</p>
          <p className="text-md">{event ? new Date(event.startDate).toLocaleDateString() : 'Event Date'}</p>
        </div>
        {/* Main Content (no white background) */}
        <div className="rounded-b-xl p-8 -mt-2 border border-t-0 border-gray-200">
          {/* Quick Facts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-100 rounded-lg p-4 flex flex-col gap-2">
              <h2 className="text-lg font-bold text-[#032572] mb-2">Quick Facts</h2>
              <div className="flex justify-between text-gray-700"><span className="font-semibold">Type:</span> <span>{event?.eventType || '-'}</span></div>
              <div className="flex justify-between text-gray-700"><span className="font-semibold">Location:</span> <span>{event?.location || '-'}</span></div>
              <div className="flex justify-between text-gray-700"><span className="font-semibold">Date:</span> <span>{event ? new Date(event.startDate).toLocaleDateString() : '-'}</span></div>
              <div className="flex justify-between text-gray-700"><span className="font-semibold">Cost:</span> <span>{event?.cost ? `€${event.cost}` : '-'}</span></div>
            </div>
            {/* Highlights/Itinerary */}
            <div className="bg-gray-100 rounded-lg p-4 flex flex-col gap-2">
              <h2 className="text-lg font-bold text-[#032572] mb-2">Event Highlights</h2>
              <ul className="list-disc list-inside text-gray-700">
                {event?.description ? (
                  event.description.split('\n').map((line, idx) => <li key={idx}>{line}</li>)
                ) : (
                  <>
                    <li>Friendly fixture with a local team</li>
                    <li>Team-building activities</li>
                    <li>Social night out</li>
                    <li>Guided city tour</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          {/* What's Included */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-200">
            <h2 className="text-lg font-bold text-[#032572] mb-2">What&apos;s Included</h2>
            <ul className="list-disc list-inside text-gray-700">
              <li>3 nights in a centrally located hotel</li>
              <li>Breakfast each morning</li>
              <li>All scheduled activities and fixtures</li>
              <li>Dedicated event manager</li>
              <li>Souvenir or event pennant</li>
            </ul>
          </div>
          {/* Call to Action */}
          <div className="flex justify-center mb-8">
            <a href="#interest" className="bg-[#032572] hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-lg text-lg shadow transition">Register Interest</a>
          </div>
          {/* Express Interest Form */}
          <div id="interest">
            <h2 className="text-2xl font-bold mb-4 text-[#032572]">Express Interest</h2>
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
                className="w-full bg-[#032572] hover:bg-blue-900 text-white font-bold py-2 rounded-lg transition mt-2 tracking-widest"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
