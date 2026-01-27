"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProductsPage() {
  const [showExclusions, setShowExclusions] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1a3352] to-[#264673] text-white py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-medium">Club Admin Guide</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              How Your Club Earns Money
            </h1>
            <p className="text-lg text-blue-100">
              A complete guide to understanding PlayAway&apos;s products and how
              your club profits from hosting.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto">
          {/* The Big Picture */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              The Big Picture
            </h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-700 mb-4">
                Since COVID, the travel industry has been transformed by new EU
                regulations and stricter enforcement of consumer protection
                laws. The <strong>EU Package Travel Directive</strong> now
                places significant legal obligations on anyone organising travel
                experiences - obligations that most GAA clubs simply cannot meet
                on their own.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>PlayAway absorbs this risk.</strong> Gaelic Trips Ltd
                holds the necessary licences and insurance, allowing European
                clubs to participate in the tourism opportunity without bearing
                the legal burden. For the first time, European clubs can be the
                ultimate beneficiaries of their own industry.
              </p>
              <div className="bg-gradient-to-r from-[#1a3352] to-[#264673] rounded-lg p-5 text-white">
                <p className="font-semibold text-lg mb-2">
                  A Unique Opportunity
                </p>
                <p className="text-blue-100">
                  This platform exists to protect the whole industry - ensuring
                  GAA tourism can continue to thrive in Europe while keeping
                  clubs compliant and profitable.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-10 sticky top-0 z-10 bg-gray-100 -mx-6 px-6 py-3 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              <a
                href="#products"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-[#1a3352] hover:text-white transition-colors shadow-sm"
              >
                What We Sell
              </a>
              <a
                href="#day-pass"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-[#1a3352] hover:text-white transition-colors shadow-sm"
              >
                Day-Pass
              </a>
              <a
                href="#team-ticket"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-[#1a3352] hover:text-white transition-colors shadow-sm"
              >
                Team Ticket
              </a>
              <a
                href="#profit"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-[#1a3352] hover:text-white transition-colors shadow-sm"
              >
                Your Profit
              </a>
              <a
                href="#examples"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-[#1a3352] hover:text-white transition-colors shadow-sm"
              >
                Examples
              </a>
              <a
                href="#summary"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-[#1a3352] hover:text-white transition-colors shadow-sm"
              >
                Summary
              </a>
            </div>
          </div>

          {/* Section 1: What We Sell */}
          <div id="products" className="mb-10 scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What We Sell
            </h2>
            <p className="text-gray-600 mb-6">
              PlayAway sells two products. They serve different purposes and are
              used in different situations.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Day-Pass Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-emerald-500">
                <div className="bg-emerald-600 text-white px-5 py-3">
                  <div className="text-xl font-bold">Day-Pass</div>
                  <div className="text-emerald-100 text-sm">
                    Per-player hospitality fee
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    You Decide
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Set your price based on what you provide
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Covers facilities, food & hospitality
                    </li>
                    <li className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Each visiting player buys one
                    </li>
                    <li className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Used for ALL visits (standalone & tournaments)
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Purpose
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      Recover your hosting costs
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Ticket Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-[#1a3352]">
                <div className="bg-[#1a3352] text-white px-5 py-3">
                  <div className="text-xl font-bold">Team Ticket</div>
                  <div className="text-blue-200 text-sm">
                    Tournament registration fee
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    €50
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Fixed price per team
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-[#1a3352] flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Secures a team&apos;s tournament spot
                    </li>
                    <li className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-[#1a3352] flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Each visiting team pays once
                    </li>
                    <li className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-[#1a3352] flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Used for TOURNAMENTS only
                    </li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Purpose
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      Prevent last-minute dropouts
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong className="text-[#1a3352]">Key difference:</strong>{" "}
                Day-Pass is per player and covers what you provide. Team Ticket
                is per team and secures their commitment to your tournament.
              </p>
            </div>
          </div>

          {/* Section 2: The Day-Pass In Detail */}
          <div id="day-pass" className="mb-10 scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              The Day-Pass In Detail
            </h2>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
              <p className="text-gray-700 mb-4">
                The Day-Pass is your hospitality offering. The purpose is to
                ensure all your costs as a host are covered. You decide what to
                include and set the price accordingly. All Day-Passes are
                reviewed by PlayAway staff before going live.
              </p>

              <div className="bg-amber-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-amber-900 mb-3">
                  Suggested components:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-amber-800">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Pitchside water
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Pitchside snack
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Facilities rental
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Player insurance
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    After-match dinner
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    After-dinner drinks
                  </div>
                </div>
              </div>

              {/* Example Day-Pass */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Example: €40 Day-Pass
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pitch hire (shared)</span>
                    <span>€5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water & snacks</span>
                    <span>€5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Player insurance</span>
                    <span>€5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dinner</span>
                    <span>€20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Drinks voucher</span>
                    <span>€5</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold">
                    <span>Your Day-Pass price</span>
                    <span>€40</span>
                  </div>
                </div>
              </div>

              {/* What's excluded */}
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowExclusions(!showExclusions)}
                  className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="font-medium text-red-900 text-sm">
                      What Day-Pass Cannot Include (Legal)
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-red-600 transition-transform ${showExclusions ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showExclusions && (
                  <div className="p-4 bg-white border-t border-red-200">
                    <p className="text-sm text-gray-600 mb-3">
                      Under EU Package Travel Directive (2015/2302), these{" "}
                      <strong>cannot</strong> be bundled:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">
                          <strong>Accommodation</strong> - hotels, B&Bs,
                          overnight stays
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">
                          <strong>Transport</strong> - flights, coach transfers,
                          car hire
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">
                          <strong>Multi-day tours</strong> - excursions over 24
                          hours
                        </span>
                      </li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32015L2302"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          EU Directive
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                        <a
                          href="/platform-rules"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          Platform Rules
                          <svg
                            className="w-3 h-3"
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
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: The Team Ticket In Detail */}
          <div id="team-ticket" className="mb-10 scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              The Team Ticket In Detail
            </h2>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <p className="text-gray-700 mb-4">
                The Team Ticket is a{" "}
                <strong>tournament registration fee</strong>. It&apos;s only
                used when you host a tournament - not for standalone visits.
              </p>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-3">
                  Why it exists:
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      <strong>Prevents dropouts</strong> - teams have skin in
                      the game
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      <strong>Secures commitment</strong> - you can plan with
                      confidence
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      <strong>Additional revenue</strong> - €45 profit per team
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  The money flow:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Team pays:</span>
                    <span className="font-medium">€50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform fee:</span>
                    <span className="font-medium">- €5</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-green-700">
                      <span>You receive:</span>
                      <span>€45</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                <strong>When used:</strong> Only for tournaments. Each visiting
                team pays one Team Ticket to register. Your home teams
                don&apos;t pay.
              </div>
            </div>
          </div>

          {/* Section 4: Your Profit Explained */}
          <div id="profit" className="mb-10 scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Profit Explained
            </h2>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
                <p className="text-gray-800 font-medium">
                  <span className="text-green-600">Key principle:</span> The
                  Day-Pass price you set covers your hosting costs. It&apos;s
                  for <strong>cost recovery, not profit</strong>.
                </p>
              </div>

              <div className="bg-green-600 text-white rounded-lg p-4 mb-4">
                <p className="font-bold text-center text-lg">
                  Your profit comes from the Platform Fee
                </p>
              </div>

              <p className="text-gray-700 mb-4">
                Gaelic Trips adds a <strong>€5 platform fee</strong> to every
                Day-Pass. This fee is split 50/50:
              </p>

              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex-1 bg-white border-2 border-green-400 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">€2.50</div>
                  <div className="text-sm font-medium text-green-800">
                    Your PROFIT
                  </div>
                  <div className="text-xs text-green-600">
                    per visiting player
                  </div>
                </div>
                <div className="text-xl text-gray-400 font-bold">+</div>
                <div className="flex-1 bg-white border-2 border-blue-400 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">€2.50</div>
                  <div className="text-sm font-medium text-blue-800">
                    PlayAway
                  </div>
                  <div className="text-xs text-blue-600">platform revenue</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  What the traveller pays (example):
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Day-Pass price:</span>
                    <span className="font-medium">€40</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      + Platform fee (automatic):
                    </span>
                    <span className="font-medium">€5</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Traveller pays:</span>
                      <span>€45</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <strong>Remember:</strong> Focus on providing great value in
                your Day-Pass to attract more teams. More visiting players =
                more €2.50 profits.
              </div>
            </div>
          </div>

          {/* Section 5: See It In Action */}
          <div id="examples" className="mb-10 scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              See It In Action
            </h2>
            <div className="space-y-4">
              {/* Scenario A: Standalone Visits */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-emerald-600 text-white px-5 py-3">
                  <div className="font-bold">
                    Example A: Standalone Team Visit
                  </div>
                  <div className="text-sm text-emerald-100">
                    A team visits for training or a friendly - not part of any
                    tournament
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                      Day-Pass only
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Each player on the visiting team buys a Day-Pass. No Team
                    Ticket needed.
                  </p>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="text-sm text-emerald-800 mb-3">
                      <strong>Scenario:</strong> 25-player team visits your club
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>25 × €40 Day-Pass =</span>
                        <span className="font-medium">
                          €1,000{" "}
                          <span className="text-gray-500">(cost recovery)</span>
                        </span>
                      </div>
                      <div className="flex justify-between text-green-700 font-bold pt-2 border-t border-emerald-200">
                        <span>25 × €2.50 profit =</span>
                        <span>€62.50 profit</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scenario B: Tournament */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-[#1a3352] text-white px-5 py-3">
                  <div className="font-bold">Example B: Tournament Hosting</div>
                  <div className="text-sm text-blue-200">
                    You organise a tournament with multiple visiting teams
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Team Ticket
                    </div>
                    <span className="text-gray-400">+</span>
                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                      Day-Pass
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Each visiting team pays a Team Ticket to register, plus each
                    player buys a Day-Pass.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-800 mb-3">
                      <strong>Scenario:</strong> 8-team tournament (6 visiting,
                      2 home), 20 players each
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>6 × €50 Team Ticket =</span>
                        <span className="font-medium">€300</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span className="pl-4">Platform fee: 6 × €5 =</span>
                        <span>- €30</span>
                      </div>
                      <div className="flex justify-between text-green-700">
                        <span className="pl-4">Team Ticket profit:</span>
                        <span className="font-medium">€270</span>
                      </div>

                      <div className="border-t border-blue-200 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span>120 × €40 Day-Pass =</span>
                          <span className="font-medium">
                            €4,800{" "}
                            <span className="text-gray-500">
                              (cost recovery)
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between text-green-700">
                          <span className="pl-4">120 × €2.50 profit:</span>
                          <span className="font-medium">€300</span>
                        </div>
                      </div>

                      <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between text-green-700 font-bold text-base">
                        <span>Total profit:</span>
                        <span>€570</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Quick Reference */}
          <div id="summary" className="mb-10 scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Reference
            </h2>
            <div className="bg-gradient-to-br from-[#1a3352] to-[#264673] rounded-xl shadow-sm p-6 text-white">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-blue-200 text-sm mb-1">Team Ticket</div>
                  <div className="text-2xl font-bold">€45 profit</div>
                  <div className="text-blue-200 text-xs">per visiting team</div>
                  <div className="text-xs text-blue-300 mt-2">
                    Tournaments only
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-blue-200 text-sm mb-1">Day-Pass</div>
                  <div className="text-2xl font-bold">€2.50 profit</div>
                  <div className="text-blue-200 text-xs">
                    per visiting player
                  </div>
                  <div className="text-xs text-blue-300 mt-2">
                    All visits (standalone & tournaments)
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-sm text-blue-100">
                <strong className="text-white">Remember:</strong> Day-Pass
                revenue (€40+) covers your costs. Your profit comes from the
                platform fee split (€2.50 per player) plus Team Ticket profit
                (€45 per team for tournaments).
              </div>
            </div>
          </div>

          {/* Additional Costs Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-10">
            <h3 className="font-semibold text-amber-900 mb-2">
              Don&apos;t Forget These Costs
            </h3>
            <p className="text-amber-800 text-sm">
              When setting your Day-Pass price, account for: first aid, referee
              costs, trophies & medals, entertainment, and volunteer expenses.
              These are your responsibility as host.
            </p>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to start earning?
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first event and start hosting visiting teams.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/events/create"
                className="inline-flex items-center gap-2 bg-[#1a3352] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#264673] transition-colors"
              >
                Create an Event
              </Link>
              <Link
                href="/host-terms"
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                View Host Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
