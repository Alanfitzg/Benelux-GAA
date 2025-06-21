"use client";
import React, { useEffect, useState, useMemo } from "react";
import Map, { Marker, Popup, ViewStateChangeEvent } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import type { Event } from "@/types";
import { MAP_CONFIG, URLS, EVENT_TYPES } from "@/lib/constants";
import { formatShortDate, hasValidCoordinates } from "@/lib/utils";

type ClubMapItem = {
  id: string;
  name: string;
  map: string | null;
  imageUrl: string | null;
  region: string | null;
  subRegion: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  facebook: string | null;
  instagram: string | null;
  website: string | null;
  codes: string | null;
  teamTypes: string[];
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

// Extract unique countries from clubs
const getCountriesFromClubs = (clubs: ClubMapItem[]) => {
  const countries = new Set<string>();
  clubs.forEach((club) => {
    if (club.location) {
      // Extract country from location (assuming format: "City, Country")
      const parts = club.location.split(",");
      if (parts.length > 1) {
        const country = parts[parts.length - 1].trim();
        countries.add(country);
      }
    }
  });
  return Array.from(countries).sort();
};

export default function Home() {
  const { status } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<ClubMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [viewState, setViewState] = useState({
    longitude: MAP_CONFIG.DEFAULT_CENTER.longitude as number,
    latitude: MAP_CONFIG.DEFAULT_CENTER.latitude as number,
    zoom: MAP_CONFIG.DEFAULT_ZOOM as number,
  });
  const [viewMode, setViewMode] = useState<"tournaments" | "clubs">("clubs");

  // Filter states
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Only fetch when session loading is complete
    if (status !== "loading") {
      fetch(URLS.API.EVENTS)
        .then((res) => {
          console.log("Events API response status:", res.status);
          return res.json();
        })
        .then((data) => {
          console.log("Fetched events:", data?.length, "events");
          if (Array.isArray(data)) {
            setEvents(data);
          } else {
            console.error("Events data is not an array:", data);
            setEvents([]);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching events:", error);
          setEvents([]);
          setLoading(false);
        });
    }
  }, [status]);

  useEffect(() => {
    if (viewMode === "clubs" && status !== "loading") {
      setLoading(true);
      fetch(URLS.API.CLUBS)
        .then((res) => {
          console.log("Clubs API response status:", res.status);
          return res.json();
        })
        .then((data) => {
          console.log("Fetched clubs:", data?.length, "clubs");
          if (Array.isArray(data)) {
            setClubs(data);
          } else {
            console.error("Clubs data is not an array:", data);
            setClubs([]);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching clubs:", error);
          setClubs([]);
          setLoading(false);
        });
    }
  }, [viewMode, status]);

  // Memoized filtered data
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType =
        selectedEventType === "all" || event.eventType === selectedEventType;
      const matchesSearch =
        searchTerm === "" ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [events, selectedEventType, searchTerm]);

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesCountry =
        selectedCountry === "all" ||
        (club.location &&
          club.location.toLowerCase().includes(selectedCountry.toLowerCase()));
      const matchesSearch =
        searchTerm === "" ||
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (club.location &&
          club.location.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCountry && matchesSearch;
    });
  }, [clubs, selectedCountry, searchTerm]);

  const countries = useMemo(() => getCountriesFromClubs(clubs), [clubs]);

  const handleSidebarClick = (event: Event) => {
    if (hasValidCoordinates(event)) {
      setViewState({
        longitude: event.longitude! as number,
        latitude: event.latitude! as number,
        zoom: MAP_CONFIG.SELECTED_ITEM_ZOOM,
      });
      setSelectedEventId(event.id);
    }
  };

  const handleClubClick = (club: ClubMapItem) => {
    if (hasValidCoordinates(club)) {
      setViewState({
        longitude: club.longitude! as number,
        latitude: club.latitude! as number,
        zoom: MAP_CONFIG.SELECTED_ITEM_ZOOM,
      });
      setSelectedClubId(club.id);
    }
  };

  useEffect(() => {
    if (viewMode === "tournaments") {
      setSelectedClubId(null);
    } else {
      setSelectedEventId(null);
    }
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-light to-secondary text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-4">
              Discover Gaelic
              <span className="block text-gradient-warm">Around the World</span>
            </h1>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Connect with Gaelic Athletic clubs and tournaments across the
              globe. Join the worldwide Gaelic community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("clubs")}
                className="px-6 py-3 bg-white text-primary font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                🏛️ Explore Clubs
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("tournaments")}
                className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-primary transition-all duration-300"
              >
                🎯 View Tournaments
              </motion.button>
            </div>
          </motion.div>
        </div>
        {/* Animated background shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen relative">
        {/* Professional Sidebar */}
        <motion.div
          initial={{ x: -400 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-96 bg-white shadow-professional-lg border-r border-gray-200/50 overflow-hidden"
        >
          {/* Mode Toggle */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/50">
            <div className="relative bg-gray-100 rounded-2xl p-1">
              <motion.div
                layout
                className={`absolute top-1 w-[calc(50%-4px)] h-[calc(100%-8px)] bg-white rounded-xl shadow-lg transition-all duration-300 ${
                  viewMode === "tournaments" ? "left-[calc(50%+2px)]" : "left-1"
                }`}
              />
              <div className="relative flex">
                <button
                  onClick={() => setViewMode("clubs")}
                  className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-colors duration-200 ${
                    viewMode === "clubs" ? "text-primary" : "text-gray-600"
                  }`}
                >
                  🏛️ Clubs
                </button>
                <button
                  onClick={() => setViewMode("tournaments")}
                  className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-colors duration-200 ${
                    viewMode === "tournaments"
                      ? "text-primary"
                      : "text-gray-600"
                  }`}
                >
                  🎯 Tournaments
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-6 space-y-6 border-b border-gray-200/50">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                type="text"
                placeholder={`Search ${viewMode}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50/50"
              />
            </div>

            {/* Filters */}
            <AnimatePresence mode="wait">
              {viewMode === "clubs" ? (
                <motion.div
                  key="clubs-filter"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🌍 Country
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="all">All Countries</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="tournaments-filter"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎯 Event Type
                    </label>
                    <select
                      value={selectedEventType}
                      onChange={(e) => setSelectedEventType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="all">All Types</option>
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {viewMode === "clubs" ? "Gaelic Clubs" : "Tournaments"}
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {viewMode === "clubs"
                    ? filteredClubs.length
                    : filteredEvents.length}{" "}
                  found
                </span>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-20 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {viewMode === "clubs" ? (
                      filteredClubs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-4xl mb-4">🏛️</div>
                          <p>No clubs found</p>
                        </div>
                      ) : (
                        filteredClubs.map((club, index) => (
                          <motion.div
                            key={club.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleClubClick(club)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-lg ${
                              selectedClubId === club.id
                                ? "bg-primary/10 border-primary/30 shadow-md"
                                : "bg-white border-gray-200 hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                {club.imageUrl ? (
                                  <Image
                                    src={club.imageUrl}
                                    alt={club.name}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-lg object-cover"
                                  />
                                ) : (
                                  <span className="text-primary font-bold text-lg">
                                    {club.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {club.name}
                                </h4>
                                <p className="text-sm text-gray-600 truncate">
                                  📍 {club.location || "Location not specified"}
                                </p>
                                {club.teamTypes &&
                                  club.teamTypes.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {club.teamTypes
                                        .slice(0, 2)
                                        .map((type, i) => (
                                          <span
                                            key={i}
                                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md"
                                          >
                                            {type}
                                          </span>
                                        ))}
                                      {club.teamTypes.length > 2 && (
                                        <span className="text-xs text-gray-500">
                                          +{club.teamTypes.length - 2} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )
                    ) : filteredEvents.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-4">🎯</div>
                        <p>No tournaments found</p>
                      </div>
                    ) : (
                      filteredEvents.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSidebarClick(event)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            selectedEventId === event.id
                              ? "bg-secondary/10 border-secondary/30 shadow-md"
                              : "bg-white border-gray-200 hover:border-secondary/30"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-secondary text-lg">🎯</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {event.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                📅 {formatShortDate(event.startDate)}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                📍 {event.location}
                              </p>
                              <span className="inline-block text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-md mt-2">
                                {event.eventType}
                              </span>
                            </div>
                            {selectedEventId === event.id && (
                              <Link
                                href={`/events/${event.id}`}
                                className="px-3 py-1 bg-secondary text-white text-xs rounded-lg hover:bg-secondary/90 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View
                              </Link>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Map */}
        <div className="flex-1 relative">
          <Map
            {...viewState}
            onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
            style={{ width: "100%", height: "100%" }}
            mapStyle={MAP_CONFIG.STYLE}
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            {viewMode === "tournaments"
              ? filteredEvents.map((event) => {
                  if (!hasValidCoordinates(event)) return null;
                  return (
                    <Marker
                      key={event.id}
                      longitude={event.longitude!}
                      latitude={event.latitude!}
                      anchor={MAP_CONFIG.MARKER_ANCHOR}
                      onClick={() => setSelectedEventId(event.id)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-full shadow-lg flex items-center justify-center text-white font-bold border-4 border-white">
                          🎯
                        </div>
                      </motion.div>
                    </Marker>
                  );
                })
              : filteredClubs.map((club) => {
                  if (!hasValidCoordinates(club)) return null;
                  return (
                    <Marker
                      key={club.id}
                      longitude={club.longitude!}
                      latitude={club.latitude!}
                      anchor={MAP_CONFIG.MARKER_ANCHOR}
                      onClick={() => setSelectedClubId(club.id)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                          {club.imageUrl ? (
                            <Image
                              src={club.imageUrl}
                              alt={club.name}
                              width={32}
                              height={32}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {club.name.charAt(0)}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    </Marker>
                  );
                })}

            {/* Enhanced Popups */}
            {selectedEventId && viewMode === "tournaments" && (
              <Popup
                longitude={
                  events.find((e) => e.id === selectedEventId)?.longitude || 0
                }
                latitude={
                  events.find((e) => e.id === selectedEventId)?.latitude || 0
                }
                anchor={MAP_CONFIG.POPUP_ANCHOR}
                onClose={() => setSelectedEventId(null)}
                className="min-w-64"
              >
                {(() => {
                  const event = events.find((e) => e.id === selectedEventId);
                  if (!event) return null;
                  return (
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>📅 {formatShortDate(event.startDate)}</p>
                        <p>📍 {event.location}</p>
                        <p>🎯 {event.eventType}</p>
                        {event.cost && <p>💰 €{event.cost}</p>}
                      </div>
                      <Link
                        href={`/events/${event.id}`}
                        className="mt-3 inline-block px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  );
                })()}
              </Popup>
            )}

            {selectedClubId && viewMode === "clubs" && (
              <Popup
                longitude={
                  clubs.find((c) => c.id === selectedClubId)?.longitude || 0
                }
                latitude={
                  clubs.find((c) => c.id === selectedClubId)?.latitude || 0
                }
                anchor={MAP_CONFIG.POPUP_ANCHOR}
                onClose={() => setSelectedClubId(null)}
                className="min-w-64"
              >
                {(() => {
                  const club = clubs.find((c) => c.id === selectedClubId);
                  if (!club) return null;
                  return (
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {club.imageUrl ? (
                          <Image
                            src={club.imageUrl}
                            alt={club.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-primary font-bold">
                              {club.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <h3 className="font-bold text-lg text-gray-900">
                          {club.name}
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>📍 {club.location || "Location not specified"}</p>
                        {club.region && <p>🏴 {club.region}</p>}
                        {club.teamTypes && club.teamTypes.length > 0 && (
                          <div>
                            <p className="font-medium text-gray-700 mb-1">
                              Teams:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {club.teamTypes.map((type, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/clubs/${club.id}`}
                        className="mt-3 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  );
                })()}
              </Popup>
            )}
          </Map>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-professional p-6 min-w-48"
          >
            <h4 className="font-semibold text-gray-800 mb-3">Platform Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">🏛️ Clubs</span>
                <span className="font-semibold text-primary">
                  {clubs.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">🎯 Tournaments</span>
                <span className="font-semibold text-secondary">
                  {events.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">🌍 Countries</span>
                <span className="font-semibold text-primary-light">
                  {countries.length}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
