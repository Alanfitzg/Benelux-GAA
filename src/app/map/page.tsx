"use client";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import Map, {
  Marker,
  Popup,
  ViewStateChangeEvent,
  NavigationControl,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import type { Event } from "@/types";
import { MAP_CONFIG, URLS, EVENT_TYPES } from "@/lib/constants";
import { formatShortDate, hasValidCoordinates } from "@/lib/utils";
import {
  MapErrorBoundary,
  DataErrorBoundary,
} from "@/components/ErrorBoundary";
import {
  SidebarSkeleton,
  MapSkeleton,
  StatsCardSkeleton,
  SkeletonCard,
} from "@/components/ui/Skeleton";
import BottomSheet from "@/components/ui/BottomSheet";
import MobileLanding from "@/components/MobileLanding";

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
  verificationStatus?: string;
  verifiedAt?: string | null;
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

function MapContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<ClubMapItem[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
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

  // Mobile states
  const [isMobile, setIsMobile] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(true);
  const [showMobileLanding, setShowMobileLanding] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Show mobile landing for first-time mobile users
      if (mobile) {
        setShowMobileLanding(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
          // Simulate map loading delay for better UX
          setTimeout(() => setMapLoading(false), 500);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching events:", error);
          setEvents([]);
          setMapLoading(false);
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
          console.log(
            "Fetched clubs:",
            data?.clubs?.length || data?.length,
            "clubs"
          );
          if (Array.isArray(data)) {
            // Handle old API format (direct array)
            setClubs(data);
          } else if (data && Array.isArray(data.clubs)) {
            // Handle new API format (object with clubs array)
            setClubs(data.clubs);
          } else {
            console.error("Clubs data is not an array:", data);
            setClubs([]);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching clubs:", error);
          setClubs([]);
          setMapLoading(false);
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

  // Filter clubs for map display - exclude Ireland and UK clubs
  const mapDisplayClubs = useMemo(() => {
    return filteredClubs.filter((club) => {
      // Exclude by location text
      if (club.location) {
        const location = club.location.toLowerCase();
        // Exclude clubs from Ireland, United Kingdom, Northern Ireland (including all 6 counties), Scotland, Wales, England
        const excludedLocations = [
          "ireland",
          "united kingdom",
          "uk",
          "northern ireland",
          // Northern Ireland counties (6 counties)
          "antrim",
          "armagh",
          "down",
          "fermanagh",
          "tyrone",
          "derry",
          // Rest of UK
          "scotland",
          "wales",
          "england",
        ];

        if (excludedLocations.some((excluded) => location.includes(excluded))) {
          return false;
        }
      }

      // Also exclude by geographic coordinates (Ireland bounding box)
      // Ireland: Lat 51.4 to 55.4, Long -10.5 to -5.5
      // UK (excluding NI already covered): Lat 49.9 to 60.9, Long -8.2 to 1.8
      if (club.latitude && club.longitude) {
        const lat = club.latitude;
        const lng = club.longitude;

        // Exclude Ireland geographic area
        if (lat >= 51.4 && lat <= 55.4 && lng >= -10.5 && lng <= -5.5) {
          return false;
        }

        // Exclude Great Britain geographic area
        if (lat >= 49.9 && lat <= 60.9 && lng >= -8.2 && lng <= 1.8) {
          return false;
        }
      }

      return true;
    });
  }, [filteredClubs]);

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

  // Handle welcome message for new users
  useEffect(() => {
    const welcome = searchParams.get("welcome");
    if (welcome === "true") {
      setShowWelcome(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);

      // Clean up URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      window.history.replaceState({}, "", url.toString());

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Sidebar content component that works for both desktop and mobile
  const SidebarContent = () => (
    <>
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
              Clubs
            </button>
            <button
              onClick={() => setViewMode("tournaments")}
              className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-colors duration-200 ${
                viewMode === "tournaments" ? "text-primary" : "text-gray-600"
              }`}
            >
              Tournaments
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
                  Event Type
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
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-380px)] md:max-h-[calc(100vh-380px)]">
        <DataErrorBoundary>
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
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <SkeletonCard key={i} />
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
                        <p className="text-lg">No clubs found</p>
                      </div>
                    ) : (
                      filteredClubs.map((club, index) => (
                        <motion.div
                          key={club.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            handleClubClick(club);
                            if (isMobile) setBottomSheetOpen(false);
                          }}
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
                              <p className="text-sm text-gray-600 mt-1">
                                📍 {club.location || "Location not specified"}
                              </p>
                              {club.teamTypes && club.teamTypes.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {club.teamTypes.slice(0, 3).map((type, i) => (
                                    <span
                                      key={i}
                                      className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                                    >
                                      {type}
                                    </span>
                                  ))}
                                  {club.teamTypes.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{club.teamTypes.length - 3}
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
                      <p className="text-lg">No tournaments found</p>
                    </div>
                  ) : (
                    filteredEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          handleSidebarClick(event);
                          if (isMobile) setBottomSheetOpen(false);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          selectedEventId === event.id
                            ? "bg-secondary/10 border-secondary/30 shadow-md"
                            : "bg-white border-gray-200 hover:border-secondary/30"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">📅</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {event.title}
                            </h4>
                            <div className="space-y-1 mt-2 text-sm text-gray-600">
                              <p>📅 {formatShortDate(event.startDate)}</p>
                              <p className="truncate">📍 {event.location}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                                  {event.eventType}
                                </span>
                                {event.cost && (
                                  <span className="font-medium text-gray-900">
                                    €{event.cost}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </DataErrorBoundary>
      </div>
    </>
  );

  // Show mobile landing if mobile and not navigated yet
  if (isMobile && showMobileLanding) {
    return <MobileLanding />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Welcome Banner for New Users */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
          >
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Welcome to GAA Trips!</h3>
                    <p className="text-green-100 text-sm">
                      Your account has been created successfully. Start
                      exploring clubs and tournaments worldwide.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="text-white/80 hover:text-white transition-colors p-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Hide on mobile when navigated from landing */}
      {!isMobile && (
        <div className="relative bg-gradient-to-br from-primary to-primary/80 text-white py-12">
          <div className="relative h-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center px-6"
            >
              <h1 className="text-3xl font-bold mb-2 text-white">
                International Club Map
              </h1>
              <p className="text-sm text-white/90 font-light">
                No clubs on the island of Ireland are displayed
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div id="map-section" className="flex relative h-screen">
        {/* Desktop Sidebar */}
        {!isMobile &&
          (loading && status !== "loading" ? (
            <SidebarSkeleton />
          ) : (
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="hidden md:block w-96 bg-white shadow-professional-lg border-r border-gray-200/50 overflow-hidden"
            >
              <SidebarContent />
            </motion.div>
          ))}

        {/* Mobile Bottom Sheet */}
        {isMobile && (
          <BottomSheet
            isOpen={bottomSheetOpen}
            onClose={() => setBottomSheetOpen(false)}
            snapPoints={[0.1, 0.5, 0.9]}
            defaultSnap={1}
          >
            <SidebarContent />
          </BottomSheet>
        )}

        {/* Mobile Floating Action Buttons */}
        {isMobile && (
          <div className="fixed bottom-6 left-6 z-40 flex flex-col space-y-3">
            {/* Back to Landing Button */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setShowMobileLanding(true)}
              className="bg-secondary text-white rounded-full p-3 shadow-lg"
              title="Back to Home"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </motion.button>

            {/* Menu Button (only show when bottom sheet is closed) */}
            {!bottomSheetOpen && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setBottomSheetOpen(true)}
                className="bg-primary text-white rounded-full p-4 shadow-lg"
                title="Open Menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </motion.button>
            )}
          </div>
        )}

        {/* Enhanced Map */}
        <div className="flex-1 relative">
          <MapErrorBoundary>
            {mapLoading || status === "loading" ? (
              <MapSkeleton />
            ) : (
              <Map
                {...viewState}
                onMove={(evt: ViewStateChangeEvent) =>
                  setViewState(evt.viewState)
                }
                style={{ width: "100%", height: "100%" }}
                mapStyle={MAP_CONFIG.STYLE}
                mapboxAccessToken={MAPBOX_TOKEN}
              >
                <NavigationControl position="top-right" />
                {viewMode === "tournaments"
                  ? filteredEvents.map((event) => {
                      if (!hasValidCoordinates(event)) return null;
                      return (
                        <Marker
                          key={event.id}
                          longitude={event.longitude!}
                          latitude={event.latitude!}
                          anchor={MAP_CONFIG.MARKER_ANCHOR}
                          onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            console.log("Tournament marker clicked:", event.id);
                            setViewState({
                              longitude: event.longitude!,
                              latitude: event.latitude!,
                              zoom: MAP_CONFIG.SELECTED_ITEM_ZOOM,
                            });
                            setSelectedEventId(event.id);
                          }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className="cursor-pointer"
                          >
                            <div className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-3 border-secondary relative overflow-hidden">
                              {event.club?.imageUrl ? (
                                <Image
                                  src={event.club.imageUrl}
                                  alt={event.club.name}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full object-contain p-1 bg-white"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    {event.eventType === "Tournament"
                                      ? "T"
                                      : "F"}
                                  </span>
                                </div>
                              )}
                              {/* Selection ring */}
                              {selectedEventId === event.id && (
                                <div className="absolute inset-0 rounded-full border-2 border-secondary animate-pulse"></div>
                              )}
                            </div>
                          </motion.div>
                        </Marker>
                      );
                    })
                  : mapDisplayClubs.map((club) => {
                      if (!hasValidCoordinates(club)) return null;
                      return (
                        <Marker
                          key={club.id}
                          longitude={club.longitude!}
                          latitude={club.latitude!}
                          anchor={MAP_CONFIG.MARKER_ANCHOR}
                          onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            console.log("Club marker clicked:", club.id);
                            setViewState({
                              longitude: club.longitude!,
                              latitude: club.latitude!,
                              zoom: MAP_CONFIG.SELECTED_ITEM_ZOOM,
                            });
                            setSelectedClubId(club.id);
                          }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className="cursor-pointer relative"
                          >
                            <div
                              className={`w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-3 ${
                                club.verificationStatus === "VERIFIED"
                                  ? "border-green-500"
                                  : "border-primary"
                              } relative overflow-hidden`}
                            >
                              {club.imageUrl ? (
                                <Image
                                  src={club.imageUrl}
                                  alt={club.name}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full object-contain p-1 bg-white"
                                />
                              ) : (
                                <div
                                  className={`w-8 h-8 ${
                                    club.verificationStatus === "VERIFIED"
                                      ? "bg-green-500"
                                      : "bg-primary"
                                  } rounded-full flex items-center justify-center`}
                                >
                                  <span className="text-white font-bold text-sm">
                                    {club.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              {/* Selection ring */}
                              {selectedClubId === club.id && (
                                <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse"></div>
                              )}
                            </div>
                            {/* Verified badge */}
                            {club.verificationStatus === "VERIFIED" && (
                              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </motion.div>
                        </Marker>
                      );
                    })}

                {/* Enhanced Popups */}
                {selectedEventId && viewMode === "tournaments" && (
                  <Popup
                    longitude={
                      events.find((e) => e.id === selectedEventId)?.longitude ||
                      0
                    }
                    latitude={
                      events.find((e) => e.id === selectedEventId)?.latitude ||
                      0
                    }
                    anchor={MAP_CONFIG.POPUP_ANCHOR}
                    onClose={() => setSelectedEventId(null)}
                    className="min-w-64"
                  >
                    {(() => {
                      const event = events.find(
                        (e) => e.id === selectedEventId
                      );
                      if (!event) return null;
                      return (
                        <div className="p-4">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">
                            {event.title}
                          </h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>📅 {formatShortDate(event.startDate)}</p>
                            <p>📍 {event.location}</p>
                            <p>{event.eventType}</p>
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
                      Array.isArray(clubs)
                        ? clubs.find((c) => c.id === selectedClubId)
                            ?.longitude || 0
                        : 0
                    }
                    latitude={
                      Array.isArray(clubs)
                        ? clubs.find((c) => c.id === selectedClubId)
                            ?.latitude || 0
                        : 0
                    }
                    anchor={MAP_CONFIG.POPUP_ANCHOR}
                    onClose={() => setSelectedClubId(null)}
                    className="min-w-64"
                  >
                    {(() => {
                      const club = Array.isArray(clubs)
                        ? clubs.find((c) => c.id === selectedClubId)
                        : null;
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
                                className="w-10 h-10 rounded-lg object-contain p-1 bg-gray-100"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="text-primary font-bold">
                                  {club.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900">
                                {club.name}
                              </h3>
                              {club.verificationStatus === "VERIFIED" && (
                                <div className="flex items-center gap-1 text-green-600 text-xs">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="font-medium">
                                    Verified Club
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>
                              📍 {club.location || "Location not specified"}
                            </p>
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
            )}
          </MapErrorBoundary>

          {/* Floating Stats */}
          {loading || status === "loading" ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-6 right-6"
            >
              <StatsCardSkeleton />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-professional p-6 min-w-48"
            >
              <h4 className="font-semibold text-gray-800 mb-3">Map Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Clubs on Map</span>
                  <span className="font-semibold text-primary">
                    {viewMode === "clubs"
                      ? mapDisplayClubs.length
                      : clubs.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tournaments</span>
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
              {viewMode === "clubs" && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  * All Ireland (incl. NI) & UK clubs hidden
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}
