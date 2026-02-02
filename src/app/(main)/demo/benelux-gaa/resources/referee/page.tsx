"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import InternalLink from "../../components/InternalLink";
import {
  ArrowLeft,
  Flag,
  Book,
  Video,
  Users,
  ExternalLink,
} from "lucide-react";

const refereeResources = [
  {
    title: "Official Playing Rules",
    description:
      "Download the latest GAA playing rules for Football, Hurling, and Camogie.",
    icon: Book,
    link: "https://www.gaa.ie/the-gaa/rules/",
    type: "external",
  },
  {
    title: "Referee Training",
    description:
      "Information on becoming a qualified referee in the Benelux region.",
    icon: Users,
    type: "coming_soon",
  },
  {
    title: "Video Analysis",
    description:
      "Watch video examples of key refereeing decisions and interpretations.",
    icon: Video,
    type: "coming_soon",
  },
];

export default function RefereePage() {
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
            <div className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center">
              <Flag size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Referee Resources
              </h1>
              <p className="text-gray-600">Support for match officials</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <p>
              Referees are essential to Gaelic Games. Here you&apos;ll find
              resources to help you develop as a match official.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {refereeResources.map((resource) => {
              const Icon = resource.icon;
              return (
                <div
                  key={resource.title}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {resource.description}
                      </p>
                      {resource.type === "external" && resource.link && (
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#2B9EB3] text-sm font-medium hover:text-[#1a3a4a] transition-colors"
                        >
                          Visit website
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {resource.type === "coming_soon" && (
                        <span className="text-gray-400 text-sm italic">
                          Coming soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Become a Referee
            </h3>
            <p className="text-gray-600 mb-6">
              Interested in refereeing? Contact us to learn about referee
              training opportunities in the Benelux.
            </p>
            <InternalLink
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
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
