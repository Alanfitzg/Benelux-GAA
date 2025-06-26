"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { Event } from "@/types";
import { URLS, MESSAGES, UI, EVENT_CONSTANTS } from "@/lib/constants";
import { formatEventDate } from "@/lib/utils";
import { DetailPageSkeleton } from "@/components/ui/Skeleton";
import { StructuredData, generateEventStructuredData } from "@/components/StructuredData";

export default function EventDetailClient({
  eventId,
}: {
  eventId: string;
}) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${URLS.API.EVENTS}/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [eventId]);

  const handleSubmit = async (eventForm: React.FormEvent<HTMLFormElement>) => {
    eventForm.preventDefault();
    const form = eventForm.currentTarget;
    const formData = new FormData(form);
    const data = {
      eventId,
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    const response = await fetch(URLS.API.INTEREST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert(MESSAGES.SUCCESS.INTEREST_EXPRESSED);
      form.reset();
    } else {
      alert(MESSAGES.ERROR.INTEREST_FAILED);
    }
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  return (
    <>
      {event && <StructuredData data={generateEventStructuredData({
        ...event,
        startDate: event.startDate,
        endDate: event.endDate || event.startDate,
        imageUrl: event.imageUrl || undefined,
      })} />}
      <div className={`${UI.MIN_HEIGHT_DETAIL} flex flex-col items-center py-8 px-2`}>
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg">
        {/* Event Image */}
        <div className="flex justify-center mb-6">
          <Image
            src={event?.imageUrl || URLS.PLACEHOLDER_CREST}
            alt={event?.title || "Event Image"}
            width={UI.IMAGE_SIZES.DETAIL_IMAGE.width}
            height={UI.IMAGE_SIZES.DETAIL_IMAGE.height}
            className={`${UI.CLASSES.MAX_HEIGHT_MD} rounded-lg shadow object-contain`}
          />
        </div>
        {/* Hero Section */}
        <div className="bg-primary rounded-t-xl p-8 text-primary-foreground shadow-lg">
          <h1 className="text-4xl font-extrabold mb-2">{event?.title || 'Event Title'}</h1>
          <p className="text-lg mb-1">{event?.location || MESSAGES.DEFAULTS.LOCATION}</p>
          <p className="text-md">{event ? formatEventDate(event.startDate) : 'Event Date'}</p>
        </div>
        {/* Main Content (no white background) */}
        <div className="rounded-b-xl p-8 -mt-2 border border-t-0 border-gray-200">
          {/* Quick Facts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-100 rounded-lg p-4 flex flex-col gap-2">
              <h2 className="text-lg font-bold text-primary mb-2">Quick Facts</h2>
              <div className="flex justify-between text-gray-700"><span className="font-semibold">Type:</span> <span>{event?.eventType || MESSAGES.DEFAULTS.PLACEHOLDER}</span></div>
              <div className="flex justify-between text-gray-700"><span className="font-semibold">Location:</span> <span>{event?.location || MESSAGES.DEFAULTS.LOCATION}</span></div>
              <div className="flex justify-between text-gray-700"><span className="font-semibold">Date:</span> <span>{event ? formatEventDate(event.startDate) : MESSAGES.DEFAULTS.PLACEHOLDER}</span></div>
              <div className="flex justify-between text-gray-700"><span className="font-semibold">Cost:</span> <span>{event?.cost ? `€${event.cost}` : MESSAGES.DEFAULTS.PLACEHOLDER}</span></div>
            </div>
            {/* Highlights/Itinerary */}
            <div className="bg-gray-100 rounded-lg p-4 flex flex-col gap-2">
              <h2 className="text-lg font-bold text-primary mb-2">Event Highlights</h2>
              <ul className="list-disc list-inside text-gray-700">
                {event?.description ? (
                  event.description.split('\n').map((line, idx) => <li key={idx}>{line}</li>)
                ) : (
                  EVENT_CONSTANTS.DEFAULT_HIGHLIGHTS.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))
                )}
              </ul>
            </div>
          </div>
          {/* What's Included */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-200">
            <h2 className="text-lg font-bold text-primary mb-2">What&apos;s Included</h2>
            <ul className="list-disc list-inside text-gray-700">
              {EVENT_CONSTANTS.DEFAULT_INCLUDES.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          {/* Call to Action */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <a href="#interest" className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg text-lg shadow transition">{MESSAGES.BUTTONS.REGISTER_INTEREST}</a>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Want a custom trip for your club?</p>
              <a 
                href={`/survey?eventId=${eventId}`}
                className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Plan your custom GAA trip
              </a>
            </div>
          </div>
          {/* Express Interest Form */}
          <div id="interest">
            <h2 className="text-2xl font-bold mb-4 text-primary">{MESSAGES.BUTTONS.REGISTER_INTEREST}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">{MESSAGES.FORM.NAME}</label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">{MESSAGES.FORM.EMAIL}</label>
                <input
                  type="email"
                  name="email"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">{MESSAGES.FORM.MESSAGE}</label>
                <textarea
                  name="message"
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-lg transition mt-2 tracking-widest"
              >
                {MESSAGES.BUTTONS.SUBMIT}
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}