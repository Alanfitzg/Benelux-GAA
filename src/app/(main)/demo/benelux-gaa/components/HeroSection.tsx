"use client";

import Image from "next/image";
import InternalLink from "./InternalLink";
import EditableText from "./EditableText";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#1a3a4a] via-[#0d2530] to-[#1a3a4a] min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d2530]/50" />

      <div className="relative z-10 text-center px-4 py-12 max-w-4xl mx-auto">
        {/* Crest */}
        <div className="mb-8">
          <Image
            src="/benelux-gaa-crest.png"
            alt="Benelux GAA"
            width={200}
            height={200}
            className="mx-auto w-40 h-40 md:w-52 md:h-52 drop-shadow-2xl"
            unoptimized
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          <EditableText
            pageKey="home"
            contentKey="hero_title"
            defaultValue="Benelux GAA"
            maxLength={30}
          />
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-[#2B9EB3] font-medium mb-6">
          <EditableText
            pageKey="home"
            contentKey="hero_subtitle"
            defaultValue="Gaelic Games in Belgium, Netherlands & Luxembourg"
            maxLength={80}
          />
        </p>

        {/* Description */}
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          <EditableText
            pageKey="home"
            contentKey="hero_description"
            defaultValue="Bringing the spirit of Gaelic Games to the heart of Europe. Join our growing community of players, supporters, and clubs across the Benelux region."
            maxLength={200}
          />
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <InternalLink
            href="/fixtures"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#2B9EB3] text-white font-semibold rounded-lg hover:bg-[#238a9c] transition-colors text-lg"
          >
            View Fixtures
          </InternalLink>
          <InternalLink
            href="/clubs"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#1a3a4a] transition-colors text-lg"
          >
            Find a Club
          </InternalLink>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-14 max-w-xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">16</div>
            <div className="text-[#2B9EB3] text-sm uppercase tracking-wider mt-1 font-medium">
              Clubs
            </div>
          </div>
          <div className="text-center border-l border-r border-white/20">
            <div className="text-3xl md:text-4xl font-bold text-white">
              1,085+
            </div>
            <div className="text-[#2B9EB3] text-sm uppercase tracking-wider mt-1 font-medium">
              Members
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">4</div>
            <div className="text-[#2B9EB3] text-sm uppercase tracking-wider mt-1 font-medium">
              Countries
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
}
