"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import VerifiedBadge, {
  VerifiedTooltip,
} from "@/components/club/VerifiedBadge";

type ClubListItem = {
  id: string;
  name: string;
  map: string | null;
  imageUrl: string | null;
  region: string | null;
  subRegion: string | null;
  location: string | null;
  facebook: string | null;
  instagram: string | null;
  website: string | null;
  codes: string | null;
  teamTypes: string[];
  verificationStatus?: string;
  verifiedAt?: string | null;
};

export const dynamic = "force-dynamic";

// Country flag mapping - using flag emoji or flag icon URLs
const countryFlags: Record<string, string> = {
  // Europe
  Austria: "🇦🇹",
  Belgium: "🇧🇪",
  Croatia: "🇭🇷",
  "Czech Republic": "🇨🇿",
  Denmark: "🇩🇰",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Estonia: "🇪🇪",
  Finland: "🇫🇮",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Gibraltar: "🇬🇮",
  Hungary: "🇭🇺",
  Iceland: "🇮🇸",
  Ireland: "🇮🇪",
  "Isle of Man": "🇮🇲",
  Italy: "🇮🇹",
  Luxembourg: "🇱🇺",
  Netherlands: "🇳🇱",
  "The Netherlands": "🇳🇱",
  Norway: "🇳🇴",
  Poland: "🇵🇱",
  Portugal: "🇵🇹",
  Romania: "🇷🇴",
  Russia: "🇷🇺",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Slovakia: "🇸🇰",
  Slovenia: "🇸🇮",
  Spain: "🇪🇸",
  Sweden: "🇸🇪",
  Switzerland: "🇨🇭",
  "United Kingdom": "🇬🇧",
  UK: "🇬🇧",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",

  // North America
  Canada: "🇨🇦",
  "Cayman Island": "🇰🇾",
  Mexico: "🇲🇽",
  "United States": "🇺🇸",

  // Asia
  Cambodia: "🇰🇭",
  China: "🇨🇳",
  "Hong Kong": "🇭🇰",
  India: "🇮🇳",
  Indonesia: "🇮🇩",
  Japan: "🇯🇵",
  Malaysia: "🇲🇾",
  Myanmar: "🇲🇲",
  Pakistan: "🇵🇰",
  Singapore: "🇸🇬",
  Signapore: "🇸🇬", // Typo in database
  "South Korea": "🇰🇷",
  Taiwan: "🇹🇼",
  Thailand: "🇹🇭",
  Vietnam: "🇻🇳",

  // Middle East
  Bahrain: "🇧🇭",
  Kuwait: "🇰🇼",
  Oman: "🇴🇲",
  Qatar: "🇶🇦",
  "Saudi Arabia": "🇸🇦",
  UAE: "🇦🇪",

  // Australasia
  Australia: "🇦🇺",
  "New Zealand": "🇳🇿",

  // Africa
  Kenya: "🇰🇪",
  Nigeria: "🇳🇬",
  "South Africa": "🇿🇦",
  Uganda: "🇺🇬",

  // South America
  Argentina: "🇦🇷",
  Brazil: "🇧🇷",
  Chile: "🇨🇱",
  Paraguay: "🇵🇾",

  // Other
  "Channel Islands": "🇯🇪", // Using Jersey flag as representative
};

