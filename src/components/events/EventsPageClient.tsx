"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CreateEventButton from "@/components/CreateEventButton";
import { formatEventDate } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  eventType: string;
  location: string;
  startDate: string;
  endDate: string | null;
  cost: number | null;
  description: string | null;
  imageUrl: string | null;
  cityDefaultImage?: string | null;
  latitude: number | null;
  longitude: number | null;
  visibility: "PUBLIC" | "PRIVATE";
  club: {
    id: string;
    name: string;
    imageUrl: string | null;
  } | null;
}

interface EventsPageClientProps {
  initialEvents: Event[];
  eventTypes: readonly string[];
  countries: string[];
}


export default function EventsPageClient({
  initialEvents,
  eventTypes,
  countries,
}: EventsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedEventType, setSelectedEventType] = useState(searchParams.get("type") || "");
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get("country") || "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("price") || "");
  const [visibility, setVisibility] = useState(searchParams.get("visibility") || "");
  const [showFilters, setShowFilters] = useState(false);
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = [...initialEvents];

    // Text search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.club?.name.toLowerCase().includes(query)
      );
    }

    // Event type filter
    if (selectedEventType) {
      filtered = filtered.filter((event) => event.eventType === selectedEventType);
    }

    // Country filter
    if (selectedCountry) {
      filtered = filtered.filter((event) =>
        event.location.includes(selectedCountry)
      );
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(
        (event) => new Date(event.startDate) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filtered = filtered.filter(
        (event) => new Date(event.startDate) <= new Date(dateTo)
      );
    }

    // Price filter
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter((event) => {
        if (event.cost === null) return priceRange === "free";
        if (priceRange === "free") return event.cost === 0;
        if (max === undefined) return event.cost >= min;
        return event.cost >= min && event.cost <= max;
      });
    }

    // Visibility filter
    if (visibility) {
      filtered = filtered.filter((event) => event.visibility === visibility);
    }

    // Sort by date (earliest first)
    filtered.sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    return filtered;
  }, [
    initialEvents,
    debouncedSearch,
    selectedEventType,
    selectedCountry,
    dateFrom,
    dateTo,
    priceRange,
    visibility,
  ]);

  // Update URL params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (selectedEventType) params.set("type", selectedEventType);
    if (selectedCountry) params.set("country", selectedCountry);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (priceRange) params.set("price", priceRange);
    if (visibility) params.set("visibility", visibility);

    const queryString = params.toString();
    router.push(`/events${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [
    debouncedSearch,
    selectedEventType,
    selectedCountry,
    dateFrom,
    dateTo,
    priceRange,
    visibility,
    router,
  ]);

  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedEventType("");
    setSelectedCountry("");
    setDateFrom("");
    setDateTo("");
    setPriceRange("");
    setVisibility("");
  };

  // Count active filters
  const activeFilterCount = [
    searchQuery,
    selectedEventType,
    selectedCountry,
    dateFrom,
    dateTo,
    priceRange,
    visibility,
  ].filter(Boolean).length;

  // Quick date filters
  const setQuickDateFilter = (preset: string) => {
    const today = new Date();
    const formatDateString = (date: Date) => date.toISOString().split("T")[0];

    switch (preset) {
      case "weekend":
        const friday = new Date(today);
        friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7));
        const sunday = new Date(friday);
        sunday.setDate(friday.getDate() + 2);
        setDateFrom(formatDateString(friday));
        setDateTo(formatDateString(sunday));
        break;
      case "month":
        setDateFrom(formatDateString(today));
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        setDateTo(formatDateString(nextMonth));
        break;
      case "summer":
        const summerStart = new Date(today.getFullYear(), 5, 1); // June 1
        const summerEnd = new Date(today.getFullYear(), 7, 31); // August 31
        setDateFrom(formatDateString(summerStart));
        setDateTo(formatDateString(summerEnd));
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-5xl font-bold mb-4">Tournaments & Events</h1>
          <p className="text-lg md:text-2xl mb-2">
            Discover GAA events across Europe
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Clear all ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, locations, clubs..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setQuickDateFilter("weekend")}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      This Weekend
                    </button>
                    <button
                      onClick={() => setQuickDateFilter("month")}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Next Month
                    </button>
                    <button
                      onClick={() => setQuickDateFilter("summer")}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Summer
                    </button>
                  </div>
                </div>
              </div>

              {/* Event Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Any Price</option>
                  <option value="free">Free</option>
                  <option value="0-50">€0 - €50</option>
                  <option value="50-100">€50 - €100</option>
                  <option value="100-200">€100 - €200</option>
                  <option value="200-999999">€200+</option>
                </select>
              </div>

              {/* Visibility */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Type
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Tournaments</option>
                  <option value="PUBLIC">Public (Open to all)</option>
                  <option value="PRIVATE">Private (European clubs only)</option>
                </select>
              </div>

            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Bar */}
            <div className="lg:hidden bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-white text-primary px-1.5 py-0.5 rounded-full text-xs font-semibold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Mobile Filters Dropdown */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={selectedEventType}
                          onChange={(e) => setSelectedEventType(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">All Types</option>
                          {eventTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <select
                          value={selectedCountry}
                          onChange={(e) => setSelectedCountry(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">All Countries</option>
                          {countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          placeholder="From"
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          placeholder="To"
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setQuickDateFilter("weekend")}
                          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                          This Weekend
                        </button>
                        <button
                          onClick={() => setQuickDateFilter("month")}
                          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                          Next Month
                        </button>
                        <button
                          onClick={() => setQuickDateFilter("summer")}
                          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                          Summer
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredEvents.length}</span> of{" "}
                <span className="font-semibold">{initialEvents.length}</span> events
              </p>
              <CreateEventButton />
            </div>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    Search: {searchQuery}
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedEventType && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    Type: {selectedEventType}
                    <button
                      onClick={() => setSelectedEventType("")}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                )}
                {(dateFrom || dateTo) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    Date: {dateFrom && formatEventDate(new Date(dateFrom))} - {dateTo && formatEventDate(new Date(dateTo))}
                    <button
                      onClick={() => {
                        setDateFrom("");
                        setDateTo("");
                      }}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} searchQuery={debouncedSearch} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No events found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, index, searchQuery }: { event: Event; index: number; searchQuery: string }) {
  // Highlight search terms
  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <Link href={`/events/${event.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          {event.imageUrl || event.cityDefaultImage ? (
            <Image
              src={event.imageUrl || event.cityDefaultImage || ""}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-5xl mb-2">🏆</div>
                <div className="text-lg font-bold">{event.eventType}</div>
              </div>
            </div>
          )}

          {/* Club Logo Badge */}
          {event.club?.imageUrl && (
            <div className="absolute top-2 left-2 w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-lg overflow-hidden border-2 border-white">
              <Image
                src={event.club.imageUrl}
                alt={event.club.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          )}

          {/* Visibility Badge */}
          {event.visibility === "PRIVATE" && (
            <div className="absolute top-2 right-2">
              <span className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-semibold">
                🔒 Private
              </span>
            </div>
          )}

          {/* Date Badge */}
          <div className="absolute bottom-2 left-2">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg">
              <p className="text-xs font-semibold text-gray-900">
                {formatEventDate(new Date(event.startDate))}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
            {searchQuery ? highlightText(event.title) : event.title}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-1">
            📍 {searchQuery ? highlightText(event.location) : event.location}
          </p>
          {event.cost !== null && (
            <p className="text-primary font-semibold">
              {event.cost === 0 ? "Free" : `€${event.cost}`}
            </p>
          )}
          {event.description && searchQuery && event.description.toLowerCase().includes(searchQuery.toLowerCase()) && (
            <p className="text-gray-500 text-sm mt-2 line-clamp-2">
              {highlightText(event.description)}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}