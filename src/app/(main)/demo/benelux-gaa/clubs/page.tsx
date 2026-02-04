"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import { MapPin, ExternalLink, Loader2, Calendar } from "lucide-react";
import dynamic from "next/dynamic";
import { getAssetUrl } from "../constants";

const BeneluxClubsMap = dynamic(() => import("../components/BeneluxClubsMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3] rounded-xl h-64 md:h-80 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-white" />
    </div>
  ),
});

interface Club {
  id: string;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  foundedYear: number | null;
  country: string;
  countryCode: string;
  sportsSupported: string[];
}

const countryFlags: Record<string, string> = {
  NL: "🇳🇱",
  BE: "🇧🇪",
  LU: "🇱🇺",
  DE: "🇩🇪",
  XX: "🌍",
};

function getCity(location: string | null): string {
  if (!location) return "";
  const parts = location.split(",");
  return parts[0]?.trim() || "";
}

const sportCodes = [
  { code: "all", name: "All Sports", short: "All" },
  { code: "Mens Gaelic Football", name: "Mens Football", short: "Football" },
  { code: "LGFA", name: "LGFA", short: "LGFA" },
  { code: "Hurling", name: "Hurling & Camogie", short: "Hurling" },
  { code: "Youth", name: "Youth", short: "Youth" },
];

function getSportLabel(sportCode: string): string | null {
  const sportMap: Record<string, string> = {
    "Mens Gaelic Football": "Football",
    LGFA: "LGFA",
    Hurling: "Hurling/Camogie",
    Camogie: "", // Skip - shown with Hurling
    Youth: "Youth",
  };
  const label = sportMap[sportCode];
  return label === "" ? null : label || null;
}

