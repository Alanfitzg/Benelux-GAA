"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ViewType = "initial" | "travelling" | "host";

export default function HowItWorksClient() {
  const [currentView, setCurrentView] = useState<ViewType>("initial");
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
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">For the Travelling Team</h3>
          <p className="text-white text-sm md:text-base">
            Learn how to find and join tournaments across Europe
          </p>
        </button>
        
        <button
          onClick={() => setCurrentView("host")}
          className="bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">For the Host</h3>
          <p className="text-white text-sm md:text-base">
            Discover how to create and manage tournaments for visiting teams
          </p>
        </button>
      </div>
    </motion.div>
  );

  const renderTravellingView = () => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.6 }}
        className="py-8"
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
            How it works for Travelling Teams
          </h2>
          <p className="text-gray-600 text-lg">
            Everything you need to know about joining tournaments
          </p>
        </div>

        {/* Team Registration Process */}
        <div className="space-y-12">
          {/* Step 1 - Profile Setup */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-800 mb-2">
                  Set Up Your Club Profile
                </h3>
                <p className="text-gray-700 text-sm md:text-lg leading-relaxed">
                  Create your PlayAway account and build a comprehensive club profile to help hosts understand your team&apos;s needs and preferences.
                </p>
              </div>
            </div>

            <div className="bg-blue-600/10 rounded-xl p-6">
              <h4 className="text-sm md:text-base font-bold text-blue-800 mb-3">Building your profile:</h4>
              <div className="space-y-2 text-gray-700 text-sm md:text-base">
                <p>• Create a PlayAway account and add your club details</p>
                <p>• Complete the custom trip form to share your preferences</p>
                <p>• Specify team size, budget range, and travel interests</p>
                <p>• Help hosts tailor perfect tournament experiences for your club</p>
              </div>
            </div>
          </div>

          {/* Step 2 - Team Tickets */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-green-800 mb-2">
                  Register Your Team - €50 per Team
                </h3>
                <p className="text-gray-700 text-sm md:text-lg leading-relaxed">
                  Reserve your spot at the tournament with a team registration fee of €50.
                </p>
              </div>
            </div>

            <div className="bg-green-600/10 rounded-xl p-6">
              <h4 className="text-sm md:text-base font-bold text-green-800 mb-3">What this covers:</h4>
              <div className="space-y-2 text-gray-700 text-sm md:text-base">
                <p>• Guaranteed spot in the tournament</p>
                <p>• Tournament organization and coordination</p>
                <p>• Split across a squad of 15, it&apos;s just over €3 per player</p>
              </div>
            </div>
          </div>

          {/* Step 3 - Player Day-Passes */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-8 border-2 border-purple-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-purple-800 mb-2">
                  Player Day-Passes (~€45 per player)
                </h3>
                <p className="text-gray-700 text-sm md:text-lg leading-relaxed">
                  Each player pays a day-pass that covers local event costs and includes everything needed for the tournament day.
                </p>
              </div>
            </div>

            {/* What&apos;s Included */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center border border-purple-200">
                <div className="text-3xl md:text-4xl mb-2">🏟️</div>
                <div className="text-sm font-medium text-gray-700">Pitch rental</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-purple-200">
                <div className="text-3xl md:text-4xl mb-2">🍽️</div>
                <div className="text-sm font-medium text-gray-700">After-match meals</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-purple-200">
                <div className="text-3xl md:text-4xl mb-2">🥤</div>
                <div className="text-sm font-medium text-gray-700">Snacks & water</div>
              </div>
            </div>

            <div className="bg-purple-600/10 rounded-xl p-6">
              <h4 className="text-sm md:text-base font-bold text-purple-800 mb-2">
                Typical cost breakdown:
              </h4>
              <div className="text-lg md:text-xl font-bold text-gray-800">
                €40 (Event costs) + €5 (Platform fee) = €45 total
              </div>
              <p className="text-gray-600 mt-2 italic text-sm md:text-base">
                Pay upfront online. No cash needed on the day.
              </p>
            </div>
          </div>

          {/* Benefits for Travelling Teams */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
              Why teams love PlayAway
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">💳</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Transparent Pricing</h4>
                <p className="text-gray-600 text-sm">Know exactly what you&apos;re paying for upfront</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl">⚡</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Easy Booking</h4>
                <p className="text-gray-600 text-sm">Reserve spots instantly with secure online payment</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-2xl">🤝</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Reliable Events</h4>
                <p className="text-gray-600 text-sm">Verified host clubs ensure quality experiences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => setCurrentView("host")}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
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
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-4">
            How it works for Host Clubs
          </h2>
          <p className="text-gray-600 text-lg">
            Turn your club into a destination for international GAA teams
          </p>
        </div>

        {/* Host Revenue Process */}
        <div className="space-y-12">
          {/* Step 1 - Create Club Account & Get Verified */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-gray-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2">
                  Create Club Account & Get Verified
                </h3>
                <p className="text-gray-700 text-sm md:text-lg leading-relaxed">
                  Register your club on PlayAway and get verified as a club admin to start hosting tournaments.
                </p>
              </div>
            </div>

            <div className="bg-gray-600/10 rounded-xl p-6">
              <h4 className="text-sm md:text-base font-bold text-gray-800 mb-3">Getting started:</h4>
              <div className="space-y-2 text-gray-700 text-sm md:text-base">
                <p>• Create a PlayAway account and register your club</p>
                <p>• Complete club verification process with admin credentials</p>
                <p>• Add club details, location, and contact information</p>
                <p>• Once verified, access tournament creation tools</p>
              </div>
            </div>
          </div>

          {/* Step 2 - Create Your Tournament */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-800 mb-2">
                  Create Your Tournament
                </h3>
                <p className="text-gray-700 text-sm md:text-lg leading-relaxed">
                  Set up your tournament details, pricing, and availability on the PlayAway platform.
                </p>
              </div>
            </div>

            <div className="bg-blue-600/10 rounded-xl p-6">
              <h4 className="text-sm md:text-base font-bold text-blue-800 mb-3">What you control:</h4>
              <div className="space-y-2 text-gray-700 text-sm md:text-base">
                <p>• Set your day-pass price (typically €40)</p>
                <p>• Choose tournament format and rules</p>
                <p>• Decide what&apos;s included (meals, refreshments, etc.)</p>
                <p>• Set maximum number of teams</p>
              </div>
            </div>
          </div>

          {/* Step 3 - Revenue Streams */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-green-800 mb-2">
                  Earn Revenue from Multiple Streams
                </h3>
                <p className="text-gray-700 text-sm md:text-lg leading-relaxed">
                  Host clubs receive money from both team registrations and player day-passes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 border border-green-200">
                <h4 className="text-lg font-bold text-green-800 mb-2">From Team Registrations</h4>
                <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">€40</div>
                <p className="text-gray-700 text-sm">per team that registers</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-green-200">
                <h4 className="text-lg font-bold text-green-800 mb-2">From Player Day-Passes</h4>
                <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">€42.50</div>
                <p className="text-gray-700 text-sm">per player (your price + €2.50 bonus)</p>
              </div>
            </div>

            <div className="bg-green-600/10 rounded-xl p-6">
              <h4 className="text-sm md:text-base font-bold text-green-800 mb-3">Example tournament with 8 teams (120 players):</h4>
              <div className="space-y-2 text-gray-700 text-sm md:text-base">
                <p>• Team registrations: 8 × €40 = <strong>€320</strong></p>
                <p>• Player day-passes: 120 × €42.50 = <strong>€5,100</strong></p>
                <p className="text-lg font-bold text-green-800">Total revenue: €5,420</p>
              </div>
            </div>
          </div>

          {/* Benefits for Host Clubs */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
              Why clubs love hosting with PlayAway
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">💰</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Generate Income</h4>
                <p className="text-gray-600 text-sm">Multiple revenue streams support club finances</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-2xl">📱</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Easy Management</h4>
                <p className="text-gray-600 text-sm">Handle bookings and payments through our platform</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-2xl">🌍</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Build Community</h4>
                <p className="text-gray-600 text-sm">Connect with GAA clubs across Europe</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => setCurrentView("travelling")}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            See how it works for Travelling Teams →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="bg-white">
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
                  PlayAway simplifies the travel process for GAA teams while protecting European clubs who work hard to host events with very limited resources.
                </p>
                
                <p className="text-base md:text-lg leading-relaxed">
                  European GAA clubs know exactly what a travelling team wants. They find the best bang for your buck, do all the negotiating in advance, and ensure high-quality components are included in every tournament experience. This means better value for visitors and sustainable income for host clubs.
                </p>
              </div>
            )}
          </motion.div>
        </div>
        {currentView === "initial" && renderInitialView()}
        {currentView === "travelling" && renderTravellingView()}
        {currentView === "host" && renderHostView()}
      </div>
    </div>
  );
}
