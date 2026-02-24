"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import InternalLink from "../../components/InternalLink";
import {
  ArrowLeft,
  RefreshCcw,
  AlertCircle,
  ExternalLink,
  Users,
  Calendar,
  CreditCard,
  Shield,
} from "lucide-react";

const foireannFeatures = [
  {
    title: "Member Registration",
    description:
      "Register players, coaches, and administrators with your club.",
    icon: Users,
  },
  {
    title: "Team Management",
    description:
      "Create and manage teams, assign players, and track participation.",
    icon: Calendar,
  },
  {
    title: "Membership Fees",
    description: "Collect membership fees securely through the platform.",
    icon: CreditCard,
  },
  {
    title: "Insurance & Compliance",
    description: "Ensure all members have proper GAA insurance coverage.",
    icon: Shield,
  },
];

export default function TransfersPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Resources" />

      <main className="flex-1 pt-20 pb-8 sm:pt-24 sm:pb-16 md:pt-28">
        <div className="max-w-4xl mx-auto px-4">
          <InternalLink
            href="/resources"
            className="inline-flex items-center gap-2 text-[#2B9EB3] hover:text-[#1a3a4a] mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Resources
          </InternalLink>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center">
              <RefreshCcw size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Registration & Transfers
              </h1>
              <p className="text-gray-600">
                Player registration, Foireann, and transfer information
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <p>
              All GAA players must be registered with a club through{" "}
              <a
                href="https://www.foireann.ie/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2B9EB3] hover:text-[#1a3a4a]"
              >
                Foireann
              </a>
              , the GAA&apos;s official membership system. All clubs and members
              in the Benelux use Foireann for registration, team management, and
              more.
            </p>
          </div>

          {/* Foireann Access */}
          <div className="bg-[#2B9EB3]/10 border border-[#2B9EB3]/30 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Access Foireann
                </h3>
                <p className="text-gray-600 text-sm">
                  Log in to manage your membership or club
                </p>
              </div>
              <a
                href="https://www.foireann.ie/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2B9EB3] text-white rounded-lg font-semibold hover:bg-[#238a9c] transition-colors"
              >
                Go to Foireann
                <ExternalLink size={18} />
              </a>
            </div>
          </div>

          {/* Foireann Features */}
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            What Foireann Does
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-8 md:mb-12">
            {foireannFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-gray-50 rounded-xl p-5 border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#2B9EB3]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-[#2B9EB3]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Registration & Transfer Info */}
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Registration & Transfers
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={24}
                className="text-blue-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Important: Player-Initiated Process
                </h3>
                <p className="text-gray-600 text-sm">
                  Transfer applications must now be started by the player
                  through their own Foireann account. This is different from the
                  old system where the joining club secretary started the
                  process.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8 md:mb-12">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                New Player Registration
              </h3>
              <p className="text-gray-600 mb-4">
                If you&apos;ve never played GAA before, you can register
                directly with your local Benelux club. They will help you
                complete the registration process through Foireann.
              </p>
              <InternalLink
                href="/clubs"
                className="text-[#2B9EB3] font-medium hover:text-[#1a3a4a] transition-colors"
              >
                Find a club near you →
              </InternalLink>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Transferring Between Clubs
              </h3>
              <p className="text-gray-600 mb-4">
                To transfer from one club to another:
              </p>
              <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-4">
                <li>
                  Log in to your Foireann account and submit a transfer
                  application
                </li>
                <li>
                  Your current club has 10 days to respond (no objection =
                  automatic approval)
                </li>
                <li>Your new club accepts the transfer</li>
                <li>
                  You must be registered at least 3 days before playing in a
                  match
                </li>
              </ol>
              <p className="text-gray-500 text-sm">
                There is a 3 working day appeal period after a decision is made.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                International Transfers
              </h3>
              <p className="text-gray-600 mb-4">
                Moving to or from the Benelux region? International transfers
                (Inter-County/Inter-Provincial) require processing through the
                relevant Provincial or Central Council. Allow extra time for
                these applications to be reviewed.
              </p>
            </div>
          </div>

          {/* Useful Links */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Useful Links</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.foireann.ie/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#2B9EB3] hover:text-[#1a3a4a] transition-colors"
                >
                  <ExternalLink size={16} />
                  Foireann — GAA Membership System
                </a>
              </li>
              <li>
                <a
                  href="https://www.gaa.ie/the-gaa/rules-regulations/transfers-and-sanctions-information"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#2B9EB3] hover:text-[#1a3a4a] transition-colors"
                >
                  <ExternalLink size={16} />
                  GAA Official — Transfers & Sanctions Info
                </a>
              </li>
              <li>
                <a
                  href="https://gmssupport.zendesk.com/hc/en-gb/articles/9965919151516-GAA-Application-Overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#2B9EB3] hover:text-[#1a3a4a] transition-colors"
                >
                  <ExternalLink size={16} />
                  Foireann Help Centre — Application Guide
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 rounded-xl p-5 sm:p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-6">
              Contact your club administrator or reach out to Benelux GAA for
              assistance with registration, Foireann, or transfers.
            </p>
            <InternalLink
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
            >
              Contact Us
            </InternalLink>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
