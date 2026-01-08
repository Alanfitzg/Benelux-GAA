import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Host Terms & Conditions | PlayAway",
  description:
    "Terms and conditions for hosting tournaments and events on PlayAway. Understand platform fees, host responsibilities, and payout terms.",
};

export default function HostTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Host Terms & Conditions
            </h1>
            <p className="text-lg text-white/90">
              Everything you need to know about hosting events on PlayAway
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Quick Summary Card */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-8 mb-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                How Hosting Works
              </h2>
              <p className="text-gray-500 mt-1">
                Simple, transparent pricing for clubs
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-primary mb-1">€5</div>
                <div className="text-sm text-gray-500 font-medium">
                  Platform fee
                </div>
                <div className="text-xs text-gray-400 mt-1">per player</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  100%
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Your Day-Pass
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  paid in advance
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-amber-600 mb-1">
                  +€2.50
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Bonus profit
                </div>
                <div className="text-xs text-gray-400 mt-1">per player</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  Safe
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Profit held
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  until event success
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Platform Fee Structure */}
            <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  1. Platform Fee Structure
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700">
                  PlayAway adds a platform fee of <strong>€5 per person</strong>{" "}
                  to every Day-Pass registration. This fee is split 50/50
                  between PlayAway and your club as profit.
                </p>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Example: Day-Pass at €40 per person
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">
                        Your Day-Pass price (set by you)
                      </span>
                      <span className="font-medium">€40</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Platform fee added</span>
                      <span className="font-medium">€5</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 text-primary font-bold">
                      <span>Total cost to travelling player</span>
                      <span>€45</span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Platform Fee Split (50/50)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xl font-bold text-green-600">
                        €2.50
                      </div>
                      <div className="text-sm text-gray-600">
                        To your club as <strong>PROFIT</strong>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xl font-bold text-gray-500">
                        €2.50
                      </div>
                      <div className="text-sm text-gray-600">
                        Retained by PlayAway
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-green-50 rounded-lg p-4">
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-green-800">
                      You receive 100% of your Day-Pass price + €2.50 profit per
                      player
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Your Day-Pass revenue is transferred in advance so you can
                      organise the event. The €2.50 profit is paid after the
                      event is successfully completed.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Focus on Value, Not Markup
                  </h4>
                  <p className="text-sm text-blue-700">
                    Clubs should prioritise providing excellent value in their
                    Day-Pass (great venues, quality catering, good organisation)
                    rather than marking up prices. The profit opportunity lies
                    in the platform fee split - not in overcharging visitors.
                  </p>
                </div>
              </div>
            </section>

            {/* What the Platform Fee Covers */}
            <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  2. What the Platform Fee Covers
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Payment Processing
                      </h4>
                      <p className="text-sm text-gray-600">
                        Secure card payments and bank transfers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Event Listing & Promotion
                      </h4>
                      <p className="text-sm text-gray-600">
                        Your event listed on our platform and promoted to
                        travelling teams
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Customer Support
                      </h4>
                      <p className="text-sm text-gray-600">
                        Support for you and your attendees
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Analytics & Reporting
                      </h4>
                      <p className="text-sm text-gray-600">
                        Track registrations, interests, and earnings
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Host Responsibilities */}
            <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  3. Host Responsibilities
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700">
                  As a host on PlayAway, you are responsible for:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Event Organisation:</strong> Securing venues,
                      pitches, referees, and all logistics for your event
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Accurate Information:</strong> Providing accurate
                      event details including dates, location, facilities, and
                      what&apos;s included
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Communication:</strong> Responding to enquiries
                      and keeping registered teams informed of any changes
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Safety & Insurance:</strong> Ensuring appropriate
                      insurance coverage and safety measures are in place
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Delivering the Event:</strong> Running your event
                      as advertised and providing the services listed
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      <strong>Legal Compliance:</strong> Complying with all
                      applicable local laws and regulations
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Payment & Payouts */}
            <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  4. Payment & Payouts
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      How Payments Work
                    </h4>
                    <p className="text-gray-700">
                      When someone registers for your event, they pay the full
                      amount (your Day-Pass price + €5 platform fee) through our
                      secure Stripe payment system. Payments are processed
                      within 7 days.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Two-Stage Payout System
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-200">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-bold text-sm">
                            1
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Day-Pass Revenue (In Advance)
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Your full Day-Pass revenue is transferred to you{" "}
                            <strong>before the event</strong> so you can book
                            venues, catering, and organise all necessary
                            arrangements.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-200">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-amber-600 font-bold text-sm">
                            2
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Profit Share (After Event)
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Your share of the platform fee (€2.50 per player) is
                            held in reserve and{" "}
                            <strong>
                              only transferred after the event is complete
                            </strong>{" "}
                            and visitors report a positive experience.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <p className="font-medium text-amber-800">
                          Bank Details Required
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                          You must provide valid bank account details to receive
                          payouts. We support SEPA transfers within Europe.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Cancellations & Refunds */}
            <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  5. Cancellations & Refunds
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    If You Cancel Your Event
                  </h4>
                  <p className="text-gray-700">
                    If you need to cancel your event, you must notify PlayAway
                    immediately. All registered attendees will receive a full
                    refund including the platform fee. Repeated cancellations
                    may affect your ability to host future events.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Attendee Cancellations
                  </h4>
                  <p className="text-gray-700">
                    Standard refund policy applies to attendee cancellations:
                  </p>
                  <ul className="mt-2 space-y-1 text-gray-700 text-sm">
                    <li>
                      • More than 30 days before event: Full refund minus
                      processing fees
                    </li>
                    <li>
                      • 14-30 days before event: 50% refund of your price
                      (platform fee non-refundable)
                    </li>
                    <li>
                      • Less than 14 days before event: No refund (except in
                      exceptional circumstances)
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Quality Assurance & Disputes
                  </h4>
                  <p className="text-gray-700 mb-3">
                    After each event, visitors are asked to report on their
                    experience. This feedback determines whether your profit
                    share is released.
                  </p>
                  <div className="bg-green-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-green-700">
                      <strong>Positive report:</strong> Your €2.50 per player
                      profit is transferred promptly after event completion.
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-sm text-red-700 mb-2">
                      <strong>Negative report:</strong> An investigation will
                      follow. If hosts have failed to deliver what was promised
                      in the Day-Pass description:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1 ml-4">
                      <li>• Profit share may be withheld</li>
                      <li>
                        • Partial or full refunds may be issued to visitors
                      </li>
                      <li>
                        • Repeated failures may result in suspension from the
                        platform
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Dispute Resolution
                  </h4>
                  <p className="text-sm text-blue-700">
                    PlayAway acts as an intermediary in all disputes. We will
                    review evidence from both parties and make a fair
                    determination. Our decision on profit release and refunds is
                    final.
                  </p>
                </div>
              </div>
            </section>

            {/* Event Approval */}
            <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  6. Event Approval Process
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700">
                  All events must be approved by PlayAway before they are listed
                  publicly. This ensures quality and protects our community.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Submit</h4>
                    <p className="text-sm text-gray-600">
                      Create your event with all details
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Review</h4>
                    <p className="text-sm text-gray-600">
                      We review within 48 hours
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Live</h4>
                    <p className="text-sm text-gray-600">
                      Your event goes live on approval
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Events may be rejected if they contain incomplete information,
                  inappropriate content, or don&apos;t meet our community
                  standards.
                </p>
              </div>
            </section>

            {/* Liability */}
            <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  7. Liability & Insurance
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700">
                  PlayAway is a platform that connects hosts with travelling
                  teams. We do not organise events directly and are not liable
                  for:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Injuries or accidents occurring at events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Damage to property or equipment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>
                      Quality of facilities or services provided by hosts
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Weather-related cancellations or disruptions</span>
                  </li>
                </ul>
                <div className="bg-red-50 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-red-800">
                        Insurance Required
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        As a host, you are strongly advised to have appropriate
                        public liability insurance for your events. This is your
                        responsibility.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Package Travel & Linked Travel Arrangements */}
            <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  8. Package Travel & Linked Travel Arrangements (LTA)
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="font-bold text-red-800">
                        Important Legal Notice
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Under the EU Package Travel Directive (2015/2302),
                        combining certain travel services creates legal
                        obligations. Please read this section carefully.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    What You CAN List on PlayAway
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        <strong>Tournament entry only</strong> - Registration
                        fee for pitch access, fixtures, referees, and event
                        organisation
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        <strong>Single services</strong> - One type of service
                        at a time (e.g., just the tournament, OR just
                        accommodation, but not bundled together)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        <strong>Recommendations only</strong> - You may
                        recommend hotels or transport providers, but attendees
                        must book directly and separately with those providers
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    What You CANNOT List on PlayAway
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        <strong>Bundled packages</strong> - Combining tournament
                        entry with accommodation, transport, or other travel
                        services in a single price
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        <strong>Acting as a travel agent</strong> - Booking
                        flights, hotels, or transport on behalf of attendees
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        <strong>Linked purchases</strong> - Facilitating the
                        purchase of additional travel services within 24 hours
                        of booking (this creates a &quot;Linked Travel
                        Arrangement&quot;)
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">
                    Why Does This Matter?
                  </h4>
                  <p className="text-sm text-amber-700 mb-3">
                    If you create a &quot;package&quot; or &quot;linked travel
                    arrangement&quot; under EU law, you become legally
                    responsible for:
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Insolvency protection (bonding requirements)</li>
                    <li>• Full refunds if any service provider fails</li>
                    <li>• Liability for all services in the package</li>
                    <li>• Extensive pre-contract information requirements</li>
                    <li>• ATOL/ABTA licensing (in the UK)</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Safe Approach: Keep Services Separate
                  </h4>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p>
                      <strong>Do this:</strong> &quot;Tournament entry is €30.
                      We recommend Hotel ABC nearby - contact them directly at
                      hotel@example.com&quot;
                    </p>
                    <p>
                      <strong>Not this:</strong> &quot;€150 includes tournament
                      entry, 2 nights accommodation, and airport transfers&quot;
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  PlayAway will reject event submissions that appear to bundle
                  travel services. If you wish to offer package holidays, you
                  must obtain appropriate licensing and insurance independently.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  9. Changes to These Terms
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700">
                  We may update these terms from time to time. If we make
                  significant changes, we will notify you via email. Continued
                  use of the platform after changes constitutes acceptance of
                  the new terms.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  10. Questions?
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  If you have any questions about these terms or hosting on
                  PlayAway, please get in touch.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Contact Us
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>
            </section>
          </div>

          {/* Last Updated */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Last updated: January 2026
          </p>

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
