"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import { MapPin, ExternalLink, Loader2, Calendar } from "lucide-react";
import dynamic from "next/dynamic";

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

export default function ClubsPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
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

  const filteredClubs =
    selectedCountry === "all"
      ? clubs
      : clubs.filter((c) => c.countryCode === selectedCountry);

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

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              <EditableText
                pageKey="clubs"
                contentKey="title"
                defaultValue="Benelux GAA Clubs"
                maxLength={40}
              />
            </h1>
            <p className="text-[#2B9EB3] text-base sm:text-lg max-w-2xl mx-auto mb-4 sm:mb-6">
              <EditableText
                pageKey="clubs"
                contentKey="subtitle"
                defaultValue="Find your local Gaelic Games club across Belgium, Netherlands, Luxembourg, and affiliated German clubs."
                maxLength={150}
              />
            </p>
            {!loading && !error && (
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {clubs.length}
                </span>
                <span className="text-white/80 font-medium text-sm sm:text-base">
                  clubs in the Benelux region
                </span>
              </div>
            )}
          </div>

          {/* Country Filter */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-10">
            {countries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => setSelectedCountry(country.code)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  selectedCountry === country.code
                    ? "bg-[#2B9EB3] text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <span>{country.flag}</span>
                <span className="hidden xs:inline sm:inline">
                  {country.name}
                </span>
                <span className="xs:hidden sm:hidden">
                  {country.code === "all" ? "All" : country.code}
                </span>
              </button>
            ))}
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredClubs.map((club) => (
                <div
                  key={club.id}
                  className="bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                >
                  {/* Club Header */}
                  <div className="bg-gradient-to-br from-[#2B9EB3] to-[#1a3a4a] p-4 sm:p-6 text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                      {club.imageUrl ? (
                        <Image
                          src={club.imageUrl}
                          alt={`${club.name} crest`}
                          width={88}
                          height={88}
                          className="object-contain drop-shadow-lg w-16 h-16 sm:w-[88px] sm:h-[88px]"
                          style={{
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                          }}
                          unoptimized
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full flex items-center justify-center">
                          <span className="text-3xl sm:text-4xl">
                            {countryFlags[club.countryCode] || "🏐"}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {club.name}
                    </h3>
                  </div>

                  {/* Club Details */}
                  <div className="p-4 sm:p-6">
                    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                        <MapPin
                          size={14}
                          className="text-[#2B9EB3] flex-shrink-0 sm:w-4 sm:h-4"
                        />
                        <span>
                          {getCity(club.location)}, {club.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                        <span className="text-base sm:text-lg">
                          {countryFlags[club.countryCode]}
                        </span>
                        <span>{club.country}</span>
                      </div>
                      {club.foundedYear && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                          <Calendar
                            size={14}
                            className="text-[#2B9EB3] flex-shrink-0 sm:w-4 sm:h-4"
                          />
                          <span>Established {club.foundedYear}</span>
                        </div>
                      )}
                    </div>

                    {/* Social Media Links */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      {club.facebook ? (
                        <a
                          href={club.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors"
                          title="Facebook"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </a>
                      ) : (
                        <span
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-300 cursor-not-allowed"
                          title="No Facebook"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </span>
                      )}
                      {club.instagram ? (
                        <a
                          href={club.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F] hover:text-white transition-colors"
                          title="Instagram"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                          </svg>
                        </a>
                      ) : (
                        <span
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-300 cursor-not-allowed"
                          title="No Instagram"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                          </svg>
                        </span>
                      )}
                      {club.twitter ? (
                        <a
                          href={club.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10 text-black hover:bg-black hover:text-white transition-colors"
                          title="X (Twitter)"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                      ) : (
                        <span
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-300 cursor-not-allowed"
                          title="No X (Twitter)"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </span>
                      )}
                      {club.tiktok ? (
                        <a
                          href={club.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10 text-black hover:bg-black hover:text-white transition-colors"
                          title="TikTok"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                          </svg>
                        </a>
                      ) : (
                        <span
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-300 cursor-not-allowed"
                          title="No TikTok"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                          </svg>
                        </span>
                      )}
                    </div>

                    {club.website ? (
                      <a
                        href={club.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2B9EB3]/10 text-[#2B9EB3] rounded-lg font-medium hover:bg-[#2B9EB3] hover:text-white transition-colors"
                      >
                        <ExternalLink size={16} />
                        Visit Website
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                        disabled
                      >
                        <ExternalLink size={16} />
                        No Website
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && filteredClubs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/60">
                No clubs found for this selection.
              </p>
            </div>
          )}

          {/* Join CTA */}
          <div className="mt-10 sm:mt-16 text-center bg-white rounded-xl p-6 sm:p-8 md:p-12 shadow-xl">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              <EditableText
                pageKey="clubs"
                contentKey="cta_title"
                defaultValue="Want to Start a Club?"
                maxLength={40}
              />
            </h2>
            <p className="text-gray-600 mb-4 sm:mb-6 max-w-xl mx-auto text-sm sm:text-base">
              <EditableText
                pageKey="clubs"
                contentKey="cta_description"
                defaultValue="We're always looking to grow the Gaelic Games community in the Benelux. Get in touch to learn how to start a club in your area."
                maxLength={200}
              />
            </p>
            <a
              href="/demo/benelux-gaa/contact"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-[#2B9EB3] text-white font-semibold rounded-lg hover:bg-[#238a9c] transition-colors text-sm sm:text-base"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
