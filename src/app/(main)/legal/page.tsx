import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Compliance - Gaelic Trips",
  description:
    "Legal compliance and regulatory information for Gaelic Trips platform",
};

export default function LegalCompliance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Legal Compliance
            </h1>
            <p className="text-lg text-gray-600">
              Gaelic Trips Ltd operates with full awareness and respect for the
              legal frameworks that govern travel services and consumer
              protection across Europe.
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            {/* Legal Status */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                1. Legal Status of Gaelic Trips Products
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our core offerings—Team Tickets and Day Passes—are classified
                  as <strong>Linked Travel Arrangements (LTAs)</strong> under
                  Directive (EU) 2015/2302. They do not meet the criteria of a
                  &ldquo;package holiday&rdquo; because they exclude
                  accommodation, flights, or transport. This ensures reduced
                  regulatory burden while still providing protections to
                  consumers in case of insolvency by the primary service
                  provider.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We avoid packaging multiple services together in a single
                  price or transaction unless verified to remain within LTA
                  definitions.
                </p>
              </div>
            </section>

            {/* EU Compliance */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                2. EU Legal Compliance
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    Directive (EU) 2015/2302 on Package Travel and Linked Travel
                    Arrangements:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Gaelic Trips ensures that customers are clearly informed
                      when they are booking an LTA, not a package.
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Required standardised pre-contractual information is
                      provided to all travellers.
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Insolvency protection is in place where applicable, as per
                      the directive.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    General Data Protection Regulation (GDPR):
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Gaelic Trips collects only the minimum necessary data.
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      All user data is handled in accordance with GDPR, with
                      secure processing and storage.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    Consumer Rights Directive (2011/83/EU):
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Gaelic Trips provides transparent pricing, clear
                      cancellation terms, and customer service channels
                      compliant with EU consumer standards.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Irish Law */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                3. Irish Law Compliance
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                As a company registered in Ireland:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Gaelic Trips complies with the Consumer Protection Act 2007,
                  including fair marketing and advertising standards.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  The platform operates under the Electronic Commerce Act 2000,
                  ensuring valid electronic contracts and secure payment
                  processing.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Our terms and conditions, cancellation rights, and refund
                  policies meet the requirements of Irish contract and consumer
                  law.
                </li>
              </ul>
            </section>

            {/* Platform Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                4. Platform Terms & Conditions
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All transactions processed through the Gaelic Trips platform:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Are governed by a written agreement (available in full at
                  checkout).
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Include terms regarding cancellation, payment, refunds, and
                  dispute resolution.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Require user acknowledgment of the product classification (LTA
                  vs. package) before purchase.
                </li>
              </ul>
            </section>

            {/* Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                5. Liability and Risk Management
              </h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Organisers (clubs) are responsible for delivering the services
                  outlined in the Day Pass description.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Gaelic Trips Ltd provides the booking infrastructure and
                  retains a portion of platform fees for administrative and
                  legal coverage.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  In the event of disputes or underperformance, Gaelic Trips
                  reserves the right to withhold club payouts pending
                  resolution.
                </li>
              </ul>
            </section>

            {/* Transparency */}
            <section className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Transparency, Always
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our pricing model is deliberately minimal: Gaelic Trips earns
                less than the price of a pint per player. But behind the scenes,
                we operate with professional-grade systems and legal diligence
                to support clubs and travellers across Europe.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you have legal questions about our services, please contact:{" "}
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
