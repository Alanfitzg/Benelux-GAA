"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import InternalLink from "../../components/InternalLink";
import { ArrowLeft, Users, Star, Shield, UserCheck, Heart } from "lucide-react";

const kidsPrograms = [
  {
    title: "Go Games",
    description:
      "Small-sided games for children aged 6-11. Focus on fun, participation, and skill development.",
    icon: Star,
  },
  {
    title: "Nursery Program",
    description:
      "Introduction to Gaelic Games for children aged 4-6 through play-based activities.",
    icon: UserCheck,
  },
  {
    title: "Youth Development",
    description: "Structured training and competitions for players aged 12-17.",
    icon: Users,
  },
  {
    title: "Safeguarding",
    description:
      "All our youth programs follow strict child protection guidelines.",
    icon: Shield,
  },
];

export default function KidsPage() {
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
            <div className="w-16 h-16 bg-[#1a3a4a] rounded-xl flex items-center justify-center">
              <Users size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Youth Development
              </h1>
              <p className="text-gray-600">
                Growing the next generation of Gaelic Games
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <p>
              Introducing children to Gaelic Games is one of the most rewarding
              parts of what we do. Our youth programs focus on fun, friendship,
              and developing a love for the games.
            </p>
          </div>

          <div className="bg-[#2B9EB3]/10 border border-[#2B9EB3]/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Heart
                size={24}
                className="text-[#2B9EB3] flex-shrink-0 mt-0.5"
              />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Our Philosophy
                </h3>
                <p className="text-gray-600 text-sm">
                  At youth level, the focus is on participation, fun, and skill
                  development - not winning. We want every child to enjoy their
                  experience and develop a lifelong love for Gaelic Games.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Youth Programs
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {kidsPrograms.map((program) => {
              const Icon = program.icon;
              return (
                <div
                  key={program.title}
                  className="bg-gray-50 rounded-xl p-5 border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#1a3a4a]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-[#1a3a4a]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {program.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {program.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-[#1a3a4a] to-[#2B9EB3] rounded-xl p-8 text-center text-white">
            <h3 className="text-xl font-semibold mb-3">
              Get Your Kids Involved!
            </h3>
            <p className="text-white/80 mb-6">
              Contact a local club to find out about youth programs in your
              area. Most clubs offer free taster sessions!
            </p>
            <InternalLink
              href="/clubs"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#1a3a4a] rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              Find a Club
            </InternalLink>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
