import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions - Gaelic Trips",
  description: "Terms and conditions for using the Gaelic Trips platform",
};

export default function TermsAndConditions() {
  const currentDate = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terms and Conditions
            </h1>
            <p className="text-lg text-gray-600">
              Effective Date: {currentDate}
            </p>
            <p className="text-gray-600 mt-2">
              Welcome to GaelicTrips.com. By accessing or using this website,
              you agree to comply with and be bound by the following Terms and
              Conditions.
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            {/* Introduction */}
            <section className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed">
                This website is owned and operated by{" "}
                <strong>Gaelic Trips Ltd</strong>, a company registered in
                Ireland. If you do not agree with any part of these terms,
                please do not use our website.
              </p>
            </section>

            {/* Definitions */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                1. Definitions
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>
                    &ldquo;Gaelic Trips&rdquo;, &ldquo;we&rdquo;,
                    &ldquo;us&rdquo;, or &ldquo;our&rdquo;
                  </strong>{" "}
                  refers to Gaelic Trips Ltd.
                </p>
                <p>
                  <strong>
                    &ldquo;User&rdquo;, &ldquo;you&rdquo; or &ldquo;your&rdquo;
                  </strong>{" "}
                  means any individual or entity using the website.
                </p>
                <p>
                  <strong>&ldquo;Host Club&rdquo;</strong> refers to any
                  GAA-affiliated club that lists a product or event on the
                  platform.
                </p>
                <p>
                  <strong>
                    &ldquo;Visitor&rdquo; or &ldquo;Travelling Team&rdquo;
                  </strong>{" "}
                  refers to any team or individual purchasing a product listed
                  on Gaelic Trips.
                </p>
              </div>
            </section>

            {/* Use of Website */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                2. Use of Website
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                This site is intended for the promotion and coordination of
                Gaelic Games-related events and services. You agree to use the
                site for lawful purposes only, and not to:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Commit fraud, misrepresent identities or affiliations.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Interfere with the security or functionality of the website.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Upload or distribute viruses or other harmful code.
                </li>
              </ul>
            </section>

            {/* Booking & Payment */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                3. Booking & Payment
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>All bookings are processed securely via Stripe.</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Payment links are valid for 7 days.</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    Payment must be completed in full before services are
                    confirmed.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    Team Tickets and Day Passes are non-transferable unless
                    explicitly allowed by the host club.
                  </span>
                </li>
              </ul>
            </section>

            {/* Product Classification */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                4. Product Classification
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Important:</strong> Gaelic Trips does not sell package
                  holidays. Products sold are classified as{" "}
                  <strong>Linked Travel Arrangements (LTAs)</strong> as per
                  Directive (EU) 2015/2302. No flights, accommodation, or
                  transport are included unless otherwise stated.
                </p>
              </div>
            </section>

            {/* Responsibilities */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                5. Responsibilities
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>Host Clubs</strong> are responsible for delivering
                    all components described in their Day Pass listings.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>Travelling Teams</strong> are responsible for
                    ensuring accurate information at booking and full
                    participation.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>Gaelic Trips Ltd</strong> acts as a facilitator and
                    not a direct service provider, unless explicitly stated.
                  </span>
                </li>
              </ul>
            </section>

            {/* Cancellations & Refunds */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                6. Cancellations & Refunds
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    Cancellations are governed by the specific Day Pass or Team
                    Ticket terms.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    If the host club fails to deliver the promised service,
                    Gaelic Trips reserves the right to withhold profit
                    disbursements pending resolution.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    Refunds are considered on a case-by-case basis and must be
                    initiated within <strong>5 days post-event</strong>.
                  </span>
                </li>
              </ul>
            </section>

            {/* Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                7. Liability
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-gray-700 leading-relaxed font-medium">
                  Gaelic Trips Ltd is not liable for:
                </p>
              </div>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Injuries, delays, or disruptions during events.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Misrepresentations by host clubs.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Loss or damage to property.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                However, we will investigate and mediate all formal complaints
                in good faith.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                8. Intellectual Property
              </h2>
              <p className="text-gray-700 leading-relaxed">
                All content on GaelicTrips.com is the property of Gaelic Trips
                Ltd or its licensors. You may not reproduce, republish, or
                distribute any content without permission.
              </p>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                9. Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We comply with the General Data Protection Regulation (GDPR) and
                Irish Data Protection Acts. For full details, see our{" "}
                <a
                  href="/privacy"
                  className="text-primary font-medium hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                10. Modifications
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to update these Terms and Conditions at any
                time. Changes will be posted on this page and will take effect
                immediately.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                11. Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by the laws of Ireland. Any disputes
                shall be subject to the exclusive jurisdiction of Irish courts.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms and Conditions,
                please contact us at:{" "}
                <a
                  href="mailto:legal@gaelictrips.com"
                  className="text-primary font-medium hover:underline"
                >
                  legal@gaelictrips.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
