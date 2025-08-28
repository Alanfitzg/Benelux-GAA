"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Instagram, Facebook, Twitter, Music2 } from "lucide-react";

interface Club {
  location?: string;
}

interface Event {
  eventType: string;
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
  
  const statsRef = useRef(null);
  const isInView = useInView(statsRef, { once: true });

  // Fetch stats
  useEffect(() => {
    Promise.all([
      fetch("/api/clubs").then((res) => res.json()),
      fetch("/api/events").then((res) => res.json()),
    ])
      .then(([clubsData, eventsData]) => {
        const clubs = Array.isArray(clubsData)
          ? clubsData
          : clubsData.clubs || [];
        const events = Array.isArray(eventsData)
          ? eventsData
          : eventsData.events || [];

        // Count unique countries
        const countries = new Set();
        clubs.forEach((club: Club) => {
          if (club.location) {
            const parts = club.location.split(",");
            if (parts.length > 1) {
              countries.add(parts[parts.length - 1].trim());
            }
          }
        });

        setStats({
          clubs: clubs.length,
          tournaments: events.filter((e: Event) => e.eventType === "Tournament")
            .length,
          countries: countries.size,
        });
      })
      .catch(console.error);
  }, []);

  // Animate counting when stats section is in view
  useEffect(() => {
    if (isInView && (stats.clubs > 0 || stats.tournaments > 0 || stats.countries > 0)) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const interval = duration / steps;
      
      let currentStep = 0;
      
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        // Easing function for smooth animation
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 min-h-[500px] md:min-h-[800px] flex items-start">
        {/* Team huddle background image */}
        <div
          className="absolute inset-0 opacity-90 bg-no-repeat bg-center"
          style={{
            backgroundImage: "url(/team-huddle.png)",
            backgroundSize: "auto 100%",
            backgroundPosition: "center 70%",
          }}
        >
          <style jsx>{`
            @media (min-width: 768px) {
              div {
                background-size: cover !important;
              }
            }
          `}</style>
        </div>
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/30 to-slate-900/60"></div>

        <div className="relative container mx-auto px-6 pt-20 md:pt-24 pb-16 z-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-2xl md:text-5xl font-bold text-white mb-4">
                The Gateway to Gaelic Games Worldwide
              </h1>
              <p className="text-lg md:text-2xl text-emerald-100 mb-8">
                <span className="hidden md:inline">Connect with the global GAA Community</span>
                <span className="md:hidden">Connect, Travel, and link up with international Gaelic Games Communities</span>
              </p>


              <div className="flex flex-row gap-2 sm:gap-4 justify-center mt-20 sm:mt-0">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center px-3 py-3 sm:px-8 sm:py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-lg"
                >
                  <span className="hidden sm:inline">European tournaments</span>
                  <span className="sm:hidden">Tournaments</span>
                  <svg
                    className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5"
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
                  className="inline-flex items-center justify-center px-3 py-3 sm:px-8 sm:py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg text-sm sm:text-lg"
                >
                  <span className="hidden sm:inline">European clubs</span>
                  <span className="sm:hidden">Clubs</span>
                  <svg
                    className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5"
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
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator - Desktop Only */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 0.5
          }}
          className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center text-white/60 hover:text-white/80 transition-colors cursor-pointer"
               onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
            <span className="text-xs uppercase tracking-widest mb-2">Scroll</span>
            <svg 
              className="w-6 h-6 animate-bounce" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* How It Works - Split Paths */}
      <section className="py-8 md:py-16 bg-white">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-12"
          >
            <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-2">
              How it works
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              in brief
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* For Players */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-primary/5 rounded-2xl p-8">
                <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                  For Travelling Teams
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-gray-900">
                        <span className="hidden md:inline">See what&apos;s going on in Europe</span>
                        <span className="md:hidden">Browse European tournaments & events</span>
                      </h4>
                      <p className="hidden md:block text-gray-600 text-xs md:text-sm">
                        Browse tournaments across Germany, Spain, France and
                        beyond
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-gray-900">
                        <span className="hidden md:inline">Connect Across Borders</span>
                        <span className="md:hidden">Connect with international clubs</span>
                      </h4>
                      <p className="hidden md:block text-gray-600 text-xs md:text-sm">
                        Link up with international clubs for unforgettable trips
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-gray-900">
                        <span className="hidden md:inline">Take GAA International</span>
                        <span className="md:hidden">Create relationships with European clubs</span>
                      </h4>
                      <p className="hidden md:block text-gray-600 text-xs md:text-sm">
                        Bring your game to Europe&apos;s most exciting cities
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/events"
                  className="mt-6 inline-flex items-center text-primary hover:text-primary/90 font-medium border border-primary hover:border-primary/90 px-4 py-2 rounded-lg transition-all duration-200 text-xs md:text-sm"
                >
                  Explore Europe
                  <svg
                    className="ml-1 w-4 h-4"
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
              </div>
            </motion.div>

            {/* For Hosts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                  For Host Clubs
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-gray-900">
                        Open Your Doors
                      </h4>
                      <p className="text-gray-600 text-xs md:text-sm">
                        Welcome visiting teams for tournaments and trips!
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-gray-900">
                        Create Tournaments
                      </h4>
                      <p className="text-gray-600 text-xs md:text-sm">
                        Invitational tournaments strengthen clubs. Increase activity at home and build up your community
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-gray-900">
                        Grow Your Club
                      </h4>
                      <p className="text-gray-600 text-xs md:text-sm">
                        Generate revenue, create memories, unite communities
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/signin"
                  className="mt-6 inline-flex items-center text-gray-600 hover:text-gray-700 font-medium border border-gray-600 hover:border-gray-700 px-4 py-2 rounded-lg transition-all duration-200 text-xs md:text-sm"
                >
                  Club Admin Access
                  <svg
                    className="ml-1 w-4 h-4"
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
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 bg-primary text-white" ref={statsRef}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-2xl md:text-5xl font-bold mb-1 md:mb-2">{displayStats.clubs}+</div>
              <div className="text-sm md:text-xl">Clubs</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-2xl md:text-5xl font-bold mb-1 md:mb-2">
                {displayStats.tournaments}+
              </div>
              <div className="text-sm md:text-xl">Tournaments</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-2xl md:text-5xl font-bold mb-1 md:mb-2">{displayStats.countries}+</div>
              <div className="text-sm md:text-xl">Countries</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-4">
              Follow Our Journey
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Stay connected with the global GAA community on social media
            </p>
            
            {/* Social Media Icons */}
            <div className="flex justify-center gap-6">
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

      {/* Join the Community */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-6">
              The Directory of European Invitational Tournaments
            </h2>
            <p className="text-base md:text-xl text-gray-600 mb-8">
              All of the tournaments listed here are approved by the governing bodies within Gaelic Games Europe
            </p>
            <div className="flex justify-center">
              <Link
                href="/events"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-lg"
              >
                See All Tournaments
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl md:text-4xl font-bold mb-6">
              Ready to Connect Your Club?
            </h2>
            <p className="text-base md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the growing network of Gaelic clubs making connections across
              Europe
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-slate-800 transition-colors text-lg"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
