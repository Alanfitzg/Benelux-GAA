"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import InternalLink from "../../components/InternalLink";
import {
  ArrowLeft,
  DollarSign,
  FileText,
  Presentation,
  Handshake,
  Target,
} from "lucide-react";

const sponsorshipTips = [
  {
    title: "Create a Sponsorship Proposal",
    description:
      "Develop a professional document outlining what you can offer sponsors in return for their support.",
    icon: FileText,
  },
  {
    title: "Define Your Value",
    description:
      "Understand what makes your club unique - member demographics, social media reach, event attendance.",
    icon: Target,
  },
  {
    title: "Build Relationships",
    description:
      "Start with local businesses. Personal connections often lead to the best partnerships.",
    icon: Handshake,
  },
  {
    title: "Offer Package Options",
    description:
      "Create tiered sponsorship packages to suit different budgets and business needs.",
    icon: Presentation,
  },
];

export default function SponsorshipPage() {
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
            <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center">
              <DollarSign size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sponsorship Tips
              </h1>
              <p className="text-gray-600">
                Guidance on securing sponsors for your club
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <p>
              Sponsorship is vital for club sustainability. Here are some tips
              to help you attract and maintain sponsor relationships.
            </p>
          </div>

          <div className="space-y-6 mb-12">
            {sponsorshipTips.map((tip, idx) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.title}
                  className="flex items-start gap-4 bg-gray-50 rounded-xl p-6 border border-gray-100"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">{idx + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-gray-600">{tip.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-green-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-6">
              Benelux GAA can provide guidance and template materials for your
              sponsorship efforts.
            </p>
            <InternalLink
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Get in Touch
            </InternalLink>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
