"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  Instagram,
  Facebook,
  Twitter,
  Music2,
  Trophy,
  Globe,
  Plane,
} from "lucide-react";

interface Club {
  location?: string;
  status?: string;
}

interface Event {
  eventType: string;
  id: string;
  title: string;
  startDate: string;
  location?: string;
  imageUrl?: string;
  sportType?: string;
}

interface Testimonial {
  id: string;
  content: string;
  author: string;
  club?: {
    name: string;
  };
}

export default function HomePage() {
  const [stats, setStats] = useState({
    clubs: 0,
    tournaments: 0,
    countries: 0,
  });

  const [displayStats, setDisplayStats] = useState({
    clubs: 0,
    tournaments: 0,
    countries: 0,
  });

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const statsRef = useRef(null);
  const isInView = useInView(statsRef, { once: true });


  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/clubs").then((res) => res.json()),
      fetch("/api/events").then((res) => res.json()),
      fetch("/api/testimonials/approved")
        .then((res) => res.json())
        .catch(() => ({ testimonials: [] })),
    ])
      .then(([clubsData, eventsData, testimonialsData]) => {
        const clubs = Array.isArray(clubsData)
          ? clubsData
          : clubsData.clubs || [];
        const events = Array.isArray(eventsData)
          ? eventsData
          : eventsData.events || [];

        const approvedClubs = clubs.filter(
          (club: Club) => club.status === "APPROVED"
        );

        const countriesWithClubs = new Set();
        approvedClubs.forEach((club: Club) => {
          if (club.location) {
            const parts = club.location.split(",");
            if (parts.length > 1) {
              countriesWithClubs.add(parts[parts.length - 1].trim());
            }
          }
        });

        const tournaments = events.filter(
          (e: Event) => e.eventType === "Tournament"
        );

        setStats({
          clubs: approvedClubs.length,
          tournaments: tournaments.length,
          countries: countriesWithClubs.size,
        });

        const upcoming = tournaments
          .sort(
            (a: Event, b: Event) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )
          .slice(0, 9);

        setUpcomingEvents(upcoming);

        if (testimonialsData.testimonials) {
          setTestimonials(testimonialsData.testimonials.slice(0, 3));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (
      isInView &&
      (stats.clubs > 0 || stats.tournaments > 0 || stats.countries > 0)
    ) {
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;

      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        setDisplayStats({
          clubs: Math.floor(stats.clubs * easeOutQuart),
          tournaments: Math.floor(stats.tournaments * easeOutQuart),
          countries: Math.floor(stats.countries * easeOutQuart),
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setDisplayStats(stats);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isInView, stats]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Redesigned */}
      <section
        className="relative text-white overflow-hidden min-h-screen"
        style={{
          background: "linear-gradient(to bottom, #0B2C58, #1A3D80)",
        }}
      >
        <div
          className="relative w-full h-screen flex items-center justify-center px-6"
          style={{ zIndex: 1 }}
        >
          {/* Desktop Layout - Two columns */}
          <div className="hidden md:grid grid-cols-2 gap-12 lg:gap-16 w-full max-w-7xl items-center">
            {/* Left Column - Text Content */}
            <div className="text-left">
              {/* Brand Name - PlayAway (Main Headline) */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
                className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-6"
                style={{ color: "#FFFFFF" }}
              >
                PlayAway
              </motion.h1>

              {/* Tagline - Gateway (Sub-headline) */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1, ease: "easeInOut" }}
                className="text-2xl lg:text-3xl font-semibold mb-8"
                style={{ color: "rgba(255, 255, 255, 0.9)" }}
              >
                Gateway to Global Gaelic Games
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
                className="flex flex-row gap-4"
              >
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg text-lg"
                  style={{ color: "#1A3D80" }}
                >
                  Find Tournaments
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                <Link
                  href="/clubs"
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white transition-all duration-200 text-lg"
                  style={{
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#1A3D80";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                >
                  Explore Clubs
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </motion.div>
            </div>

            {/* Right Column - Europe Map */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="relative flex items-center justify-center"
            >
              <Image
                src="/Europe-map.png.png"
                alt="Europe Map"
                width={1600}
                height={1200}
                className="w-full h-auto max-w-6xl opacity-60"
                unoptimized
              />
            </motion.div>
          </div>

          {/* Mobile Layout - Text with simple background */}
          <div className="md:hidden relative w-full h-screen flex items-center justify-center overflow-hidden">
            {/* Subtle floating shapes background */}
            <div className="absolute inset-0">
              <svg
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <filter id="blur">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
                  </filter>
                </defs>
                <ellipse
                  cx="20%"
                  cy="20%"
                  rx="150"
                  ry="80"
                  fill="rgba(255,255,255,0.1)"
                  filter="url(#blur)"
                >
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0 0"
                    to="300 0"
                    dur="40s"
                    repeatCount="indefinite"
                  />
                </ellipse>
                <ellipse
                  cx="60%"
                  cy="40%"
                  rx="200"
                  ry="100"
                  fill="rgba(255,255,255,0.08)"
                  filter="url(#blur)"
                >
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0 0"
                    to="250 0"
                    dur="50s"
                    repeatCount="indefinite"
                  />
                </ellipse>
                <ellipse
                  cx="30%"
                  cy="70%"
                  rx="180"
                  ry="90"
                  fill="rgba(255,255,255,0.12)"
                  filter="url(#blur)"
                >
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0 0"
                    to="280 0"
                    dur="45s"
                    repeatCount="indefinite"
                  />
                </ellipse>
              </svg>
            </div>

            {/* Foreground Text Content */}
            <div className="relative z-10 text-center px-4">
              {/* Brand Name - PlayAway (Main Headline) */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
                className="text-4xl font-bold mb-4"
                style={{ color: "#FFFFFF" }}
              >
                PlayAway
              </motion.h1>

              {/* Tagline - Gateway (Sub-headline) */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1, ease: "easeInOut" }}
                className="text-lg font-semibold mb-12"
                style={{ color: "rgba(255, 255, 255, 0.9)" }}
              >
                Gateway to Global Gaelic Games
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
                className="flex flex-col gap-3 max-w-xs mx-auto"
              >
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center px-3 py-2 bg-white font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg text-sm"
                  style={{ color: "#1A3D80" }}
                >
                  Find Tournaments
                </Link>
                <Link
                  href="/clubs"
                  className="inline-flex items-center justify-center px-3 py-2 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white transition-all duration-200 text-sm"
                  style={{
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#1A3D80";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                >
                  Explore Clubs
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tournaments - Horizontal Scroll */}
      {upcomingEvents.length > 0 && (
        <section className="py-16 md:py-20 bg-gradient-to-b from-gray-100 to-white border-t border-gray-300">
          <div className="container mx-auto px-6 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Upcoming Tournaments
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                Join the action at these featured events
              </p>
            </motion.div>

            {/* Horizontal Scroll Container */}
            <div className="relative">
              <div
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {upcomingEvents.slice(0, 9).map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="flex-none w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start"
                  >
                    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full group">
                      {/* Image Section */}
                      <div
                        className="relative w-full bg-gradient-to-br from-primary to-primary-light overflow-hidden"
                        style={{ aspectRatio: "16/9" }}
                      >
                        {event.imageUrl ? (
                          <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Trophy className="w-16 h-16 text-white/50" />
                          </div>
                        )}

                        {/* Sport Type Badge */}
                        {event.sportType && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="text-xs font-semibold text-white bg-primary/90 px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm">
                              {event.sportType}
                            </span>
                          </div>
                        )}

                        {/* Event Status Badge */}
                        {isEventPast(event.startDate) && (
                          <div className="absolute top-3 right-3 z-10">
                            <span className="text-xs font-semibold text-red-600 bg-white/95 px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm italic">
                              Past Event
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-5">
                        {/* Event Title */}
                        <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>

                        {/* Event Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-lg">📅</span>
                            <span>
                              {new Date(event.startDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="text-lg">📍</span>
                              <span className="line-clamp-1">
                                {event.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Scroll Indicator */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  ← Scroll to explore more tournaments →
                </p>
              </div>
            </div>

            {/* View All Events CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <span>View All Events</span>
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
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Quick Value Props */}
      <section
        className="py-12 md:py-16"
        ref={statsRef}
        style={{
          background: "linear-gradient(to bottom, #0B2C58, #1A3D80)",
        }}
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg text-center"
            >
              <div className="inline-flex items-center justify-center w-8 h-8 md:w-14 md:h-14 bg-primary/10 rounded-full mb-2 md:mb-3">
                <Trophy className="w-4 h-4 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
                {displayStats.clubs}+
              </div>
              <h3 className="text-[10px] sm:text-xs md:text-lg font-semibold text-gray-900 mb-1 whitespace-nowrap">
                Clubs
              </h3>
              <p className="text-gray-600 text-xs md:text-sm hidden md:block">
                Connect with GAA communities across {displayStats.countries}+
                countries
              </p>
              <p className="text-gray-600 text-[9px] sm:text-[10px] leading-tight md:hidden">
                GAA communities worldwide
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg text-center"
            >
              <div className="inline-flex items-center justify-center w-8 h-8 md:w-14 md:h-14 bg-primary/10 rounded-full mb-2 md:mb-3">
                <Globe className="w-4 h-4 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
                {displayStats.tournaments}+
              </div>
              <h3 className="text-[10px] sm:text-xs md:text-lg font-semibold text-gray-900 mb-1 whitespace-nowrap">
                Tournaments
              </h3>
              <p className="text-gray-600 text-xs md:text-sm hidden md:block">
                Browse approved events in Spain, Germany, France & beyond
              </p>
              <p className="text-gray-600 text-[9px] sm:text-[10px] leading-tight md:hidden">
                European events
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg text-center"
            >
              <div className="inline-flex items-center justify-center w-8 h-8 md:w-14 md:h-14 bg-primary/10 rounded-full mb-2 md:mb-3">
                <Plane className="w-4 h-4 md:w-7 md:h-7 text-primary" />
              </div>
              <div className="text-lg md:text-3xl font-bold text-gray-900 mb-1">
                Custom Trip
              </div>
              <h3 className="text-[10px] sm:text-xs md:text-lg font-semibold text-gray-900 mb-1 whitespace-nowrap">
                Tailored for You
              </h3>
              <p className="text-gray-600 text-xs md:text-sm hidden md:block">
                Can&apos;t find what you need? We&apos;ll plan it for you
              </p>
              <p className="text-gray-600 text-[10px] leading-tight md:hidden">
                Tailored trips
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Two-Path Journey - Simplified */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
              How it works
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              Choose your path
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-primary/5 rounded-lg md:rounded-xl p-3 md:p-5 border-2 border-primary/20 hover:border-primary/40 transition-all"
            >
              <h3 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                For Travelling Teams
              </h3>
              <ul className="space-y-2 md:space-y-3 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold text-sm md:text-base">
                    ✓
                  </span>
                  <span className="text-gray-700 text-xs md:text-sm">
                    Browse European tournaments
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold text-sm md:text-base">
                    ✓
                  </span>
                  <span className="text-gray-700 text-xs md:text-sm">
                    Connect with international clubs
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold text-sm md:text-base">
                    ✓
                  </span>
                  <span className="text-gray-700 text-xs md:text-sm">
                    Create unforgettable memories
                  </span>
                </li>
              </ul>
              <Link
                href="/events"
                className="inline-flex items-center text-primary hover:text-primary/90 font-semibold text-xs md:text-sm"
              >
                Explore
                <svg
                  className="ml-1 w-3 h-3 md:w-4 md:h-4"
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
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-5 border-2 border-gray-200 hover:border-gray-300 transition-all"
            >
              <h3 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                For Host Clubs
              </h3>
              <ul className="space-y-2 md:space-y-3 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold text-sm md:text-base">
                    ✓
                  </span>
                  <span className="text-gray-700 text-xs md:text-sm">
                    Welcome visiting teams
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold text-sm md:text-base">
                    ✓
                  </span>
                  <span className="text-gray-700 text-xs md:text-sm">
                    Create tournaments & events
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold text-sm md:text-base">
                    ✓
                  </span>
                  <span className="text-gray-700 text-xs md:text-sm">
                    Grow your club & community
                  </span>
                </li>
              </ul>
              <Link
                href="/signin"
                className="inline-flex items-center text-gray-600 hover:text-gray-700 font-semibold text-xs md:text-sm"
              >
                Admin Access
                <svg
                  className="ml-1 w-3 h-3 md:w-4 md:h-4"
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
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                What Clubs Are Saying
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                Hear from the GAA community
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                >
                  <div className="mb-4">
                    <svg
                      className="w-8 h-8 text-primary/30"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    &quot;{testimonial.content}&quot;
                  </p>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-semibold text-gray-900">
                      {testimonial.author}
                    </p>
                    {testimonial.club && (
                      <p className="text-sm text-gray-600">
                        {testimonial.club.name}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Media */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              Follow Our Journey
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Stay connected with the global GAA community
            </p>

            <div className="flex justify-center gap-4">
              <a
                href="https://www.instagram.com/playaway_travel/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl hover:scale-110 transition-all duration-200 shadow-lg"
                aria-label="Instagram"
              >
                <Instagram className="w-8 h-8 text-white" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61555666091788"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 bg-blue-600 rounded-xl hover:scale-110 transition-all duration-200 shadow-lg"
                aria-label="Facebook"
              >
                <Facebook className="w-8 h-8 text-white" />
              </a>
              <a
                href="https://x.com/GaaTrips"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 bg-black rounded-xl hover:scale-110 transition-all duration-200 shadow-lg"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-8 h-8 text-white" />
              </a>
              <a
                href="https://www.tiktok.com/@playgaaaway"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 bg-black rounded-xl hover:scale-110 transition-all duration-200 shadow-lg"
                aria-label="TikTok"
              >
                <Music2 className="w-8 h-8 text-white" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
