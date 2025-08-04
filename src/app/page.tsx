"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 min-h-[500px] md:min-h-[800px] flex items-start">
        {/* Team huddle background image */}
        <div
          className="absolute inset-0 opacity-60 bg-no-repeat bg-center"
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
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-900/80"></div>

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
                Connect with the global GAA Community
              </p>


              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
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
                <Link
                  href="/clubs"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg text-lg"
                >
                  See All Clubs
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
        </div>
      </section>

      {/* How It Works - Split Paths */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
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
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-6">
                  For Travelling Teams
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-gray-900">
                        See what&apos;s going on in Europe
                      </h4>
                      <p className="text-gray-600 text-xs md:text-sm">
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
                        Connect Across Borders
                      </h4>
                      <p className="text-gray-600 text-xs md:text-sm">
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
                        Take GAA International
                      </h4>
                      <p className="text-gray-600 text-xs md:text-sm">
                        Bring your game to Europe&apos;s most exciting cities
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/events"
                  className="mt-6 inline-flex items-center text-primary hover:text-primary/90 font-medium"
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
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-6">
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
                        Welcome teams from Ireland and Britain to your city
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
                        Attract visiting teams and build international
                        connections
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
                        Generate revenue and strengthen GAA networks across
                        Europe
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/signin"
                  className="mt-6 inline-flex items-center text-gray-600 hover:text-gray-700 font-medium"
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
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold mb-2">{stats.clubs}+</div>
              <div className="text-xl">Gaelic Clubs</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold mb-2">
                {stats.tournaments}+
              </div>
              <div className="text-xl">Tournaments</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold mb-2">{stats.countries}+</div>
              <div className="text-xl">Countries</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from teams and clubs who&apos;ve made the international
              connection
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Team Member Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 shadow-md"
            >
              <div className="mb-4">
                <div className="flex text-primary mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">
                  &quot;PlayAway opened up a whole new world for our club. We
                  went from playing local teams to competing in Barcelona and
                  Amsterdam. The connections we&apos;ve made have been
                  incredible.&quot;
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-bold text-lg">🏐</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sarah Murphy</h4>
                  <p className="text-gray-600 text-sm">
                    Captain, Dublin Wanderers
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Host Club Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 shadow-md"
            >
              <div className="mb-4">
                <div className="flex text-primary mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">
                  &quot;Hosting Irish and British teams has transformed our
                  club. We&apos;ve generated real revenue while building lasting
                  friendships. The platform makes organizing everything so
                  simple.&quot;
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-bold text-lg">🏠</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Hans Mueller</h4>
                  <p className="text-gray-600 text-sm">
                    President, Munich Colmcilles
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tournament Organizer Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 shadow-md"
            >
              <div className="mb-4">
                <div className="flex text-primary mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">
                  &quot;As someone who helps coordinate our club&apos;s international
                  trips, PlayAway has been a game-changer. Finding quality
                  tournaments and trustworthy hosts used to take months - now it
                  takes minutes.&quot;
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-bold text-lg">🗺️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Conor O&apos;Brien
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Tour Coordinator, Cork Champions
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
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
              Your Bridge to Global GAA
            </h2>
            <p className="text-base md:text-xl text-gray-600 mb-8">
              From the hills of Ireland to the clubs of Berlin, Barcelona, and
              beyond. Take your GAA journey international.
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
