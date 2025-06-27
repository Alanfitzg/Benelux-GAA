'use client';

import React from 'react';
import Link from 'next/link';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';

interface Event {
  id: string;
  title: string;
  eventType: string;
  location: string;
  startDate: string | Date;
  cost?: number | null;
}

interface ClubEventsProps {
  events: Event[];
}

export default function ClubEvents({ events }: ClubEventsProps) {
  const { isEnabled } = useFeatureFlags();
  
  if (!isEnabled('CLUB_EVENTS') || events.length === 0) {
    return null;
  }

  const now = new Date();
  const upcomingEvents = events.filter(event => new Date(event.startDate) >= now);
  const pastEvents = events.filter(event => new Date(event.startDate) < now);

  if (upcomingEvents.length === 0 && pastEvents.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Upcoming Events</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{event.eventType}</p>
                <p className="text-gray-500 text-sm mb-2">
                  {new Date(event.startDate).toLocaleDateString('en-IE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-gray-600 text-sm mb-2">{event.location}</p>
                {event.cost && (
                  <p className="text-green-600 font-semibold">€{event.cost}</p>
                )}
                <Link href={`/events/${event.id}`} className="text-primary underline text-sm mt-2 inline-block">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Past Events</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastEvents.map((event) => (
              <div key={event.id} className="bg-gray-50 rounded-lg shadow p-6 opacity-75">
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{event.eventType}</p>
                <p className="text-gray-500 text-sm mb-2">
                  {new Date(event.startDate).toLocaleDateString('en-IE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-gray-600 text-sm">{event.location}</p>
                <Link href={`/events/${event.id}`} className="text-gray-600 underline text-sm mt-2 inline-block">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}