export default function ClubsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [clubs, setClubs] = useState<ClubListItem[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [teamTypes, setTeamTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedTeamType, setSelectedTeamType] = useState("");
  const [viewMode, setViewMode] = useState<"countries" | "list">("countries");

  // European countries filter
  const europeanCountries = [
    "France",
    "Romania",
    "Denmark",
    "Croatia",
    "Poland",
    "Germany",
    "Italy",
    "Netherlands",
    "Belgium",
    "Switzerland",
    "Austria",
    "Luxembourg",
    "Spain",
    "Gibraltar",
    "Sweden",
    "Finland",
    "Russia",
    "Norway",
    "Portugal",
    "Slovenia",
  ];

  // Get current filter values from URL
  const country = searchParams.get("country") || "";
  const teamType = searchParams.get("teamType") || "";
  const search = searchParams.get("search") || "";

  // Initialize form fields with URL parameters
  useEffect(() => {
    setSearchTerm(search);
    setSelectedCountry(country);
    setSelectedTeamType(teamType);
  }, [search, country, teamType]);

  // Fetch clubs data
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (country) params.append("country", country);
        if (teamType) params.append("teamType", teamType);
        if (search) params.append("search", search);

        const response = await fetch(`/api/clubs?${params.toString()}`);
        const data = await response.json();

        setClubs(data.clubs || []);
        setCountries(data.countries || []);
        setTeamTypes(data.teamTypes || []);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [country, teamType, search]);

  // Filter clubs based on search, team type, and European countries only
  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      !search ||
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.location?.toLowerCase().includes(search.toLowerCase());

    const matchesTeamType =
      !teamType ||
      club.teamTypes.some((type) =>
        type.toLowerCase().includes(teamType.toLowerCase())
      );

    // Only show European clubs
    const clubCountry = club.location?.split(",").pop()?.trim() || "Unknown";
    const isEuropean = europeanCountries.includes(clubCountry);

    return matchesSearch && matchesTeamType && isEuropean;
  });

  // Group filtered clubs by country
  const clubsByCountry = filteredClubs.reduce(
    (acc: Record<string, ClubListItem[]>, club) => {
      const country = club.location?.split(",").pop()?.trim() || "Unknown";
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(club);
      return acc;
    },
    {}
  );

  // Sort countries alphabetically
  const sortedCountries = Object.keys(clubsByCountry).sort();

  // Get clubs for the selected country (if any)
  const selectedCountryClubs =
    selectedCountry || country
      ? filteredClubs.filter((club) => {
          const clubCountry =
            club.location?.split(",").pop()?.trim() || "Unknown";
          return clubCountry === (selectedCountry || country);
        })
      : [];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (selectedCountry) params.append("country", selectedCountry);
    if (selectedTeamType) params.append("teamType", selectedTeamType);
    router.push(`/clubs?${params.toString()}`);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCountry("");
    setSelectedTeamType("");
    setViewMode("countries");
    router.push("/clubs");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-8 md:py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Clubs / Cities
            </h1>
            <p className="text-xl md:text-2xl mb-2">
              Discover the international community of clubs
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-5xl font-bold mb-4">
            European GAA Clubs
          </h1>
          <p className="text-lg md:text-2xl mb-2">
            Discover GAA clubs across Europe
          </p>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white py-8 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">
            {/* View Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50 p-1">
                <button
                  onClick={() => setViewMode("countries")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "countries"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:text-primary"
                  }`}
                >
                  <span className="flex items-center gap-2">
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
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                    Country Cards
                  </span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:text-primary"
                  }`}
                >
                  <span className="flex items-center gap-2">
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
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    Club List
                  </span>
                </button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-center">
              {/* Mobile: Two filters per row */}
              <div className="grid grid-cols-2 md:flex gap-2 md:gap-4 w-full md:w-auto">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="text-sm md:text-base px-2 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All European Countries</option>
                  {countries
                    .filter((country) => europeanCountries.includes(country))
                    .map((country: string) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                </select>
                <select
                  value={selectedTeamType}
                  onChange={(e) => setSelectedTeamType(e.target.value)}
                  className="text-sm md:text-base px-2 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Team Types</option>
                  {teamTypes.map((type: string) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:min-w-[250px] text-sm md:text-base px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />

              {/* Buttons */}
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={handleSearch}
                  className="flex-1 md:flex-none text-sm md:text-base bg-primary text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
                >
                  Search
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 md:flex-none text-sm md:text-base bg-gray-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Countries Grid or Club List */}
      <div className="container mx-auto px-4 py-12">
        {(selectedCountry || country) && viewMode === "countries" ? (
          // Show clubs for selected country
          <div>
            {/* Back to countries button */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setSelectedCountry("");
                  router.push("/clubs");
                }}
                className="flex items-center gap-2 text-primary hover:text-primary/90 transition"
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
                Back to All Countries
              </button>
            </div>

            {/* Country header */}
            <div className="flex items-center gap-4 mb-8">
              {countryFlags[selectedCountry || country] && (
                <div className="text-6xl">
                  {countryFlags[selectedCountry || country]}
                </div>
              )}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedCountry || country}
                </h2>
                <p className="text-gray-600">
                  {selectedCountryClubs.length} club
                  {selectedCountryClubs.length !== 1 ? "s" : ""} found
                  {(search || teamType) && (
                    <span className="text-primary ml-1">(filtered)</span>
                  )}
                </p>
              </div>
            </div>

            {/* Clubs grid */}
            <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
              {selectedCountryClubs.map((club) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
                >
                  <Link href={`/clubs/${club.id}`} className="block">
                    {/* Club image */}
                    <div className="relative aspect-square bg-gray-50">
                      {club.imageUrl ? (
                        <Image
                          src={club.imageUrl}
                          alt={club.name}
                          fill
                          className="object-contain p-4"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                          🏟️
                        </div>
                      )}
                      {/* Verified badge */}
                      {club.verificationStatus === "VERIFIED" && (
                        <div className="absolute top-2 right-2 md:top-3 md:right-3">
                          <VerifiedTooltip>
                            <div className="bg-white rounded-full shadow-md p-1">
                              <VerifiedBadge size="sm" showText={false} />
                            </div>
                          </VerifiedTooltip>
                        </div>
                      )}
                    </div>

                    {/* Club details */}
                    <div className="p-2 md:p-4">
                      <h3 className="text-xs md:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                        {club.name}
                      </h3>
                      {club.location && (
                        <p className="text-xs md:text-sm text-gray-500 truncate">
                          City: {club.location.split(",")[0]}
                        </p>
                      )}
                      {club.teamTypes.length > 0 && (
                        <p className="hidden md:block text-xs text-gray-400 mt-1 truncate">
                          Grades: {club.teamTypes.slice(0, 3).join(", ")}
                          {club.teamTypes.length > 3 && "..."}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {selectedCountryClubs.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏟️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No clubs found in {selectedCountry || country}
                  {(search || teamType) && " matching your criteria"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {search || teamType
                    ? "Try adjusting your search criteria or clear filters"
                    : "Try searching for a different country or browse all clubs"}
                </p>
                <button
                  onClick={() => {
                    setSelectedCountry("");
                    router.push("/clubs");
                  }}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
                >
                  Show All Countries
                </button>
              </div>
            )}
          </div>
        ) : viewMode === "countries" ? (
          // Show countries grid
          <div>
            {/* Filter indicator */}
            {(search || teamType) && (
              <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                      />
                    </svg>
                    <span className="text-primary font-medium">
                      Filters Active:
                      {search && (
                        <span className="ml-1">&quot;{search}&quot;</span>
                      )}
                      {search && teamType && <span className="mx-1">•</span>}
                      {teamType && <span className="ml-1">{teamType}</span>}
                    </span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-primary hover:text-primary/90 text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <p className="text-primary/90 text-sm mt-1">
                  Showing {Object.keys(clubsByCountry).length} countries with{" "}
                  {filteredClubs.length} clubs total
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {sortedCountries.map((country) => (
                <motion.div
                  key={country}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  <Link
                    href={`/clubs?country=${encodeURIComponent(country)}`}
                    className="block bg-white rounded-lg p-3 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 text-center group-hover:scale-105"
                  >
                    <div className="mb-2 md:mb-4">
                      {countryFlags[country] ? (
                        <div className="text-3xl md:text-6xl mb-1 md:mb-3">
                          {countryFlags[country]}
                        </div>
                      ) : (
                        <div className="w-12 h-8 md:w-16 md:h-12 bg-gray-200 rounded mx-auto mb-1 md:mb-3 flex items-center justify-center">
                          <span className="text-gray-500 text-xs md:text-sm">
                            Flag
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm md:text-lg font-semibold text-gray-800 mb-1 md:mb-2">
                      {country}
                    </h3>
                    <p className="text-lg md:text-2xl font-bold text-primary">
                      ({clubsByCountry[country].length})
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>

            {sortedCountries.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No clubs found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search criteria or browse all clubs
                </p>
                <button
                  onClick={handleReset}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
                >
                  Show All Clubs
                </button>
              </div>
            )}
          </div>
        ) : (
          // Show expanded club list view
          <div>
            {/* Filter indicator */}
            {(search || teamType) && (
              <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                      />
                    </svg>
                    <span className="text-primary font-medium">
                      Filters Active:
                      {search && (
                        <span className="ml-1">&quot;{search}&quot;</span>
                      )}
                      {search && teamType && <span className="mx-1">•</span>}
                      {teamType && <span className="ml-1">{teamType}</span>}
                    </span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-primary hover:text-primary/90 text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <p className="text-primary/90 text-sm mt-1">
                  Showing {filteredClubs.length} clubs total
                </p>
              </div>
            )}

            {/* Clubs organized by country */}
            <div className="space-y-8">
              {sortedCountries.map((country) => (
                <div
                  key={country}
                  className="border-b border-gray-200 pb-8 last:border-b-0"
                >
                  {/* Country header */}
                  <div className="flex items-center gap-4 mb-6">
                    {countryFlags[country] && (
                      <div className="text-3xl md:text-4xl">
                        {countryFlags[country]}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                        {country}
                      </h2>
                      <p className="text-sm md:text-base text-gray-600">
                        {clubsByCountry[country].length} club
                        {clubsByCountry[country].length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Clubs grid for this country */}
                  <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
                    {clubsByCountry[country].map((club) => (
                      <motion.div
                        key={club.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
                      >
                        <Link href={`/clubs/${club.id}`} className="block">
                          {/* Club image */}
                          <div className="relative aspect-square bg-gray-50">
                            {club.imageUrl ? (
                              <Image
                                src={club.imageUrl}
                                alt={club.name}
                                fill
                                className="object-contain p-4"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                                🏟️
                              </div>
                            )}
                            {/* Verified badge */}
                            {club.verificationStatus === "VERIFIED" && (
                              <div className="absolute top-2 right-2 md:top-3 md:right-3">
                                <VerifiedTooltip>
                                  <div className="bg-white rounded-full shadow-md p-1">
                                    <VerifiedBadge size="sm" showText={false} />
                                  </div>
                                </VerifiedTooltip>
                              </div>
                            )}
                          </div>

                          {/* Club details */}
                          <div className="p-2 md:p-4">
                            <h3 className="text-xs md:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                              {club.name}
                            </h3>
                            {club.location && (
                              <p className="text-xs md:text-sm text-gray-500 truncate">
                                City: {club.location.split(",")[0]}
                              </p>
                            )}
                            {club.teamTypes.length > 0 && (
                              <p className="hidden md:block text-xs text-gray-400 mt-1 truncate">
                                Grades: {club.teamTypes.slice(0, 3).join(", ")}
                                {club.teamTypes.length > 3 && "..."}
                              </p>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredClubs.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No clubs found
                  {(search || teamType) && " matching your criteria"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {search || teamType
                    ? "Try adjusting your search criteria or clear filters"
                    : "Try adjusting your search criteria or browse all clubs"}
                </p>
                <button
                  onClick={handleReset}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
                >
                  {search || teamType ? "Clear Filters" : "Show All Clubs"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
