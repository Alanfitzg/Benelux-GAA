"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HowItWorksClient() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              How PlayAway Works
            </h1>
            <p className="text-lg md:text-xl mb-4">
              A community platform that helps clubs host and attend GAA events
              across Europe
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-6">
            We make it easy to:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-gray-50 p-4 md:p-6 rounded-xl">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl md:text-3xl">🎟️</span>
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-800">
                Reserve spots at tournaments
              </h3>
            </div>
            <div className="bg-gray-50 p-4 md:p-6 rounded-xl">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl md:text-3xl">💳</span>
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-800">
                Simplify Payments in Advance
              </h3>
            </div>
            <div className="bg-gray-50 p-4 md:p-6 rounded-xl">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl md:text-3xl">🤝</span>
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-800">
                Support grassroots GAA clubs directly
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Team Tickets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-green-800 mb-2">
                  Team Tickets – €50 per Team
                </h3>
                <p className="text-gray-700 text-sm md:text-lg leading-relaxed">
                  When your club registers for a tournament, you pay a flat €50
                  fee.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 border border-green-200">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                    €40
                  </div>
                  <div className="text-gray-700 font-medium text-sm md:text-base">
                    goes to the host club
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-green-200">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
                    €10
                  </div>
                  <div className="text-gray-700 font-medium text-sm md:text-base">
                    goes to Gaelic Trips (to run the platform)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-600/10 rounded-xl p-6">
              <h4 className="text-sm md:text-base font-bold text-green-800 mb-3">Why it matters:</h4>
              <div className="space-y-2 text-gray-700 text-sm md:text-base">
                <p>
                  • Team tickets help clubs plan better and prevent last-minute
                  dropouts
                </p>
                <p>
                  • Split across a squad of 15, it&apos;s just over €3 per
                  player
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Player Day-Passes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-800 mb-2">
                  Player Day-Passes
                </h3>
                <p className="text-gray-700 text-sm md:text-lg leading-relaxed">
                  Each travelling player pays a Day-Pass that covers their share
                  of local event costs — like:
                </p>
              </div>
            </div>

            {/* What's Included */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
                <div className="text-3xl md:text-4xl mb-2">🏟️</div>
                <div className="text-sm font-medium text-gray-700">
                  Pitch rental
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
                <div className="text-3xl md:text-4xl mb-2">🛡️</div>
                <div className="text-sm font-medium text-gray-700">
                  Insurance
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
                <div className="text-3xl md:text-4xl mb-2">🍽️</div>
                <div className="text-sm font-medium text-gray-700">
                  After-match meals
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
                <div className="text-3xl md:text-4xl mb-2">🥤</div>
                <div className="text-sm font-medium text-gray-700">
                  Snacks & water
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-blue-200 mb-6">
              <p className="text-gray-700 mb-4 text-sm md:text-base">
                <strong>Clubs set their own Day-Pass price</strong> (usually
                around €40).
                <br />
                <strong>
                  Gaelic Trips adds a small platform fee of €5 per person.
                </strong>
              </p>

              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="text-sm md:text-base font-bold text-blue-800 mb-3">
                  Here&apos;s how that €5 is split:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm md:text-base">
                      €2.50 goes back to the host club (supporting club
                      finances)
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                      €2.50
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm md:text-base">
                      €2.50 goes to Gaelic Trips (to power the system)
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                      €2.50
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-600/10 rounded-xl p-6">
              <h4 className="text-sm md:text-base font-bold text-blue-800 mb-2">
                Total example cost for a player:
              </h4>
              <div className="text-lg md:text-xl font-bold text-gray-800">
                €40 (Day-Pass) + €5 (Platform fee) = €45
              </div>
              <p className="text-gray-600 mt-2 italic text-sm md:text-base">
                Everything is paid upfront online. No cash. No hassle on the
                day.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pricing Summary Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">
                Pricing Summary
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left font-semibold text-gray-800 text-sm md:text-base">
                      Who pays
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left font-semibold text-gray-800 text-sm md:text-base">
                      What they pay
                    </th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left font-semibold text-gray-800 text-sm md:text-base">
                      Who gets the money
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-gray-900 text-sm md:text-base">
                      A team
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className="bg-green-100 text-green-800 px-2 md:px-3 py-1 rounded-full font-semibold text-xs md:text-sm">
                        €50
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-gray-700 text-sm md:text-base">
                      €40 to host club, €10 to Gaelic Trips
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-gray-900 text-sm md:text-base">
                      A player
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className="bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full font-semibold text-xs md:text-sm">
                        ~€45
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-gray-700 text-sm md:text-base">
                      ~€40 to host club, €2.50 to club (extra), €2.50 to Gaelic
                      Trips
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl md:text-4xl">💰</span>
              </div>
              <h4 className="text-sm md:text-base font-bold text-green-800 mb-2">
                ✅ Clubs earn income
              </h4>
              <p className="text-gray-700 text-sm">
                Direct payments to host clubs with additional profit sharing
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl md:text-4xl">👥</span>
              </div>
              <h4 className="text-sm md:text-base font-bold text-blue-800 mb-2">
                ✅ Visitors know what they&apos;re paying for
              </h4>
              <p className="text-gray-700 text-sm">
                Transparent pricing with no hidden costs or cash collection
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl md:text-4xl">⚡</span>
              </div>
              <h4 className="text-sm md:text-base font-bold text-purple-800 mb-2">
                ✅ Gaelic Trips keeps the lights on
              </h4>
              <p className="text-gray-700 text-sm">
                Platform fees ensure we can continue growing the game
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-gradient-to-r from-primary to-primary-light text-white p-8 rounded-2xl text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join the community platform that puts clubs first and grows the game
            together
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/clubs/register"
              className="bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Register Your Club
            </Link>
            <Link
              href="/events"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary transition-colors"
            >
              Browse Tournaments
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
