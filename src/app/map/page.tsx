"use client";
import React, { useEffect, useState } from "react";
import Map, { Marker, Popup, ViewStateChangeEvent } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import Image from "next/image";

// const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN!;
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

interface Event {
  id: string;
  title: string;
  location: string;
  startDate: string;
  eventType: string;
  latitude?: number;
  longitude?: number;
}

export default function MapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -6.2603,
    latitude: 53.3498,
    zoom: 5,
  });

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  const handleSidebarClick = (event: Event) => {
    if (event.latitude !== undefined && event.longitude !== undefined) {
      setViewState({ longitude: event.longitude, latitude: event.latitude, zoom: 8 });
      setSelectedEventId(event.id);
    }
  };

  return (
    <div className="flex h-[80vh] w-full">
      {/* Sidebar */}
      <div className="w-96 bg-white border-r p-6 overflow-y-auto shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Upcoming Events
        </h2>
        {loading ? (
          <div className="text-gray-500">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-gray-500">No events found.</div>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => (
              <li
                key={event.id}
                className={`p-3 rounded-lg shadow transition-all cursor-pointer flex items-center gap-3 border border-transparent ${
                  selectedEventId === event.id
                    ? "bg-blue-50 border-blue-600"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleSidebarClick(event)}
              >
                {/* Avatar/Icon */}
                <Image
                  src="https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/tournament-icon.jpg"
                  alt="Event"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-contain bg-white border"
                  priority
                />
                <div className="flex-1">
                  <div className="font-semibold text-lg text-gray-900">
                    {event.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-400">{event.location}</div>
                </div>
                {selectedEventId === event.id && (
                  <Link
                    href={`/events/${event.id}`}
                    className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-semibold"
                  >
                    View
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Map */}
      <div className="flex-1 relative">
        <Map
          {...viewState}
          onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
        >
          {events.map((event) => {
            if (event.latitude === undefined || event.longitude === undefined) return null;
            return (
              <Marker
                key={event.id}
                longitude={event.longitude}
                latitude={event.latitude}
                anchor="bottom"
                onClick={() => setSelectedEventId(event.id)}
              >
                <Image
                  src="https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/tournament-icon.jpg"
                  alt="Event"
                  width={32}
                  height={32}
                  className="w-8 h-8 drop-shadow"
                  priority
                />
              </Marker>
            );
          })}
          {events.map((event) => {
            if (event.id !== selectedEventId) return null;
            if (event.latitude === undefined || event.longitude === undefined) return null;
            return (
              <Popup
                key={event.id}
                longitude={event.longitude}
                latitude={event.latitude}
                anchor="top"
                closeOnClick={false}
                onClose={() => setSelectedEventId(null)}
                className="z-50"
              >
                <div className="p-2 min-w-[180px]">
                  <div className="font-bold text-base mb-1">{event.title}</div>
                  <div className="text-xs text-gray-500 mb-1">
                    {event.location}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(event.startDate).toLocaleDateString()}
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    className="text-blue-600 hover:underline text-sm font-semibold"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            );
          })}
        </Map>
      </div>
    </div>
  );
}
