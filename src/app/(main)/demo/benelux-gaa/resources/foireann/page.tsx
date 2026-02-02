"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import InternalLink from "../../components/InternalLink";
import {
  ArrowLeft,
  Users,
  ExternalLink,
  Shield,
  Calendar,
  CreditCard,
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

export default function FoireannPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Resources" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-4xl mx-auto px-4">
          <InternalLink
            href="/resources"
            className="inline-flex items-center gap-2 text-[#2B9EB3] hover:text-[#1a3a4a] mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Resources
          </InternalLink>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#2B9EB3] rounded-xl flex items-center justify-center">
              <Users size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Foireann</h1>
              <p className="text-gray-600">
                GAA&apos;s official membership system
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <p>
              Foireann is the GAA&apos;s official membership and team management
              system. All clubs and members in the Benelux use Foireann for
              registration, team management, and more.
            </p>
          </div>

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
                href="https://returntoplay.gaa.ie"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2B9EB3] text-white rounded-lg font-semibold hover:bg-[#238a9c] transition-colors"
              >
                Go to Foireann
                <ExternalLink size={18} />
              </a>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            What You Can Do
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
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

          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Need Help with Foireann?
            </h3>
            <p className="text-gray-600 mb-6">
              Contact your club administrator or reach out to Benelux GAA for
              assistance with the Foireann system.
            </p>
            <InternalLink
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#1a3a4a] text-white rounded-lg font-semibold hover:bg-[#0d2530] transition-colors"
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
