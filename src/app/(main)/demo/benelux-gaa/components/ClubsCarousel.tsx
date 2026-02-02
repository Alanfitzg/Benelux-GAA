"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import InternalLink from "./InternalLink";

interface Club {
  id: string;
  name: string;
  imageUrl: string | null;
  countryCode: string;
}

const countryFlags: Record<string, string> = {
  NL: "\u{1F1F3}\u{1F1F1}",
  BE: "\u{1F1E7}\u{1F1EA}",
  LU: "\u{1F1F1}\u{1F1FA}",
  DE: "\u{1F1E9}\u{1F1EA}",
  XX: "\u{1F30D}",
};

export default function ClubsCarousel() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // Mobile: 3x3 = 9, Desktop: 2 rows x 4 = 8
  const mobileItemsPerPage = 9;
  const desktopItemsPerPage = 8;

  // Use window width to determine items per page (default to mobile for SSR)
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const itemsPerPage = isMobile ? mobileItemsPerPage : desktopItemsPerPage;

  useEffect(() => {
    async function fetchClubs() {
      try {
        const response = await fetch("/api/benelux-clubs");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setClubs(data);
      } catch {
        // Silently fail - just don't show the section
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, []);

  const totalPages = Math.ceil(clubs.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleClubs = clubs.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Reset page when switching between mobile/desktop
  useEffect(() => {
    setCurrentPage(0);
  }, [isMobile]);

  if (loading) {
    return (
      <section className="py-10 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#2B9EB3]" />
          </div>
        </div>
      </section>
    );
  }

  if (clubs.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center sm:text-left mb-2 sm:mb-0">
            Our Clubs
          </h2>
          <InternalLink
            href="/clubs"
            className="text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors hidden sm:inline"
          >
            View all clubs →
          </InternalLink>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows - Desktop Only, positioned outside grid */}
          {totalPages > 1 && (
            <>
              <button
                type="button"
                onClick={prevPage}
                className="hidden md:flex absolute -left-14 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#1a3a4a] shadow-lg items-center justify-center hover:bg-[#2B9EB3] transition-colors"
                aria-label="Previous clubs"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              <button
                type="button"
                onClick={nextPage}
                className="hidden md:flex absolute -right-14 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#1a3a4a] shadow-lg items-center justify-center hover:bg-[#2B9EB3] transition-colors"
                aria-label="Next clubs"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Mobile: 3x3 Grid */}
          <div className="md:hidden grid grid-cols-3 gap-3">
            {visibleClubs.map((club) => (
              <div
                key={club.id}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-20 h-20 flex items-center justify-center mb-2">
                  {club.imageUrl ? (
                    <Image
                      src={club.imageUrl}
                      alt={`${club.name} crest`}
                      width={72}
                      height={72}
                      className="object-contain w-[72px] h-[72px]"
                      unoptimized
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3] rounded-full flex items-center justify-center">
                      <span className="text-2xl">
                        {countryFlags[club.countryCode] || "\u{1F3D0}"}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-semibold text-[#1a3a4a] text-center line-clamp-2 leading-tight">
                  {club.name}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop: 2 rows x 4 columns */}
          <div className="hidden md:grid md:grid-cols-4 gap-6">
            {visibleClubs.map((club) => (
              <div
                key={club.id}
                className="flex flex-col items-center p-6 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-[#2B9EB3]/30 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-32 h-32 flex items-center justify-center mb-4">
                  {club.imageUrl ? (
                    <Image
                      src={club.imageUrl}
                      alt={`${club.name} crest`}
                      width={120}
                      height={120}
                      className="object-contain w-28 h-28 group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-4xl">
                        {countryFlags[club.countryCode] || "\u{1F3D0}"}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-base font-semibold text-[#1a3a4a] text-center line-clamp-2 leading-snug group-hover:text-[#2B9EB3] transition-colors">
                  {club.name}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile Navigation - Below Grid */}
          {totalPages > 1 && (
            <div className="flex md:hidden items-center justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={prevPage}
                className="w-8 h-8 rounded-full bg-[#1a3a4a] shadow flex items-center justify-center hover:bg-[#2B9EB3] transition-colors"
                aria-label="Previous clubs"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>

              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPage(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentPage
                        ? "bg-[#2B9EB3] w-4"
                        : "bg-gray-300 w-1.5 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to page ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={nextPage}
                className="w-8 h-8 rounded-full bg-[#1a3a4a] shadow flex items-center justify-center hover:bg-[#2B9EB3] transition-colors"
                aria-label="Next clubs"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Desktop Page Indicators */}
          {totalPages > 1 && (
            <div className="hidden md:flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPage(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentPage
                      ? "bg-[#2B9EB3] w-8"
                      : "bg-gray-300 w-2 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile View All Link */}
        <div className="text-center mt-5 sm:hidden">
          <InternalLink
            href="/clubs"
            className="text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors text-sm"
          >
            View all clubs →
          </InternalLink>
        </div>
      </div>
    </section>
  );
}
