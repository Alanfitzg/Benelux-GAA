"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById, youthEvents } from "../data";

export default function YouthEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const event = getEventById(id);

  if (!event) {
    notFound();
  }

  const isGoGames = event.title.toLowerCase().includes("go games");
  const isFeile = event.title.toLowerCase().includes("feile");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#1B4B8F] via-[#152d54] to-[#1B4B8F] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#F5B800] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F5B800] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 py-4 md:py-6 relative">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <Link
              href="/youth-events"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
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
              <span className="text-sm font-medium">Back to Events</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl p-1.5 shadow-lg">
                <Image
                  src="/images/gge-crest.png"
                  alt="Gaelic Games Europe"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Event Header */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 pb-6">
            {/* Event Image */}
            <div className="w-full md:w-80 h-48 md:h-56 rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0 shadow-xl">
              {isGoGames ? (
                <div className="w-full h-full bg-[#1e3a5f] flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                      GO
                    </div>
                    <div className="text-4xl md:text-5xl font-black text-white">
                      GAMES
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2 text-white/80 text-xs">
                      <span>GAA</span>
                      <span>LGFA</span>
                      <span>Camogie</span>
                    </div>
                  </div>
                </div>
              ) : isFeile && event.title.includes("European") ? (
                <div className="w-full h-full bg-gradient-to-br from-[#1B4B8F] to-[#2563eb] flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-[#F5B800]">
                      EUROPEAN
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-white">
                      FÉILE
                    </div>
                    <div className="text-xs text-white/80 mt-1">
                      GAELIC GAMES EUROPE
                    </div>
                  </div>
                </div>
              ) : (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  width={320}
                  height={224}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              )}
            </div>

            {/* Event Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {event.region && (
                  <span className="px-3 py-1 bg-[#F5B800] rounded-full text-xs font-bold text-[#1B4B8F]">
                    {event.region}
                  </span>
                )}
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
                  {event.sport}
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-white mb-4">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-4 md:gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#F5B800]"
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
                  <span className="font-medium">
                    {event.date}, {event.year}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#F5B800]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="font-medium">{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#F5B800]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">{event.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="max-w-4xl">
          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              About this Event
            </h2>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              {event.description}
            </p>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg mt-4">
              Join us for an unforgettable experience. Whether you&apos;re a
              participant or a spectator, this event promises high-energy
              competition and community spirit.
            </p>
          </div>

          {/* Host Club Section */}
          {(event.hostClub || event.hostClubs) && (
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                {event.hostClubs ? "Host Clubs" : "Host Club"}
              </h2>
              {event.hostClubs ? (
                <div>
                  <p className="text-gray-500 text-sm mb-4">
                    This event is hosted simultaneously across multiple
                    locations
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {event.hostClubs.map((club) => (
                      <div
                        key={club.name}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="w-16 h-16 bg-white rounded-xl p-2 shadow-md border border-gray-100 mb-2">
                          <Image
                            src={club.crestUrl}
                            alt={club.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain"
                            unoptimized
                          />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {club.name}
                        </h3>
                      </div>
                    ))}
                  </div>
                </div>
              ) : event.hostClub ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-xl p-2 shadow-md border border-gray-100">
                    <Image
                      src={event.hostClub.crestUrl}
                      alt={event.hostClub.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {event.hostClub.name}
                    </h3>
                    <p className="text-gray-500 text-sm">Event Host</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Organizer Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Organizer
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl p-2 shadow-md border border-gray-100">
                <Image
                  src="/images/gge-crest.png"
                  alt="Gaelic Games Europe"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Gaelic Games Europe
                </h3>
                <p className="text-gray-500 text-sm">
                  Governing body for the continent of Europe
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-[#1B4B8F] to-[#2563eb] rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="font-bold text-white text-xl mb-1">
                  Interested in this event?
                </h3>
                <p className="text-white/80">
                  Contact Gaelic Games Europe for more information or to
                  register.
                </p>
              </div>
              <a
                href="https://gaelicgameseurope.com/contact/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#F5B800] text-[#1B4B8F] rounded-xl font-bold hover:bg-[#F5B800]/90 transition-colors shadow-lg whitespace-nowrap"
              >
                Contact GGE
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1B4B8F] py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg p-1.5">
                <Image
                  src="/images/gge-crest.png"
                  alt="GGE"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              <span className="text-white font-semibold">GGE Youth Events</span>
            </div>
            <p className="text-white/60 text-sm">Powered by PlayAway</p>
          </div>
        </div>
      </div>
    </div>
  );
}
