"use client";
import React, { useEffect, useState } from "react";
import Map, { Marker, Popup, ViewStateChangeEvent } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import Image from "next/image";
import type { Club, Event } from "@/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -6.2603,
    latitude: 53.3498,
    zoom: 5,
  });
  const [viewMode, setViewMode] = useState<"event" | "teams">("event");

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (viewMode === "teams") {
      setLoading(true);
      fetch("/api/clubs")
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched clubs:", data);
          setClubs(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching clubs:", error);
          setLoading(false);
        });
    }
  }, [viewMode]);

  const handleSidebarClick = (event: Event) => {
    if (event.latitude !== undefined && event.longitude !== undefined) {
      setViewState({
        longitude: event.longitude,
        latitude: event.latitude,
        zoom: 8,
      });
      setSelectedEventId(event.id);
    }
  };

  const handleClubClick = (club: Club) => {
    if (typeof club.latitude === 'number' && typeof club.longitude === 'number') {
      setViewState({
        longitude: club.longitude,
        latitude: club.latitude,
        zoom: 8,
      });
      setSelectedClubId(club.id);
    }
  };

  useEffect(() => {
    if (viewMode === "event") {
      setSelectedClubId(null);
    } else {
      setSelectedEventId(null);
    }
  }, [viewMode]);

  console.log("Current view mode:", viewMode);
  console.log("Clubs data:", clubs);

  return (
    <div className="flex h-[80vh] w-full">
      {/* Sidebar */}
      <div className="w-96 bg-white border-r p-6 overflow-y-auto shadow-lg">
        {/* Modern Toggle */}
        <div className="relative inline-flex p-1 mb-6 bg-gray-100 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">
          <button
            onClick={() => setViewMode("event")}
            className={`relative z-10 px-6 py-2 text-sm font-medium transition-colors duration-200 rounded-full ${
              viewMode === "event"
                ? "text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Event Info
          </button>
          <button
            onClick={() => setViewMode("teams")}
            className={`relative z-10 px-6 py-2 text-sm font-medium transition-colors duration-200 rounded-full ${
              viewMode === "teams"
                ? "text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            View Teams
          </button>
          {/* Sliding background */}
          <div
            className={`absolute top-1 left-1 w-[calc(50%-4px)] h-[calc(100%-8px)] bg-blue-600 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${
              viewMode === "teams" ? "translate-x-full" : ""
            }`}
          />
        </div>
        {/* Sidebar Content */}
        {viewMode === "event" ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Upcoming Events
              </h2>
              <Link
                href="/events"
                className="px-4 py-2 text-sm bg-green-700 text-white rounded-full hover:bg-green-600 transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                View All Events
              </Link>
            </div>
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
                      <div className="text-xs text-gray-400">
                        {event.location}
                      </div>
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
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Teams</h2>
            {loading ? (
              <div className="text-gray-500">Loading teams...</div>
            ) : clubs.length === 0 ? (
              <div className="text-gray-500">No teams found.</div>
            ) : (
              <ul className="space-y-4">
                {clubs.map((club) => (
                  <li
                    key={club.id}
                    className={`p-3 rounded-lg shadow transition-all cursor-pointer flex items-center gap-3 border border-transparent ${
                      selectedClubId === club.id
                        ? "bg-blue-50 border-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleClubClick(club)}
                  >
                    {/* Avatar/Icon */}
                    <Image
                      src={
                        club.imageUrl ||
                        "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/tournament-icon.jpg"
                      }
                      alt={club.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-contain bg-white border"
                      priority
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-900">
                        {club.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {club.region || "Region not specified"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {club.location}
                      </div>
                    </div>
                    {selectedClubId === club.id && (
                      <Link
                        href={`/clubs/${club.id}`}
                        className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-semibold"
                      >
                        View
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
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
          {viewMode === "event"
            ? // Event markers
              events.map((event) => {
                if (
                  event.latitude === undefined ||
                  event.longitude === undefined
                )
                  return null;
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
              })
            : // Club markers
              clubs.map((club) => {
                if (typeof club.latitude !== 'number' || typeof club.longitude !== 'number') {
                  return null;
                }
                return (
                  <Marker
                    key={club.id}
                    longitude={club.longitude}
                    latitude={club.latitude}
                    anchor="bottom"
                    onClick={() => setSelectedClubId(club.id)}
                  >
                    <Image
                      src={
                        club.imageUrl ||
                        "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/tournament-icon.jpg"
                      }
                      alt={club.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 drop-shadow"
                      priority
                    />
                  </Marker>
                );
              })}
          {/* Popups */}
          {viewMode === "event"
            ? // Event popups
              events.map((event) => {
                if (event.id !== selectedEventId) return null;
                if (
                  event.latitude === undefined ||
                  event.longitude === undefined
                )
                  return null;
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
                      <div className="font-bold text-base mb-1">
                        {event.title}
                      </div>
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
              })
            : // Club popups
              clubs.map((club) => {
                if (club.id !== selectedClubId) return null;
                if (typeof club.latitude !== 'number' || typeof club.longitude !== 'number') {
                  return null;
                }
                return (
                  <Popup
                    key={club.id}
                    longitude={club.longitude}
                    latitude={club.latitude}
                    anchor="top"
                    closeOnClick={false}
                    onClose={() => setSelectedClubId(null)}
                    className="z-50"
                  >
                    <div className="p-2 min-w-[180px]">
                      <div className="font-bold text-base mb-1">
                        {club.name}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {club.location}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {club.region || "Region not specified"}
                      </div>
                      <Link
                        href={`/clubs/${club.id}`}
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