export default function ClubsPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClubs() {
      try {
        const response = await fetch("/api/benelux-clubs");
        if (!response.ok) {
          throw new Error("Failed to fetch clubs");
        }
        const data = await response.json();
        setClubs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load clubs");
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, []);

  const filteredClubs = clubs.filter((c) => {
    const countryMatch =
      selectedCountry === "all" || c.countryCode === selectedCountry;
    const sportMatch =
      selectedSport === "all" || c.sportsSupported?.includes(selectedSport);
    return countryMatch && sportMatch;
  });

  const countries = [
    { code: "all", name: "All Countries", flag: "🌍" },
    { code: "NL", name: "Netherlands", flag: "🇳🇱" },
    { code: "BE", name: "Belgium", flag: "🇧🇪" },
    { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
    { code: "DE", name: "Germany (Affiliated)", flag: "🇩🇪" },
  ];

  return (
    <div className="min-h-screen bg-[#1a3a4a] flex flex-col relative">
      {/* Textured Gradient Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 30% 0%, rgba(43, 158, 179, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 30%, rgba(13, 37, 48, 0.2) 0%, transparent 40%),
            radial-gradient(ellipse at 20% 70%, rgba(43, 158, 179, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 90%, rgba(13, 37, 48, 0.15) 0%, transparent 40%),
            linear-gradient(180deg, rgba(26, 58, 74, 1) 0%, rgba(13, 37, 48, 1) 100%)
          `,
        }}
      />
      {/* Subtle noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <Header currentPage="Clubs" />

      <main className="flex-1 pt-20 pb-12 sm:pt-24 sm:pb-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          {/* Compact Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Title + Count */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Benelux GAA Clubs
              </h1>
              {!loading && !error && (
                <span className="text-white/60 text-sm font-medium">
                  ({filteredClubs.length})
                </span>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              {/* Country Dropdown */}
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="appearance-none bg-white/10 text-white text-sm font-medium pl-3 pr-8 py-2 rounded-lg border border-white/20 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] cursor-pointer"
                >
                  {countries.map((country) => (
                    <option
                      key={country.code}
                      value={country.code}
                      className="bg-[#1a3a4a] text-white"
                    >
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/60">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Sport Dropdown */}
              <div className="relative">
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="appearance-none bg-white/10 text-white text-sm font-medium pl-3 pr-8 py-2 rounded-lg border border-white/20 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] cursor-pointer"
                >
                  {sportCodes.map((sport) => (
                    <option
                      key={sport.code}
                      value={sport.code}
                      className="bg-[#1a3a4a] text-white"
                    >
                      {sport.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/60">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="mb-6 sm:mb-10">
            {!loading && !error && clubs.length > 0 ? (
              <BeneluxClubsMap
                clubs={clubs}
                selectedCountry={selectedCountry}
              />
            ) : (
              <div className="bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3] rounded-xl h-64 md:h-80 flex items-center justify-center relative overflow-hidden">
                <div className="text-center text-white z-10">
                  <MapPin size={48} className="mx-auto mb-4 opacity-80" />
                  <p className="text-lg font-medium">
                    {loading
                      ? "Loading map..."
                      : error
                        ? "Map unavailable"
                        : "No clubs to display"}
                  </p>
                </div>
              </div>
            )}
            <p className="text-center text-white/60 text-sm mt-2">
              {loading
                ? "Loading..."
                : `${filteredClubs.length} clubs in the Benelux region & affiliates`}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#2B9EB3]" />
              <span className="ml-3 text-white/80">Loading clubs...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Club Cards Grid */}
          {!loading && !error && (
            <>
              {/* Mobile: Compact horizontal cards */}
              <div className="md:hidden space-y-3">
                {filteredClubs.map((club) => (
                  <div
                    key={club.id}
                    className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Crest */}
                      <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                        {club.imageUrl ? (
                          <Image
                            src={getAssetUrl(club.imageUrl)}
                            alt={`${club.name} crest`}
                            width={64}
                            height={64}
                            className="object-contain w-14 h-14"
                            unoptimized
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-[#2B9EB3] to-[#1a3a4a] rounded-full flex items-center justify-center">
                            <span className="text-2xl">
                              {countryFlags[club.countryCode] || "🏐"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 font-bold text-base truncate group-hover:text-[#2B9EB3] transition-colors">
                          {club.name}
                        </h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
                          <span>{countryFlags[club.countryCode]}</span>
                          <span>{getCity(club.location) || club.country}</span>
                        </p>
                        {club.foundedYear && (
                          <p className="text-gray-400 text-xs mt-0.5">
                            Est. {club.foundedYear}
                          </p>
                        )}

                        {/* Sport Badges */}
                        {club.sportsSupported &&
                          club.sportsSupported.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {club.sportsSupported.map((sport) => {
                                const label = getSportLabel(sport);
                                if (!label) return null;
                                return (
                                  <span
                                    key={sport}
                                    className="bg-gray-200 text-gray-700 text-[10px] font-medium px-1.5 py-0.5 rounded"
                                  >
                                    {label}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                        {/* Social + Website row */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <a
                              href={club.facebook || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-6 h-6 flex items-center justify-center rounded-full bg-[#1877F2] text-white ${!club.facebook ? "pointer-events-none" : ""}`}
                            >
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                            </a>
                            <a
                              href={club.instagram || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-6 h-6 flex items-center justify-center rounded-full bg-[#E4405F] text-white ${!club.instagram ? "pointer-events-none" : ""}`}
                            >
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                              </svg>
                            </a>
                            <a
                              href={club.twitter || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-6 h-6 flex items-center justify-center rounded-full bg-black text-white ${!club.twitter ? "pointer-events-none" : ""}`}
                            >
                              <svg
                                className="w-2.5 h-2.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                            </a>
                            <a
                              href={club.tiktok || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-6 h-6 flex items-center justify-center rounded-full bg-black text-white ${!club.tiktok ? "pointer-events-none" : ""}`}
                            >
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                              </svg>
                            </a>
                          </div>
                          {club.website ? (
                            <a
                              href={club.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto text-xs text-[#2B9EB3] hover:text-[#1a3a4a] flex items-center gap-1 transition-colors"
                            >
                              <ExternalLink size={12} />
                              Website
                            </a>
                          ) : (
                            <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                              <ExternalLink size={12} />
                              Website
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Modern unified cards */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredClubs.map((club) => (
                  <div
                    key={club.id}
                    className="group relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {/* Top row: Crest + Info */}
                    <div className="flex items-start gap-4">
                      {/* Crest */}
                      <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-xl p-2 group-hover:scale-105 transition-transform duration-300">
                        {club.imageUrl ? (
                          <Image
                            src={getAssetUrl(club.imageUrl)}
                            alt={`${club.name} crest`}
                            width={72}
                            height={72}
                            className="object-contain w-16 h-16"
                            unoptimized
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-[#2B9EB3] to-[#1a3a4a] rounded-lg flex items-center justify-center">
                            <span className="text-3xl">
                              {countryFlags[club.countryCode] || "🏐"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Club Info */}
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="text-gray-900 font-bold text-lg leading-tight group-hover:text-[#2B9EB3] transition-colors">
                          {club.name}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                          <MapPin
                            size={14}
                            className="text-[#2B9EB3] flex-shrink-0"
                          />
                          {getCity(club.location)}
                          {getCity(club.location) && ","}{" "}
                          {countryFlags[club.countryCode]}
                        </p>
                        {club.foundedYear && (
                          <p className="text-gray-400 text-xs mt-1">
                            Est. {club.foundedYear}
                          </p>
                        )}

                        {/* Sport Badges */}
                        {club.sportsSupported &&
                          club.sportsSupported.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {club.sportsSupported.map((sport) => {
                                const label = getSportLabel(sport);
                                if (!label) return null;
                                return (
                                  <span
                                    key={sport}
                                    className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded"
                                  >
                                    {label}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Bottom row: Social + Website */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      {/* Social Icons - Always show all with brand colors */}
                      <div className="flex items-center gap-2">
                        <a
                          href={club.facebook || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-8 h-8 flex items-center justify-center rounded-lg bg-[#1877F2] text-white ${!club.facebook ? "pointer-events-none" : ""}`}
                          title="Facebook"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </a>
                        <a
                          href={club.instagram || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-8 h-8 flex items-center justify-center rounded-lg bg-[#E4405F] text-white ${!club.instagram ? "pointer-events-none" : ""}`}
                          title="Instagram"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                          </svg>
                        </a>
                        <a
                          href={club.twitter || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-8 h-8 flex items-center justify-center rounded-lg bg-black text-white ${!club.twitter ? "pointer-events-none" : ""}`}
                          title="X (Twitter)"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                        <a
                          href={club.tiktok || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-8 h-8 flex items-center justify-center rounded-lg bg-black text-white ${!club.tiktok ? "pointer-events-none" : ""}`}
                          title="TikTok"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                          </svg>
                        </a>
                      </div>

                      {/* Website Button */}
                      {club.website ? (
                        <a
                          href={club.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2B9EB3]/10 text-[#2B9EB3] text-sm font-medium rounded-lg hover:bg-[#2B9EB3] hover:text-white transition-all"
                        >
                          <ExternalLink size={14} />
                          Website
                        </a>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed">
                          <ExternalLink size={14} />
                          Website
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* No Results */}
          {!loading && !error && filteredClubs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/60">
                No clubs found for this selection.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
