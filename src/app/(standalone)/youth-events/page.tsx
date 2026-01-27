"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  youthEvents,
  months,
  getEventCountForMonth,
  groupEventsByMonth,
  type YouthEvent,
} from "./data";

function generateICalEvent(event: YouthEvent): string {
  const dateMatch = event.date.match(/(\w+)\s+(\d+)/);
  if (!dateMatch) return "";

  const monthIndex = months.indexOf(event.month);
  const day = parseInt(dateMatch[2]);
  const startDate = new Date(event.year, monthIndex, day);

  const formatDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const endDate = new Date(startDate);
  if (event.duration.includes("24")) {
    endDate.setDate(endDate.getDate() + 1);
  } else {
    endDate.setHours(endDate.getHours() + 5);
  }

  return `BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT`;
}

function downloadICalFile(events: YouthEvent[], filename: string) {
  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GGE Youth Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events.map(generateICalEvent).join("\n")}
END:VCALENDAR`;

  const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function EventCard({
  event,
  viewMode,
}: {
  event: YouthEvent;
  viewMode: "grid" | "list";
}) {
  const isGoGames = event.title.toLowerCase().includes("go games");
  const isFeile = event.title.toLowerCase().includes("feile");

  if (viewMode === "list") {
    return (
      <Link
        href={`/youth-events/${event.id}`}
        className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden hover:border-[#1B4B8F]/30 hover:shadow-lg transition-all duration-300 flex group cursor-pointer"
      >
        <div className="relative w-28 md:w-56 h-28 md:h-40 flex-shrink-0 bg-gray-100">
          {event.region && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-[#F5B800] px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold text-[#1B4B8F]">
              {event.region}
            </div>
          )}
          {isGoGames ? (
            <div className="w-full h-full bg-[#1e3a5f] flex items-center justify-center p-2 md:p-4">
              <div className="text-center">
                <div className="text-sm md:text-xl font-bold text-white">
                  GO
                </div>
                <div className="text-base md:text-2xl font-black text-white">
                  GAMES
                </div>
              </div>
            </div>
          ) : isFeile && event.title.includes("European") ? (
            <div className="w-full h-full bg-gradient-to-br from-[#1B4B8F] to-[#2563eb] flex items-center justify-center p-2 md:p-4">
              <div className="text-center">
                <div className="text-xs md:text-lg font-bold text-[#F5B800]">
                  EUROPEAN
                </div>
                <div className="text-sm md:text-xl font-black text-white">
                  FÉILE
                </div>
              </div>
            </div>
          ) : (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          )}
        </div>
        <div className="flex-1 p-3 md:p-5 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1 md:mb-2">
              <h3 className="text-sm md:text-lg font-bold text-gray-900 group-hover:text-[#1B4B8F] transition-colors line-clamp-2">
                {event.title}
              </h3>
              <span className="hidden md:inline-block px-2.5 py-1 bg-[#1B4B8F]/10 rounded-lg text-xs font-semibold text-[#1B4B8F] uppercase flex-shrink-0">
                {event.sport}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
              <svg
                className="w-3 h-3 md:w-4 md:h-4 text-[#1B4B8F] flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className="truncate">{event.location}</span>
            </div>
            <p className="hidden md:block text-sm text-gray-500 line-clamp-1">
              {event.description}
            </p>
          </div>
          <div className="flex items-center mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 md:gap-2 text-[#1B4B8F] font-semibold">
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs md:text-sm">{event.date}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/youth-events/${event.id}`}
      className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden hover:border-[#1B4B8F]/30 hover:shadow-lg transition-all duration-300 group cursor-pointer block"
    >
      <div className="relative h-40 md:h-52 bg-gray-100">
        {event.region && (
          <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-[#F5B800] px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold text-[#1B4B8F]">
            {event.region}
          </div>
        )}
        {isGoGames ? (
          <div className="w-full h-full bg-[#1e3a5f] flex items-center justify-center p-4 md:p-6">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-white mb-0.5 md:mb-1">
                GO
              </div>
              <div className="text-3xl md:text-5xl font-black text-white">
                GAMES
              </div>
              <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-1.5 md:mt-2 text-white/80 text-[10px] md:text-xs">
                <span>GAA</span>
                <span>LGFA</span>
                <span>Camogie</span>
              </div>
            </div>
          </div>
        ) : isFeile && event.title.includes("European") ? (
          <div className="w-full h-full bg-gradient-to-br from-[#1B4B8F] to-[#2563eb] flex items-center justify-center p-4 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-[#F5B800]">
                EUROPEAN
              </div>
              <div className="text-xl md:text-3xl font-black text-white">
                FÉILE
              </div>
              <div className="text-[10px] md:text-xs text-white/80 mt-0.5 md:mt-1">
                GAELIC GAMES EUROPE
              </div>
            </div>
          </div>
        ) : (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        )}
      </div>

      <div className="p-3 md:p-5">
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-[#1B4B8F]/10 rounded-md md:rounded-lg text-[10px] md:text-xs font-semibold text-[#1B4B8F] uppercase">
            {event.sport}
          </span>
        </div>

        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5 md:mb-2 group-hover:text-[#1B4B8F] transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
          <svg
            className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1B4B8F] flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span className="truncate">{event.location}</span>
        </div>

        <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center gap-1.5 md:gap-2 pt-3 md:pt-4 border-t border-gray-100 text-[#1B4B8F] font-semibold">
          <svg
            className="w-4 h-4 md:w-5 md:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs md:text-sm">{event.date}</span>
        </div>
      </div>
    </Link>
  );
}

export default function YouthEventsPage() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = useMemo(() => {
    let events = youthEvents.filter((e) => e.year === selectedYear);

    if (selectedMonth) {
      events = events.filter((e) => e.month === selectedMonth);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.location.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.sport.toLowerCase().includes(query)
      );
    }

    return events;
  }, [selectedYear, selectedMonth, searchQuery]);

  const groupedEvents = groupEventsByMonth(filteredEvents);

  const handleExportICal = () => {
    downloadICalFile(filteredEvents, `gge-youth-events-${selectedYear}.ics`);
  };

  const monthsWithEvents = months.filter(
    (m) => getEventCountForMonth(youthEvents, m, selectedYear) > 0
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#1B4B8F] via-[#152d54] to-[#1B4B8F] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#F5B800] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F5B800] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 py-4 md:py-8 relative">
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-4">
              <a
                href="https://gaelicgameseurope.com"
                className="text-white/60 hover:text-white transition-colors p-1"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </a>
              {/* Year Selector - Mobile */}
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => y - 1)}
                  className="p-2 hover:bg-white/10 rounded-md transition-colors text-white"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="text-lg font-black text-white px-2">
                  {selectedYear}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => y + 1)}
                  className="p-2 hover:bg-white/10 rounded-md transition-colors text-white"
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-white rounded-xl p-1.5 shadow-lg flex-shrink-0">
                <Image
                  src="/images/gge-crest.png"
                  alt="Gaelic Games Europe"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  GGE Youth
                </h1>
                <p className="text-[#F5B800] font-semibold text-sm">
                  European Youth Events Calendar
                </p>
              </div>
            </div>
            {/* Stats Row - Mobile */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#F5B800] rounded-lg flex items-center justify-center">
                  <span className="text-[#1B4B8F] font-black text-sm">
                    {filteredEvents.length}
                  </span>
                </div>
                <span className="text-white/80 text-xs font-medium">
                  Events
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">8+</span>
                </div>
                <span className="text-white/80 text-xs font-medium">
                  Countries
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <a
                  href="https://gaelicgameseurope.com"
                  className="text-white/60 hover:text-white transition-colors"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </a>
                <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-lg">
                  <Image
                    src="/images/gge-crest.png"
                    alt="Gaelic Games Europe"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tight">
                    GGE Youth
                  </h1>
                  <p className="text-[#F5B800] font-semibold">
                    European Youth Events Calendar
                  </p>
                </div>
              </div>

              {/* Year Selector - Desktop */}
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => y - 1)}
                  className="p-2.5 hover:bg-white/10 rounded-lg transition-colors text-white"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="text-2xl font-black text-white px-4">
                  {selectedYear}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => y + 1)}
                  className="p-2.5 hover:bg-white/10 rounded-lg transition-colors text-white"
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stats Row - Desktop */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#F5B800] rounded-xl flex items-center justify-center">
                  <span className="text-[#1B4B8F] font-black text-lg">
                    {filteredEvents.length}
                  </span>
                </div>
                <span className="text-white/80 text-sm font-medium">
                  Events
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-lg">8+</span>
                </div>
                <span className="text-white/80 text-sm font-medium">
                  Countries
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Month Timeline - Horizontal Scroll */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center gap-1.5 md:gap-2 py-3 md:py-4 overflow-x-auto scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
            <button
              type="button"
              onClick={() => setSelectedMonth(null)}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all flex-shrink-0 ${
                !selectedMonth
                  ? "bg-[#1B4B8F] text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {months.map((month) => {
              const eventCount = getEventCountForMonth(
                youthEvents,
                month,
                selectedYear
              );
              const isSelected = selectedMonth === month;
              const hasEvents = eventCount > 0;

              if (!hasEvents) return null;

              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => setSelectedMonth(isSelected ? null : month)}
                  className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all flex-shrink-0 flex items-center gap-1.5 md:gap-2 ${
                    isSelected
                      ? "bg-[#1B4B8F] text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span className="hidden sm:inline">{month}</span>
                  <span className="sm:hidden">{month.slice(0, 3)}</span>
                  <span
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs font-semibold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[#1B4B8F]/10 text-[#1B4B8F]"
                    }`}
                  >
                    {eventCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400"
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
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-[#1B4B8F]/30 focus:border-[#1B4B8F] transition-all text-gray-900 placeholder:text-gray-400 text-sm md:text-base"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg md:rounded-xl p-0.5 md:p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 md:p-2.5 rounded-md md:rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-[#1B4B8F]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Grid View"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 md:p-2.5 rounded-md md:rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-[#1B4B8F]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="List View"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
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
              </button>
            </div>

            {/* Export Button - Desktop Only */}
            <button
              type="button"
              onClick={handleExportICal}
              className="hidden md:flex items-center gap-2 px-5 py-3 bg-[#F5B800] text-[#1B4B8F] rounded-xl hover:bg-[#F5B800]/90 transition-colors font-bold text-sm shadow-sm"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Events Content */}
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Active Filters */}
        {(selectedMonth || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-gray-500">Filters:</span>
            {selectedMonth && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B4B8F]/10 text-[#1B4B8F] rounded-full text-sm font-medium">
                {selectedMonth}
                <button
                  type="button"
                  onClick={() => setSelectedMonth(null)}
                  className="hover:text-[#1B4B8F]/70"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B4B8F]/10 text-[#1B4B8F] rounded-full text-sm font-medium">
                &quot;{searchQuery}&quot;
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="hover:text-[#1B4B8F]/70"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedMonth(null);
                setSearchQuery("");
              }}
              className="text-sm text-gray-500 hover:text-[#1B4B8F] underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-[#1B4B8F]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-[#1B4B8F]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Events Found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? `No events match "${searchQuery}"`
                : selectedMonth
                  ? `No events scheduled for ${selectedMonth} ${selectedYear}`
                  : `No events scheduled for ${selectedYear}`}
            </p>
            {(searchQuery || selectedMonth) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedMonth(null);
                }}
                className="px-6 py-3 bg-[#1B4B8F] text-white rounded-xl font-semibold hover:bg-[#1B4B8F]/90 transition-colors"
              >
                View All Events
              </button>
            )}
          </div>
        )}

        {/* Events Grid/List */}
        {groupedEvents.map(({ month, events }) => (
          <div key={month} className="mb-8 md:mb-12">
            {/* Month Header */}
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1B4B8F] rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900">
                    {month}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500">
                    {events.length} event{events.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>

            {/* Events */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                  : "space-y-3 md:space-y-4"
              }
            >
              {events.map((event) => (
                <EventCard key={event.id} event={event} viewMode={viewMode} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-[#1B4B8F] to-[#2563eb]">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl p-1.5 md:p-2">
                <Image
                  src="/images/gge-crest.png"
                  alt="GGE"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg md:text-xl">
                  Want to host a youth event?
                </h3>
                <p className="text-white/80 text-sm md:text-base">
                  Contact Gaelic Games Europe to register your tournament.
                </p>
              </div>
            </div>
            <a
              href="https://gaelicgameseurope.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 md:px-8 py-3 md:py-4 bg-[#F5B800] text-[#1B4B8F] rounded-xl font-bold text-sm md:text-base hover:bg-[#F5B800]/90 transition-colors shadow-lg"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
