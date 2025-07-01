"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
};

export const dynamic = "force-dynamic";

export default function ClubsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [clubs, setClubs] = useState<ClubListItem[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [teamTypes, setTeamTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get current filter values from URL
  const country = searchParams.get('country') || '';
  const teamType = searchParams.get('teamType') || '';
  const search = searchParams.get('search') || '';

  // Detect mobile screen and set initial filter state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Set initial filter state based on screen size (only on first load)
      if (!isInitialized) {
        setFiltersOpen(!mobile); // Open on desktop, closed on mobile
        setIsInitialized(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isInitialized]);

  // Fetch clubs data
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (country) params.append('country', country);
        if (teamType) params.append('teamType', teamType);
        if (search) params.append('search', search);
        
        const response = await fetch(`/api/clubs?${params.toString()}`);
        const data = await response.json();
        
        setClubs(data.clubs || []);
        setCountries(data.countries || []);
        setTeamTypes(data.teamTypes || []);
      } catch (error) {
        console.error('Error fetching clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [country, teamType, search]);

  // Group clubs by country
  const clubsByCountry = clubs.reduce((acc: Record<string, ClubListItem[]>, club) => {
    const country = club.location?.split(",").pop()?.trim() || "Unknown";
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(club);
    return acc;
  }, {});

  // Sort countries alphabetically
  const sortedCountries = Object.keys(clubsByCountry).sort();

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    
    const searchValue = formData.get('search') as string;
    const countryValue = formData.get('country') as string;
    const teamTypeValue = formData.get('teamType') as string;
    
    if (searchValue) params.append('search', searchValue);
    if (countryValue) params.append('country', countryValue);
    if (teamTypeValue) params.append('teamType', teamTypeValue);
    
    router.push(`/clubs?${params.toString()}`);
  };

  const handleReset = () => {
    router.push('/clubs');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">GAA Clubs Worldwide</h1>
          <p className="text-xl md:text-2xl mb-2">
            Connect with Gaelic Athletic Association clubs around the world
          </p>
          <p className="text-lg opacity-90">
            Find your local GAA community and join the global Gaelic games family
          </p>
          <Link
            href="/clubs/register"
            className="inline-block mt-6 bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            Register a Club
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
      
      {/* Filter Toggle Button - Only show on mobile */}
      {isMobile && (
        <div className="mb-4">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-700">Filters</span>
            <motion.svg
              animate={{ rotate: filtersOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
        </div>
      )}

      {/* Filters - Always visible on desktop, collapsible on mobile */}
      {!isMobile ? (
        /* Desktop - Always visible */
        <div className="mb-8">
          <form onSubmit={handleFilterSubmit} className="bg-white p-6 rounded-lg shadow-sm flex flex-wrap gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search clubs..."
              defaultValue={search}
              className="flex-1 min-w-64 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
            />
            <select
              name="country"
              defaultValue={country}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
            >
              <option value="">All Countries</option>
              {countries.map((country: string) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <select
              name="teamType"
              defaultValue={teamType}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
            >
              <option value="">All Team Types</option>
              {teamTypes.map((type: string) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm hover:shadow-md font-semibold"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition shadow-sm hover:shadow-md font-semibold"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Mobile - Collapsible */
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8"
            >
              <form onSubmit={handleFilterSubmit} className="bg-white p-6 rounded-lg shadow-sm flex flex-wrap gap-4">
                <input
                  type="text"
                  name="search"
                  placeholder="Search clubs..."
                  defaultValue={search}
                  className="flex-1 min-w-64 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                />
                <select
                  name="country"
                  defaultValue={country}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="">All Countries</option>
                  {countries.map((country: string) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <select
                  name="teamType"
                  defaultValue={teamType}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="">All Team Types</option>
                  {teamTypes.map((type: string) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 w-full">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm hover:shadow-md font-semibold"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition shadow-sm hover:shadow-md font-semibold"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      )}

        {/* Clubs grouped by country */}
        <div className="space-y-8">
          {sortedCountries.map((country) => (
            <div key={country}>
              <h2 className="text-lg font-semibold text-gray-600 mb-3 border-b border-gray-300 pb-1">
                {country} ({clubsByCountry[country].length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubsByCountry[country].map((club: ClubListItem) => (
                  <Link key={club.id} href={`/clubs/${club.id}`} className="block">
                    <div className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow hover:bg-gray-50 cursor-pointer flex items-center gap-4">
                      <Image
                        src={club.imageUrl || "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"}
                        alt={`${club.name} crest`}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-contain bg-gray-100"
                      />
                      <div>
                        <h3 className="text-lg font-semibold mb-1 text-primary">
                          {club.name}
                        </h3>
                        <p className="text-gray-700">
                          <strong>Location:</strong> {club.location || "-"}
                        </p>
                        {club.teamTypes.length > 0 && (
                          <p className="text-gray-600 text-sm">
                            {club.teamTypes.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
