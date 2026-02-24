"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import InternalLink from "../../components/InternalLink";
import {
  ArrowLeft,
  Users,
  Star,
  Shield,
  UserCheck,
  Heart,
  Loader2,
  MapPin,
  ExternalLink,
  Mail,
} from "lucide-react";

interface Club {
  id: string;
  name: string;
  location: string | null;
  imageUrl: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  countryCode: string;
  sportsSupported: string[];
}

const countryFlags: Record<string, string> = {
  NL: "🇳🇱",
  BE: "🇧🇪",
  LU: "🇱🇺",
  DE: "🇩🇪",
  XX: "🌍",
};

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

function getCity(location: string | null): string {
  if (!location) return "";
  const parts = location.split(",");
  return parts[0]?.trim() || "";
}

export default function KidsPage() {
  const [youthClubs, setYouthClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClubs() {
      try {
        const response = await fetch("/api/benelux-clubs");
        if (!response.ok) throw new Error("Failed to fetch");
        const data: Club[] = await response.json();
        setYouthClubs(data.filter((c) => c.sportsSupported?.includes("Youth")));
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, []);

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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#1a3a4a] rounded-xl flex items-center justify-center flex-shrink-0">
                <Users size={24} className="text-white sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  Youth Development
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Growing the next generation of Gaelic Games
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <Image
                src="/sponsors/breagh-blue.png"
                alt="Breagh - Recruiting Construction Experts"
                width={100}
                height={40}
                className="object-contain sm:w-[110px]"
                unoptimized
              />
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Sponsor
              </span>
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

          {/* Youth Clubs in the Benelux */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Youth Clubs in the Benelux
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            These clubs currently run youth programs. Contact them directly to
            find out about training times and how to get involved.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-8 mb-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#2B9EB3]" />
              <span className="ml-2 text-gray-500 text-sm">
                Loading clubs...
              </span>
            </div>
          ) : youthClubs.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {youthClubs.map((club) => (
                <div
                  key={club.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                >
                  <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                    {club.imageUrl ? (
                      <Image
                        src={club.imageUrl}
                        alt={`${club.name} crest`}
                        width={56}
                        height={56}
                        className="object-contain w-14 h-14"
                        unoptimized
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-[#2B9EB3] to-[#1a3a4a] rounded-full flex items-center justify-center">
                        <span className="text-2xl">
                          {countryFlags[club.countryCode] || "🏐"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-bold text-sm">
                      {club.name}
                    </h3>
                    <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin
                        size={12}
                        className="text-[#2B9EB3] flex-shrink-0"
                      />
                      {getCity(club.location)} {countryFlags[club.countryCode]}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {club.website && (
                        <a
                          href={club.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#2B9EB3] hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={10} />
                          Website
                        </a>
                      )}
                      {club.facebook && (
                        <a
                          href={club.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#1877F2] hover:underline"
                        >
                          Facebook
                        </a>
                      )}
                      {club.instagram && (
                        <a
                          href={club.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#E4405F] hover:underline"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 mb-8 text-gray-500 text-sm">
              No youth clubs found at this time.
            </div>
          )}

          {/* Contact Youth Officer CTA */}
          <div className="bg-[#1a3a4a] rounded-xl p-4 sm:p-6 mb-12 flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail size={22} className="text-[#2B9EB3]" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="font-semibold text-white mb-1">
                Want to set up a youth section at your club?
              </h3>
              <p className="text-white/70 text-sm">
                Contact our European Youth Officer, Pearse, to get started.
              </p>
            </div>
            <a
              href="mailto:youthofficer.europe@gaa.ie"
              className="inline-flex items-center gap-2 bg-[#2B9EB3] hover:bg-[#249aad] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors flex-shrink-0"
            >
              <Mail size={15} />
              Email Pearse
            </a>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
