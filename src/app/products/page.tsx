import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Products | PlayAway",
  description:
    "Learn about PlayAway's two product types: Team Ticket for tournaments and Player Day-Pass for individual team visits.",
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1a3352] to-[#264673] text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Platform Products
            </h1>
            <p className="text-xl text-blue-100">
              Two simple products to help European clubs earn from hosting
              visiting teams and tournaments.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Platform Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Platform Overview
            </h2>
            <p className="text-gray-600 mb-4">
              The PlayAway Travel Platform is a centralised booking system for
              GAA clubs across Europe, comparable in functionality to
              Eventbrite.
            </p>
            <p className="text-gray-600 mb-4">
              It allows clubs to earn profit from the tourism opportunity,
              without bearing much of the financial licensing burdens or legal
              risks.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-semibold">
                Gaelic Trips Ltd absorbs all the applicable liabilities.
              </p>
            </div>
          </div>

          {/* Two Products Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Product 1: Team Ticket */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#1a3352] text-white p-6">
                <div className="text-sm font-medium text-blue-200 mb-1">
                  Product 1
                </div>
                <h3 className="text-2xl font-bold">Team Ticket</h3>
                <p className="text-blue-100 mt-2">
                  For tournaments and invitational events
                </p>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900">€50</div>
                  <div className="text-gray-500">per visiting team</div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Platform fee</span>
                    <span className="font-semibold text-gray-900">
                      €5 per team
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Your club earns</span>
                    <span className="font-bold text-green-600 text-lg">
                      €45 per team
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Why Team Tickets?
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Prevents last-minute dropouts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Allows teams to reserve tournament spots</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Can be waived for other GGE clubs</span>
                    </li>
                  </ul>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  €50 split between 15 players = just €3.33 each
                </p>
              </div>
            </div>

            {/* Product 2: Player Day-Pass */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#264673] text-white p-6">
                <div className="text-sm font-medium text-blue-200 mb-1">
                  Product 2
                </div>
                <h3 className="text-2xl font-bold">Player Day-Pass</h3>
                <p className="text-blue-100 mt-2">For individual team visits</p>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900">€40+</div>
                  <div className="text-gray-500">
                    per person (you set the price)
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Platform fee</span>
                    <span className="font-semibold text-gray-900">
                      €5 per person
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Fee split (50/50)</span>
                    <span className="font-bold text-green-600 text-lg">
                      €2.50 to you
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Day-Pass Components
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Pitchside water & snacks</li>
                    <li>• Facilities rental</li>
                    <li>• Player insurance</li>
                    <li>• After-match dinner</li>
                    <li>• After-dinner drinks</li>
                  </ul>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  You set the Day-Pass price based on your costs
                </p>
              </div>
            </div>
          </div>

          {/* Platform Fee Explanation */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              The Platform Fee Explained
            </h2>
            <p className="text-gray-600 mb-6">
              Clubs should prioritise providing{" "}
              <strong>value over profit</strong> on their Day-Passes. Your aim
              should be to secure optimal deals and deliver excellent value,
              thereby incentivising teams to visit.
            </p>
            <p className="text-gray-800 font-semibold mb-6">
              The profit opportunity lies in the platform fee.
            </p>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Example:</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Your Day-Pass price</span>
                  <span className="font-semibold">€40 per person</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">+ Platform fee</span>
                  <span className="font-semibold">€5 per person</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">
                    Total cost to traveller
                  </span>
                  <span className="font-bold text-lg">€45 per person</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">€2.50</div>
                  <div className="text-sm text-green-700">
                    Your profit per player
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">€2.50</div>
                  <div className="text-sm text-blue-700">
                    Retained by Gaelic Trips
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Example */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tournament Example
            </h2>
            <p className="text-gray-500 mb-6">
              Host a 1-pitch tournament (8 teams, 09:30 - 18:00)
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Assumptions:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 8 teams total (2 home teams + 6 visiting teams)</li>
                <li>• Average team size: 15 players</li>
                <li>• Day-Pass price: €40 per person</li>
              </ul>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-blue-900">
                    Day-Pass Revenue (paid in advance)
                  </span>
                  <span className="font-bold text-blue-900">€3,600</span>
                </div>
                <p className="text-sm text-blue-700">
                  6 visiting teams × 15 players × €40 = €3,600 to organise the
                  event
                </p>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 mb-3">Your Profit:</h4>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <span className="font-medium text-gray-900">
                    Product 1: Team Tickets
                  </span>
                  <p className="text-sm text-gray-500">
                    6 teams × €50 - (€5 fee × 6)
                  </p>
                </div>
                <span className="font-bold text-green-600 text-lg">€270</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <span className="font-medium text-gray-900">
                    Product 2: Day-Pass Platform Fee
                  </span>
                  <p className="text-sm text-gray-500">90 players × €2.50</p>
                </div>
                <span className="font-bold text-green-600 text-lg">€225</span>
              </div>
            </div>

            <div className="bg-green-100 rounded-xl p-6 text-center">
              <div className="text-sm font-medium text-green-700 mb-1">
                Total Profit from 1-Pitch Tournament
              </div>
              <div className="text-4xl font-bold text-green-700">€495</div>
            </div>
          </div>

          {/* Additional Costs Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-10">
            <h3 className="font-semibold text-amber-900 mb-2">
              Additional Costs to Consider
            </h3>
            <p className="text-amber-800 text-sm">
              When setting your Day-Pass price, remember to account for: First
              aid, referee costs, trophies & medals, entertainment, and
              volunteer expenses. These are your responsibility as the host.
            </p>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Ready to start hosting?
            </h3>
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
