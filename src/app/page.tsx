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
        const clubs = Array.isArray(clubsData) ? clubsData : clubsData.clubs || [];
        const events = Array.isArray(eventsData) ? eventsData : [];
        
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
          tournaments: events.filter((e: Event) => e.eventType === "Tournament").length,
          countries: countries.size,
        });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[700px]">
        {/* Team huddle background image */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/team-huddle.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Gradient overlay - darker at top for text, transparent at bottom to show players */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-transparent" />
        
        {/* Content positioned in upper portion */}
        <div className="relative container mx-auto px-6 pt-32 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Connect Your Gaelic Club with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Teams Across Europe
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Organize tournaments, find opponents, or join existing events. 
              The trusted platform for Gaelic clubs to connect, compete, and earn.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 justify-center mb-16">
              <Link
                href="/map"
                className="px-8 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Explore Map
              </Link>
              <Link
                href="/clubs"
                className="px-8 py-3 bg-transparent text-white border-2 border-white rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                Browse All Clubs
              </Link>
            </div>
          </motion.div>
        </div>

        {/* User Journey Selection - Positioned to overlap hero */}
        <div className="relative z-10 -mt-20">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Player Path */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 bg-white hover:shadow-3xl"
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 to-green-600" />
                <div className="p-8">
                  <div className="mb-6">
                    <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold uppercase tracking-wide">
                      For Players & Teams
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Travel & Play Gaelic Sports Abroad</h3>
                  <p className="text-gray-600 mb-6">
                    Join tournaments, connect with clubs across Europe, and experience Gaelic sports culture in new destinations.
                  </p>
                  <ul className="space-y-3 text-gray-700 mb-8">
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-green-600 text-sm font-bold">✓</span>
                      </div>
                      <span>Browse tournaments and events across 15+ countries</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-green-600 text-sm font-bold">✓</span>
                      </div>
                      <span>Connect directly with verified host clubs</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-green-600 text-sm font-bold">✓</span>
                      </div>
                      <span>Plan your perfect Gaelic sports trip with local insights</span>
                    </li>
                  </ul>
                  <Link
                    href="/events"
                    className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center"
                  >
                    Explore Tournaments →
                  </Link>
                </div>
              </motion.div>

              {/* Host Path */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 bg-white hover:shadow-3xl"
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
                <div className="p-8">
                  <div className="mb-6">
                    <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold uppercase tracking-wide">
                      For Clubs
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Host Teams & Generate Revenue</h3>
                  <p className="text-gray-600 mb-6">
                    Turn your facilities into a revenue stream by hosting tournaments and visiting teams.
                  </p>
                  <ul className="space-y-3 text-gray-700 mb-8">
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-blue-600 text-sm font-bold">✓</span>
                      </div>
                      <span>Create tournaments and attract teams Europe-wide</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-blue-600 text-sm font-bold">✓</span>
                      </div>
                      <span>Offer accommodation and facility packages</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-blue-600 text-sm font-bold">✓</span>
                      </div>
                      <span>Build lasting connections with clubs abroad</span>
                    </li>
                  </ul>
                  <Link
                    href="/clubs/register"
                    className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center"
                  >
                    Start Hosting →
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Gaelic Trips?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The platform built by the Gaelic sports community, for the Gaelic sports community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Trust & Safety */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Clubs</h3>
              <p className="text-gray-600">
                Every club is verified, ensuring safe and reliable connections across the GAA network
              </p>
            </motion.div>

            {/* Community */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gaelic Community</h3>
              <p className="text-gray-600">
                Connect with clubs that share your passion for Gaelic sports and Irish culture
              </p>
            </motion.div>

            {/* Revenue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Club Revenue</h3>
              <p className="text-gray-600">
                Generate income for your club by hosting tournaments and visiting teams
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
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
              <div className="text-5xl font-bold mb-2">{stats.tournaments}+</div>
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

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes, whether you&apos;re looking to play or host
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* For Players */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                For Players & Teams
              </h3>
              <div className="space-y-6">
                {[
                  { step: 1, title: "Browse Events", desc: "Explore tournaments and trips across Europe" },
                  { step: 2, title: "Register Interest", desc: "Express interest in events that match your schedule" },
                  { step: 3, title: "Connect", desc: "Get in touch with host clubs to finalize details" },
                  { step: 4, title: "Travel & Play", desc: "Enjoy your Gaelic sports experience abroad" }
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start"
                  >
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* For Hosts */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                For Host Clubs
              </h3>
              <div className="space-y-6">
                {[
                  { step: 1, title: "Create Profile", desc: "Set up your club profile with facilities info" },
                  { step: 2, title: "Post Events", desc: "Create tournaments or offer hosting packages" },
                  { step: 3, title: "Receive Inquiries", desc: "Get contacted by interested teams" },
                  { step: 4, title: "Host & Earn", desc: "Welcome teams and generate club revenue" }
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start"
                  >
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Connect Your Club?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the growing network of Gaelic clubs making connections across Europe
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors text-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-colors text-lg"
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