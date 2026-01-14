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
  acceptedTeamTypes?: string[];
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

            {/* Right Column - Europe Map with Flying Hurl */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[60%] lg:w-[55%]"
            >
              <Image
                src="/Europe-map.png.png"
                alt="Europe Map"
                width={1600}
                height={1200}
                className="w-full h-auto opacity-50 scale-150 translate-x-[15%]"
                unoptimized
              />

              {/* Flying Hurl Animations - Smooth gliding paths */}
              <div className="absolute inset-0 pointer-events-none">
                {/* First Hurl - Northern route to Scandinavia */}
                <motion.img
                  src="/flying-hurl.png.png"
                  alt="Flying Hurl"
                  className="absolute w-16 h-auto md:w-20 lg:w-24"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 1, 0],
                    left: ["58%", "68%", "78%", "88%", "98%"],
                    top: ["15%", "12%", "10%", "8%", "6%"],
                    rotate: [-8, -5, -3, -1, 2],
                  }}
                  transition={{
                    opacity: {
                      delay: 0,
                      duration: 16,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 6,
                    },
                    left: {
                      delay: 0,
                      duration: 16,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 6,
                    },
                    top: {
                      delay: 0,
                      duration: 16,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 6,
                    },
                    rotate: {
                      delay: 0,
                      duration: 16,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 6,
                    },
                  }}
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                  }}
                />
                {/* Second Hurl - Central route to Eastern Europe */}
                <motion.img
                  src="/flying-hurl.png.png"
                  alt="Flying Hurl"
                  className="absolute w-14 h-auto md:w-18 lg:w-22"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 1, 0],
                    left: ["55%", "65%", "75%", "85%", "95%"],
                    top: ["38%", "36%", "34%", "33%", "32%"],
                    rotate: [-5, -4, -3, -2, -1],
                  }}
                  transition={{
                    opacity: {
                      delay: 7,
                      duration: 14,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 8,
                    },
                    left: {
                      delay: 7,
                      duration: 14,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 8,
                    },
                    top: {
                      delay: 7,
                      duration: 14,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 8,
                    },
                    rotate: {
                      delay: 7,
                      duration: 14,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 8,
                    },
                  }}
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                  }}
                />
                {/* Third Hurl - Mediterranean/Southern route, right to left */}
                <motion.img
                  src="/flying-hurl.png.png"
                  alt="Flying Hurl"
                  className="absolute w-12 h-auto md:w-16 lg:w-20"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 1, 0],
                    left: ["92%", "70%", "48%", "26%", "5%"],
                    top: ["82%", "78%", "75%", "73%", "72%"],
                    rotate: [-4, -3, -2, -2, -3],
                  }}
                  transition={{
                    opacity: {
                      delay: 4,
                      duration: 20,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 3,
                    },
                    left: {
                      delay: 4,
                      duration: 20,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 3,
                    },
                    top: {
                      delay: 4,
                      duration: 20,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 3,
                    },
                    rotate: {
                      delay: 4,
                      duration: 20,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 3,
                    },
                  }}
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                    scaleX: -1,
                  }}
                />
                {/* Fourth Hurl - Iberia to Baltic diagonal climb */}
                <motion.img
                  src="/flying-hurl.png.png"
                  alt="Flying Hurl"
                  className="absolute w-14 h-auto md:w-18 lg:w-22"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 1, 0],
                    left: ["15%", "35%", "55%", "75%", "90%"],
                    top: ["85%", "65%", "45%", "25%", "10%"],
                    rotate: [-32, -32, -32, -32, -32],
                  }}
                  transition={{
                    opacity: {
                      delay: 11,
                      duration: 18,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 4,
                    },
                    left: {
                      delay: 11,
                      duration: 18,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 4,
                    },
                    top: {
                      delay: 11,
                      duration: 18,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 4,
                    },
                    rotate: {
                      delay: 11,
                      duration: 18,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 4,
                    },
                  }}
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                  }}
                />
                {/* Fifth Hurl - Nordic to France descent */}
                <motion.img
                  src="/flying-hurl.png.png"
                  alt="Flying Hurl"
                  className="absolute w-12 h-auto md:w-16 lg:w-20"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 1, 0],
                    left: ["88%", "68%", "48%", "28%", "12%"],
                    top: ["8%", "28%", "48%", "65%", "78%"],
                    rotate: [32, 32, 32, 32, 32],
                  }}
                  transition={{
                    opacity: {
                      delay: 14,
                      duration: 18,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 4,
                    },
                    left: {
                      delay: 14,
                      duration: 18,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 4,
                    },
                    top: {
                      delay: 14,
                      duration: 18,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 4,
                    },
                    rotate: {
                      delay: 14,
                      duration: 18,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 4,
                    },
                  }}
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                    scaleX: -1,
                  }}
                />
                {/* Sixth Hurl - Mid-Europe horizontal cruise */}
                <motion.img
                  src="/flying-hurl.png.png"
                  alt="Flying Hurl"
                  className="absolute w-14 h-auto md:w-18 lg:w-22"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 1, 0],
                    left: ["8%", "28%", "48%", "68%", "88%"],
                    top: ["55%", "54%", "55%", "54%", "55%"],
                    rotate: [0, 0, 0, 0, 0],
                  }}
                  transition={{
                    opacity: {
                      delay: 0,
                      duration: 18,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 4,
                    },
                    left: {
                      delay: 0,
                      duration: 18,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 4,
                    },
                    top: {
                      delay: 0,
                      duration: 18,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 4,
                    },
                    rotate: {
                      delay: 0,
                      duration: 18,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 4,
                    },
                  }}
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                  }}
                />

                {/* Continental Hurls - Stay within visible area, fade while visible */}
                {/* Seventh Hurl - Short hop over Germany/Poland */}
                <motion.img
                  src="/flying-hurl.png.png"
                  alt="Flying Hurl"
                  className="absolute w-12 h-auto md:w-14 lg:w-16"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.9, 0.9, 0.5, 0],
                    left: ["45%", "55%", "65%", "72%", "78%"],
                    top: ["22%", "20%", "19%", "20%", "22%"],
                    rotate: [-5, -3, 0, 3, 5],
                  }}
                  transition={{
                    opacity: {
                      delay: 3,
                      duration: 12,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 8,
                    },
                    left: {
                      delay: 3,
                      duration: 12,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 8,
                    },
                    top: {
                      delay: 3,
                      duration: 12,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 8,
                    },
                    rotate: {
                      delay: 3,
                      duration: 12,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 8,
                    },
                  }}
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                  }}
                />
                {/* Eighth Hurl - Short hop over Italy/Alps region */}
                <motion.img
                  src="/flying-hurl.png.png"
                  alt="Flying Hurl"
                  className="absolute w-10 h-auto md:w-12 lg:w-14"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.85, 0.85, 0.4, 0],
                    left: ["65%", "55%", "45%", "38%", "32%"],
                    top: ["68%", "65%", "63%", "62%", "63%"],
                    rotate: [3, 1, 0, -1, -3],
                  }}
                  transition={{
                    opacity: {
                      delay: 7,
                      duration: 10,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 10,
                    },
                    left: {
                      delay: 7,
                      duration: 10,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 10,
                    },
                    top: {
                      delay: 7,
                      duration: 10,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 10,
                    },
                    rotate: {
                      delay: 7,
                      duration: 10,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 10,
                    },
                  }}
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                    scaleX: -1,
                  }}
                />
                {/* Ninth Hurl - Short hop over France/Benelux */}
                <motion.img
                  src="/flying-hurl.png.png"
                  alt="Flying Hurl"
                  className="absolute w-11 h-auto md:w-13 lg:w-15"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0.8, 0.3, 0],
                    left: ["22%", "32%", "42%", "50%", "55%"],
                    top: ["48%", "42%", "38%", "36%", "35%"],
                    rotate: [-15, -15, -15, -15, -15],
                  }}
                  transition={{
                    opacity: {
                      delay: 12,
                      duration: 11,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 9,
                    },
                    left: {
                      delay: 12,
                      duration: 11,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 9,
                    },
                    top: {
                      delay: 12,
                      duration: 11,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 9,
                    },
                    rotate: {
                      delay: 12,
                      duration: 11,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 9,
                    },
                  }}
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                  }}
                />
                {/* Tenth Hurl - Short hop over Spain/Portugal */}
                <motion.img
                  src="/flying-hurl.png.png"
                  alt="Flying Hurl"
                  className="absolute w-10 h-auto md:w-12 lg:w-14"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.75, 0.75, 0.35, 0],
                    left: ["18%", "28%", "38%", "45%", "50%"],
                    top: ["72%", "70%", "69%", "70%", "72%"],
                    rotate: [-5, -3, 0, 3, 5],
                  }}
                  transition={{
                    opacity: {
                      delay: 16,
                      duration: 9,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 11,
                    },
                    left: {
                      delay: 16,
                      duration: 9,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 11,
                    },
                    top: {
                      delay: 16,
                      duration: 9,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 11,
                    },
                    rotate: {
                      delay: 16,
                      duration: 9,
                      ease: "linear",
                      repeat: Infinity,
                      repeatDelay: 11,
                    },
                  }}
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Mobile Layout - Text with flying hurls */}
          <div className="md:hidden relative w-full h-screen flex items-center justify-center overflow-hidden">
            {/* Flying Hurls - Above and Below Text (smooth gliding) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Upper Hurl - Left to right (gentle descent) */}
              <motion.img
                src="/flying-hurl.png.png"
                alt="Flying Hurl"
                className="absolute w-44 h-auto"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.7, 0.7, 0.7, 0],
                  left: ["-15%", "20%", "50%", "80%", "110%"],
                  top: ["10%", "11%", "12%", "13%", "14%"],
                  rotate: [1, 0, 0, 0, 1],
                }}
                transition={{
                  opacity: {
                    delay: 2,
                    duration: 16,
                    ease: "linear",
                    repeat: Infinity,
                    repeatDelay: 4,
                  },
                  left: {
                    delay: 2,
                    duration: 16,
                    ease: "linear",
                    repeat: Infinity,
                    repeatDelay: 4,
                  },
                  top: {
                    delay: 2,
                    duration: 16,
                    ease: "linear",
                    repeat: Infinity,
                    repeatDelay: 4,
                  },
                  rotate: {
                    delay: 2,
                    duration: 16,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 4,
                  },
                }}
                style={{
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                }}
              />
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

                        {/* Sport Type Badges */}
                        {event.acceptedTeamTypes &&
                          event.acceptedTeamTypes.length > 0 && (
                            <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1">
                              {event.acceptedTeamTypes
                                .slice(0, 3)
                                .map((sport) => (
                                  <span
                                    key={sport}
                                    className="text-xs font-semibold text-white bg-primary/90 px-2 py-0.5 rounded-md shadow-sm backdrop-blur-sm"
                                  >
                                    {sport}
                                  </span>
                                ))}
                              {event.acceptedTeamTypes.length > 3 && (
                                <span className="text-xs font-semibold text-white bg-primary/90 px-2 py-0.5 rounded-md shadow-sm backdrop-blur-sm">
                                  +{event.acceptedTeamTypes.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                        {/* Event Status Badge - Bottom right to avoid overlap with sport badges */}
                        {isEventPast(event.startDate) && (
                          <div className="absolute bottom-3 right-3 z-10">
                            <span className="text-xs font-semibold text-red-600 bg-white/95 px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm italic">
                              Past Event
                            </span>
                          </div>
                        )}

                        {/* Demo Notice Badge */}
                        <div className="absolute bottom-3 left-3 z-10">
                          <span className="text-xs font-semibold text-white bg-amber-500 px-2 py-1 rounded-md shadow-sm">
                            Demo Date
                          </span>
                        </div>
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
              <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 mb-1 whitespace-nowrap">
                Clubs
              </h3>
              <p className="text-gray-600 text-xs md:text-sm hidden md:block">
                Connect with GAA communities across {displayStats.countries}+
                countries
              </p>
              <p className="text-gray-600 text-[10px] sm:text-xs leading-tight md:hidden">
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
              <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 mb-1 whitespace-nowrap">
                Tournaments
              </h3>
              <p className="text-gray-600 text-xs md:text-sm hidden md:block">
                Browse approved events in Spain, Germany, France & beyond
              </p>
              <p className="text-gray-600 text-[10px] sm:text-xs leading-tight md:hidden">
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
              <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-900 mb-1 whitespace-nowrap">
                Tailored for You
              </h3>
              <p className="text-gray-600 text-xs md:text-sm hidden md:block">
                Can&apos;t find what you need? We&apos;ll plan it for you
              </p>
              <p className="text-gray-600 text-[10px] sm:text-xs leading-tight md:hidden">
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
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                For Travelling Teams
              </h3>
              <ul className="space-y-2 md:space-y-3 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold text-sm md:text-base">
                    ✓
                  </span>
                  <span className="text-gray-700 text-sm md:text-base">
                    Browse European tournaments
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold text-sm md:text-base">
                    ✓
                  </span>
                  <span className="text-gray-700 text-sm md:text-base">
                    Connect with international clubs
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold text-sm md:text-base">
                    ✓
                  </span>
                  <span className="text-gray-700 text-sm md:text-base">
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
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                For Host Clubs
              </h3>
              <ul className="space-y-2 md:space-y-3 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold text-sm md:text-base">
                    ✓
                  </span>
                  <span className="text-gray-700 text-sm md:text-base">
                    Welcome visiting teams
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold text-sm md:text-base">
                    ✓
                  </span>
                  <span className="text-gray-700 text-sm md:text-base">
                    Create tournaments & events
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 font-bold text-sm md:text-base">
                    ✓
                  </span>
                  <span className="text-gray-700 text-sm md:text-base">
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
