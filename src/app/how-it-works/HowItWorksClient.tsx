"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

type ViewType = "initial" | "travelling" | "host";

export default function HowItWorksClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewType>("initial");
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Check if user is a club admin or super admin
  const isAdmin =
    session?.user?.role === "SUPER_ADMIN" ||
    session?.user?.role === "CLUB_ADMIN";

  const handleHostClick = () => {
    if (isAdmin) {
      setCurrentView("host");
    } else {
      setShowAdminModal(true);
    }
  };
  const renderInitialView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-16"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <button
          onClick={() => setCurrentView("travelling")}
          className="bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
            For the Travelling Team
          </h3>
          <p className="text-white text-sm md:text-base">
            Learn how to find and join tournaments across Europe
          </p>
        </button>

        <button
          onClick={handleHostClick}
          className="bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
            For the Host
          </h3>
          <p className="text-white text-sm md:text-base">
            Discover how to create and manage tournaments for visiting teams
          </p>
        </button>
      </div>
    </motion.div>
  );

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const renderTravellingView = () => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.6 }}
        className="py-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            How it works for Travelling Teams
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Everything you need to know about joining tournaments across Europe
          </p>
        </div>

        {/* Navigation Tags - unified style */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 sticky top-0 bg-gray-100/95 backdrop-blur-sm py-4 z-10 border-b border-gray-200">
          <button
            onClick={() => scrollToSection("profile")}
            className="px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            1. Profile
          </button>
          <button
            onClick={() => scrollToSection("express-interest")}
            className="px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            2. Express Interest
          </button>
          <button
            onClick={() => scrollToSection("registration")}
            className="px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            3. Registration
          </button>
          <button
            onClick={() => scrollToSection("day-passes")}
            className="px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            4. Day-Passes
          </button>
          <button
            onClick={() => scrollToSection("why-playaway")}
            className="px-4 py-2 text-sm font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Why PlayAway
          </button>
        </div>

        {/* Content Sections - unified theme */}
        <div className="space-y-8">
          {/* Step 1 - Your Profile */}
          <section id="profile" className="scroll-mt-24">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Your Club Profile
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    Your profile helps hosts understand your team and tailor the
                    perfect experience for your visit.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">📋</span> What&apos;s in Your
                    Profile
                  </h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Your club name and location
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Team size and codes you play
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Travel preferences and availability
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">🎯</span> Why It Matters
                  </h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Hosts can match you with the right events
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Get personalised tournament recommendations
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Build trust with the GAA community
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2 - Express Interest */}
          <section id="express-interest" className="scroll-mt-24">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Express Interest in Visiting
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    Found a club you&apos;d like to visit? Use the{" "}
                    <span className="font-semibold text-primary">
                      &quot;Express Interest&quot;
                    </span>{" "}
                    feature to let them know you&apos;re interested in playing
                    there.
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-5 mb-6">
                <h4 className="font-semibold text-gray-800 mb-4 text-center">
                  How Express Interest Works
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      Browse club profiles
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Find clubs across Europe
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      Click &quot;Express Interest&quot;
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      On any club&apos;s calendar
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      Host receives notification
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      They&apos;ll reach out to you
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">📅</span> What You&apos;ll Share
                  </h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Preferred dates or months
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Expected squad size
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      How flexible your dates are
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Optional message to the host
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">✨</span> Why It&apos;s Useful
                  </h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      No commitment required
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Helps hosts plan tournaments
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Get early access to events
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Build connections with clubs
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-sm text-gray-700 text-center">
                  <span className="font-semibold">Pro tip:</span> Expressing
                  interest early gives hosts time to organize events around your
                  visit!
                </p>
              </div>
            </div>
          </section>

          {/* Step 3 - Team Registration */}
          <section id="registration" className="scroll-mt-24">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Register Your Team
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    Once a tournament is confirmed, secure your spot with a team
                    registration fee.
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-gray-800 font-semibold text-lg">
                      Team Registration Fee
                    </p>
                    <p className="text-gray-500 text-sm">
                      One-time fee per team
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-4xl md:text-5xl font-bold text-primary">
                      €50
                    </span>
                    <p className="text-gray-500 text-sm mt-1">
                      ~€3.33 per player (squad of 15)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="text-sm font-medium text-gray-700">
                    Guaranteed spot
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="text-sm font-medium text-gray-700">
                    Tournament coordination
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <p className="text-sm font-medium text-gray-700">
                    Event organization
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 4 - Player Day-Passes */}
          <section id="day-passes" className="scroll-mt-24">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Player Day-Passes
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    Each player pays a day-pass covering local event costs.{" "}
                    <span className="font-semibold text-primary">
                      Prices are set by the host club
                    </span>{" "}
                    based on what&apos;s included.
                  </p>
                </div>
              </div>

              {/* What's Included */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-3xl md:text-4xl mb-2">🏟️</div>
                  <div className="text-xs md:text-sm font-medium text-gray-700">
                    Pitch rental
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-3xl md:text-4xl mb-2">🍽️</div>
                  <div className="text-xs md:text-sm font-medium text-gray-700">
                    After-match meals
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-3xl md:text-4xl mb-2">🥤</div>
                  <div className="text-xs md:text-sm font-medium text-gray-700">
                    Snacks & water
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 mb-4 text-center">
                  Example Cost Breakdown
                </h4>
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center">
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200">
                    <p className="text-sm text-gray-500">Event costs</p>
                    <p className="text-xl font-bold text-gray-800">€40</p>
                    <p className="text-xs text-gray-400">Set by host</p>
                  </div>
                  <span className="text-2xl text-gray-400">+</span>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200">
                    <p className="text-sm text-gray-500">Platform fee</p>
                    <p className="text-xl font-bold text-gray-800">€5</p>
                    <p className="text-xs text-gray-400">Fixed</p>
                  </div>
                  <span className="text-2xl text-gray-400">=</span>
                  <div className="bg-primary/10 rounded-lg px-4 py-3 border border-primary/20">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-primary">€45</p>
                    <p className="text-xs text-gray-400">Per player</p>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-4 italic">
                  * This is an example only. Actual prices vary by tournament
                  and are set by each host club.
                </p>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-700 text-center">
                  <span className="font-semibold">💳 Pay upfront online.</span>{" "}
                  No cash needed on the day!
                </p>
              </div>
            </div>
          </section>

          {/* Why PlayAway */}
          <section id="why-playaway" className="scroll-mt-24">
            <div className="bg-gradient-to-br from-primary/5 to-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-md">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 text-center">
                Why Teams Love PlayAway
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💳</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">
                    Transparent Pricing
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Know exactly what you&apos;re paying for upfront - no hidden
                    fees
                  </p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Easy Booking</h4>
                  <p className="text-gray-500 text-sm">
                    Reserve spots instantly with secure online payment
                  </p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">
                    Verified Hosts
                  </h4>
                  <p className="text-gray-500 text-sm">
                    All host clubs are verified to ensure quality experiences
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Toggle Button */}
        <div className="text-center mt-12">
          <button
            onClick={handleHostClick}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            See how it works for Hosts →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  const renderHostView = () => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.6 }}
        className="py-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            How it works for Host Clubs
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Turn your club into a destination for international GAA teams
          </p>
        </div>

        {/* Navigation Tags */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 sticky top-0 bg-gray-100/95 backdrop-blur-sm py-4 z-10 border-b border-gray-200">
          <button
            onClick={() => scrollToSection("host-verification")}
            className="px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            1. Get Verified
          </button>
          <button
            onClick={() => scrollToSection("host-day-passes")}
            className="px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            2. Day-Passes
          </button>
          <button
            onClick={() => scrollToSection("host-tournament")}
            className="px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            3. Tournaments
          </button>
          <button
            onClick={() => scrollToSection("host-revenue")}
            className="px-4 py-2 text-sm font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            4. Revenue
          </button>
          <button
            onClick={() => scrollToSection("why-host")}
            className="px-4 py-2 text-sm font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Why Host
          </button>
        </div>

        {/* Content Sections - unified theme */}
        <div className="space-y-8">
          {/* Step 1 - Create Club Account & Get Verified */}
          <section id="host-verification" className="scroll-mt-24">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Create Club Account & Get Verified
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    Register your club on PlayAway and get verified as a club
                    admin to start hosting tournaments.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">📝</span> Getting started
                </h4>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Create a PlayAway account and register your club
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Complete club verification process with admin credentials
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Add club details, location, and contact information
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Once verified, access tournament creation tools
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Step 2 - Create Day-Passes */}
          <section id="host-day-passes" className="scroll-mt-24">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Create Day-Passes
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    Set up day-passes for visiting teams outside of tournaments.
                    A year-round revenue stream for your club.
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-5 mb-6">
                <h4 className="font-semibold text-gray-800 mb-4 text-center">
                  How Day-Passes Work
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      Set your price
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Flexible by season
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      Teams find you
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Via Express Interest
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      Players pay online
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      No cash on the day
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">🎟️</span> What&apos;s a Day-Pass?
                  </h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>A ticket for
                      visiting players outside tournaments
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Covers pitch access, training, and amenities
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Price set by you (can vary by season)
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">📅</span> Year-Round Revenue
                  </h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Sell day-passes any time of year
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      No need to organise a full tournament
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Perfect for casual team visits and training
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-sm text-gray-700 text-center">
                  <span className="font-semibold">💡 Pro tip:</span> Adjust your
                  day-pass price seasonally - higher during peak travel months,
                  lower in off-season to attract more visitors!
                </p>
              </div>
            </div>
          </section>

          {/* Step 3 - Create Your Tournament */}
          <section id="host-tournament" className="scroll-mt-24">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Create Your Tournament
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    Set up your tournament details, pricing, and availability on
                    the PlayAway platform.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">⚙️</span> What you control
                </h4>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Set your day-pass price (typically €40)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Choose tournament format and rules
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Decide what&apos;s included (meals, refreshments, etc.)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Set maximum number of teams
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Step 4 - Revenue Streams */}
          <section id="host-revenue" className="scroll-mt-24">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Earn Revenue from Multiple Streams
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    Host clubs receive money from both team registrations and
                    player day-passes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    From Team Registrations
                  </h4>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    €40
                  </div>
                  <p className="text-gray-500 text-sm">
                    per team that registers
                  </p>
                </div>
                <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    From Player Day-Passes
                  </h4>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    €42.50
                  </div>
                  <p className="text-gray-500 text-sm">
                    per player (your price + €2.50 bonus)
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">💰</span> Example tournament with 8
                  teams (120 players)
                </h4>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Team registrations: 8 × €40 ={" "}
                    <strong className="text-gray-800">€320</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Player day-passes: 120 × €42.50 ={" "}
                    <strong className="text-gray-800">€5,100</strong>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-lg font-bold text-primary">
                    Total revenue: €5,420
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Host with PlayAway */}
          <section id="why-host" className="scroll-mt-24">
            <div className="bg-gradient-to-br from-primary/5 to-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-md">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 text-center">
                Why Clubs Love Hosting with PlayAway
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">
                    Generate Income
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Multiple revenue streams support club finances
                  </p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">
                    Easy Management
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Handle bookings and payments through our platform
                  </p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">
                    Build Community
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Connect with GAA clubs across Europe
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Toggle Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => setCurrentView("travelling")}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            See how it works for Travelling Teams →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              How PlayAway Works
            </h1>
            {currentView !== "initial" && (
              <button
                onClick={() => setCurrentView("initial")}
                className="mb-8 text-primary hover:text-primary/80 underline text-sm"
              >
                ← Back to main menu
              </button>
            )}

            {currentView === "initial" && (
              <div className="max-w-4xl mx-auto space-y-6 text-gray-700">
                <p className="text-lg md:text-xl leading-relaxed">
                  PlayAway simplifies the travel process for GAA teams while
                  protecting European clubs who work hard to host events with
                  very limited resources.
                </p>

                <p className="text-base md:text-lg leading-relaxed">
                  European GAA clubs know exactly what a travelling team wants.
                  They find the best bang for your buck, do all the negotiating
                  in advance, and ensure high-quality components are included in
                  every tournament experience. This means better value for
                  visitors and sustainable income for host clubs.
                </p>
              </div>
            )}
          </motion.div>
        </div>
        {currentView === "initial" && renderInitialView()}
        {currentView === "travelling" && renderTravellingView()}
        {currentView === "host" && renderHostView()}
      </div>

      {/* Admin Access Required Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAdminModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            >
              <button
                onClick={() => setShowAdminModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Club Admin Access Required
                </h3>
                <p className="text-gray-600 mb-8">
                  This information is for approved club administrators only.
                  Please log in as a club admin to view host details.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push("/signin")}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                  >
                    Log in as Admin
                  </button>
                  <button
                    onClick={() => setShowAdminModal(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
