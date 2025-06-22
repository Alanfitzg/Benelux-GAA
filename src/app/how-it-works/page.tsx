import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Gaelic Trips",
  description:
    "Learn how Gaelic Trips supports GAA clubs through team tickets, day passes, and community-first principles. Discover how our platform works and puts money back into clubs.",
  keywords: [
    "how gaelic trips works",
    "GAA club support",
    "team tickets",
    "day passes",
    "GAA tournament platform",
    "club revenue",
    "gaelic games travel",
  ],
  openGraph: {
    title: "How It Works | Gaelic Trips",
    description:
      "Learn how Gaelic Trips supports GAA clubs and puts money back into the community through our transparent platform.",
    url: "https://gaa-trips.vercel.app/how-it-works",
    type: "website",
  },
};

export default function HowItWorksPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Gaelic Trips</h1>
          <p className="text-xl md:text-2xl mb-2">
            How It Works, How It Pays, and Why It Matters
          </p>
          <p className="text-lg opacity-90">
            We&apos;re not a travel agent. We&apos;re a community platform.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Introduction */}
        <div className="mb-12">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Gaelic Trips is an independent company - built by experienced
            European GAA volunteers, but in no way connected to or controlled by
            the GAA. Our mission is to support the grassroots by making travel,
            tournaments, and team events easier and more rewarding for clubs
            abroad.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            We help international clubs benefit from the tourism opportunity
            they already create - without extra admin or financial risk.
            Everything we do is designed to reduce hassle, simplify logistics,
            and return value to those doing the work on the ground. Most
            importantly, we want to protect developing clubs from exploitation,
            by making sure the value they create stays in their hands.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Here&apos;s how the platform works - and how it puts money back into
            clubs:
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            How It Works
          </h2>

          {/* Team Tickets */}
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                  1
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-green-800 mb-3">
                  Team Tickets (€50 per team)
                </h3>
                <p className="text-gray-700 mb-4">
                  When a team signs up for a tournament, they pay a flat entry
                  fee.
                </p>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">
                      €40 goes to the host club
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                      €40
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      €10 goes to Gaelic Trips for platform operations
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                      €10
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3 italic">
                  Team tickets are a simple support mechanism for clubs with no
                  owned revenue streams — helping them plan, commit, and deliver
                  better events.
                </p>
              </div>
            </div>
          </div>

          {/* Day Passes */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                  2
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-blue-800 mb-3">
                  Day Passes (Up to €60 per person = maximum cost allowed)
                </h3>
                <p className="text-gray-700 mb-4">
                  Each travelling player purchases a Day Pass that covers core
                  event costs:
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                    <div className="text-blue-600 font-semibold text-sm">
                      Pitch rental
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                    <div className="text-blue-600 font-semibold text-sm">
                      After-match meals
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                    <div className="text-blue-600 font-semibold text-sm">
                      Insurance
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                    <div className="text-blue-600 font-semibold text-sm">
                      Snacks & drinks
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                  <p className="text-sm text-yellow-800 mb-2">
                    💬 <strong>Clubs decide the price of their Day Pass</strong>
                    , based on local costs.
                  </p>
                  <p className="text-sm text-yellow-800">
                    ✅ <strong>We inspect every Day Pass</strong> to ensure it
                    meets our standards and delivers great value.
                  </p>
                </div>

                <p className="text-gray-700 mb-3">
                  We then add a €5 platform fee per person:
                </p>

                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">
                      ~€40 (or the full base amount) goes directly to the host
                      club — paid in advance
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                      €40
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">
                      €2.50 is returned to the host as additional profit
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                      €2.50
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      €2.50 goes to Gaelic Trips to support the platform
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                      €2.50
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-3 italic">
                  Everything is prepaid. No cash collection. No financial stress
                  on the day.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            What Makes Us Different?
          </h2>
          <p className="text-xl text-center text-gray-600 mb-8">
            Our Rules. Our Principles.
          </p>
          <p className="text-lg text-gray-700 text-center mb-8">
            We&apos;re not here to extract value - we&apos;re here to protect it.
          </p>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border-l-4 border-primary">
              <blockquote className="text-lg font-medium text-gray-900 mb-2">
                &ldquo;The platform fee will not exceed the price of a pint.&rdquo;
              </blockquote>
              <p className="text-gray-600">
                Travel should be affordable - and a player should still be able
                to enjoy a pint at the end of the day.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-25 p-6 rounded-lg border-l-4 border-blue-500">
              <blockquote className="text-lg font-medium text-gray-900 mb-2">
                &ldquo;Every trip must benefit the local GAA community - no
                exceptions.&rdquo;
              </blockquote>
              <p className="text-gray-600">
                A portion of profit is always shared with the nearest GAA
                stakeholder — a club, board, or committee.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-25 p-6 rounded-lg border-l-4 border-purple-500">
              <blockquote className="text-lg font-medium text-gray-900 mb-2">
                &ldquo;Our business shall never hinder regional boards or fixtures. If
                they object, we pause.&rdquo;
              </blockquote>
              <p className="text-gray-600">
                We operate with full transparency and respect for governing
                bodies.
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-25 p-6 rounded-lg border-l-4 border-orange-500">
              <blockquote className="text-lg font-medium text-gray-900 mb-2">
                &ldquo;We grow the game by growing together.&rdquo;
              </blockquote>
              <p className="text-gray-600">
                Smaller clubs and lesser-known cities get extra marketing,
                visibility, and travel incentives.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-primary text-white p-8 rounded-lg text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join the community platform that puts clubs first.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/clubs/register"
              className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Register Your Club
            </Link>
            <Link
              href="/events"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
