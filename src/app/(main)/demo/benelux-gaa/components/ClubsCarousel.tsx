"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import InternalLink from "./InternalLink";
import { getAssetUrl } from "../constants";

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
  const [isMobile, setIsMobile] = useState(true);

  const mobileItemsPerPage = 6;
  const desktopItemsPerPage = 8;

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
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, []);

  const totalPages = Math.ceil(clubs.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleClubs = clubs.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () =>
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  useEffect(() => {
    setCurrentPage(0);
  }, [isMobile]);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#0d1f2d] via-[#1a3a4a] to-[#0d1f2d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2B9EB3] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4ecde6] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#2B9EB3]" />
          </div>
        </div>
      </section>
    );
  }

  if (clubs.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#0d1f2d] via-[#1a3a4a] to-[#0d1f2d] relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2B9EB3] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4ecde6] rounded-full blur-3xl" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white">
            <span className="bg-gradient-to-r from-white via-white to-[#4ecde6] bg-clip-text text-transparent">
              {clubs.length} Clubs
            </span>
            <br className="md:hidden" />
            <span className="md:ml-3 text-white/90">Across the Region</span>
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation */}
          {totalPages > 1 && (
            <>
              <button
                type="button"
                onClick={prevPage}
                className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 items-center justify-center hover:bg-white/20 transition-all group"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
              <button
                type="button"
                onClick={nextPage}
                className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 items-center justify-center hover:bg-white/20 transition-all group"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
            </>
          )}

          {/* Mobile Grid */}
          <div className="md:hidden grid grid-cols-3 gap-3">
            {visibleClubs.map((club) => (
              <div key={club.id} className="group">
                <div className="bg-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="aspect-square flex items-center justify-center mb-2">
                    {club.imageUrl ? (
                      <Image
                        src={getAssetUrl(club.imageUrl)}
                        alt={`${club.name} crest`}
                        width={72}
                        height={72}
                        className="object-contain w-14 h-14"
                        unoptimized
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-[#2B9EB3] to-[#1a3a4a] rounded-full flex items-center justify-center">
                        <span className="text-lg">
                          {countryFlags[club.countryCode] || "\u{1F3D0}"}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-900 text-[11px] font-semibold text-center line-clamp-2 leading-tight">
                    {club.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-4 gap-6">
            {visibleClubs.map((club) => (
              <div key={club.id} className="group cursor-pointer">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-44 flex items-center justify-center mb-5">
                    {club.imageUrl ? (
                      <Image
                        src={getAssetUrl(club.imageUrl)}
                        alt={`${club.name} crest`}
                        width={160}
                        height={160}
                        className="object-contain w-40 h-40 group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-28 h-28 bg-gradient-to-br from-[#2B9EB3] to-[#1a3a4a] rounded-xl flex items-center justify-center">
                        <span className="text-4xl">
                          {countryFlags[club.countryCode] || "\u{1F3D0}"}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-900 font-semibold text-center text-base leading-snug group-hover:text-[#2B9EB3] transition-colors">
                    {club.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Navigation */}
          {totalPages > 1 && (
            <div className="flex md:hidden items-center justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={prevPage}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPage(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentPage
                        ? "bg-[#2B9EB3] w-6"
                        : "bg-white/30 w-2 hover:bg-white/50"
                    }`}
                    aria-label={`Page ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={nextPage}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Desktop Page Indicators */}
          {totalPages > 1 && (
            <div className="hidden md:flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPage(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentPage
                      ? "bg-[#2B9EB3] w-10"
                      : "bg-white/20 w-3 hover:bg-white/40"
                  }`}
                  aria-label={`Page ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-10 md:mt-14">
          <InternalLink
            href="/clubs"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#2B9EB3] to-[#4ecde6] text-white font-semibold rounded-full hover:shadow-lg hover:shadow-[#2B9EB3]/30 transition-all duration-300 group"
          >
            Explore All Clubs
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </InternalLink>
        </div>
      </div>
    </section>
  );
}
