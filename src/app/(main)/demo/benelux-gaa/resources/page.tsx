"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import InternalLink from "../components/InternalLink";
import {
  GraduationCap,
  DollarSign,
  Flag,
  RefreshCcw,
  Users,
  Baby,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const resources = [
  {
    id: "coaching",
    title: "Coaching Tips",
    description:
      "Training drills, session plans, and coaching resources for all levels.",
    icon: GraduationCap,
    href: "/resources/coaching",
    color: "bg-blue-500",
  },
  {
    id: "sponsorship",
    title: "Sponsorship Tips",
    description:
      "Guidance on securing sponsors and building partnerships for your club.",
    icon: DollarSign,
    href: "/resources/sponsorship",
    color: "bg-green-500",
  },
  {
    id: "referee",
    title: "Referee Resources",
    description: "Rules, training materials, and support for match officials.",
    icon: Flag,
    href: "/resources/referee",
    color: "bg-amber-500",
  },
  {
    id: "transfers",
    title: "Transfers",
    description: "Information on player transfers and registration procedures.",
    icon: RefreshCcw,
    href: "/resources/transfers",
    color: "bg-purple-500",
  },
  {
    id: "foireann",
    title: "Foireann",
    description:
      "Access the GAA's official membership and team management system.",
    icon: Users,
    href: "/resources/foireann",
    color: "bg-[#2B9EB3]",
  },
  {
    id: "kids",
    title: "Kids",
    description:
      "Resources for youth development and introducing children to Gaelic Games.",
    icon: Baby,
    href: "/resources/kids",
    color: "bg-pink-500",
  },
];

const externalLinks = [
  {
    title: "GAA Official Website",
    url: "https://www.gaa.ie",
    description: "The official Gaelic Athletic Association website",
  },
  {
    title: "European GAA",
    url: "https://europeangaa.eu",
    description: "European GAA governing body",
  },
  {
    title: "GAA Learning Portal",
    url: "https://learning.gaa.ie",
    description: "Online courses and certifications",
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Resources" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <EditableText
                pageKey="resources"
                contentKey="title"
                defaultValue="Resources"
                maxLength={30}
              />
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              <EditableText
                pageKey="resources"
                contentKey="subtitle"
                defaultValue="Helpful resources for players, coaches, referees, and club administrators in the Benelux GAA community."
                maxLength={150}
              />
            </p>
          </div>

          {/* Resource Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {resources.map((resource) => {
              const Icon = resource.icon;
              return (
                <InternalLink
                  key={resource.id}
                  href={resource.href}
                  className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-[#2B9EB3]/50"
                >
                  <div
                    className={`w-12 h-12 ${resource.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#2B9EB3] transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {resource.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[#2B9EB3] text-sm font-medium">
                    Learn more
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </InternalLink>
              );
            })}
          </div>

          {/* External Links */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              External Resources
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {externalLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-[#2B9EB3] hover:shadow-md transition-all group"
                >
                  <ExternalLink
                    size={18}
                    className="text-[#2B9EB3] flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-[#2B9EB3] transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-500">{link.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Can&apos;t find what you&apos;re looking for?
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
