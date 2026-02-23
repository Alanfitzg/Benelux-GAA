"use client";

import { useEffect, useRef, useState } from "react";
import { Landmark, ArrowRight, Trophy, Users, Star, Award } from "lucide-react";
import InternalLink from "./InternalLink";

const highlights = [
  {
    year: 1974,
    title: "Den Haag GAA Founded",
    snippet: "One of the oldest GAA clubs on mainland Europe",
    category: "founding" as const,
  },
  {
    year: 1999,
    title: "European County Board",
    snippet: "Five clubs meet in Amsterdam to form the GAA's European board",
    category: "milestone" as const,
  },
  {
    year: 2008,
    title: "First Book Published",
    snippet: '"More than a Sporting Experience" chronicles Luxembourg GAA',
    category: "milestone" as const,
  },
  {
    year: 2022,
    title: "Amsterdam Makes Hurling History",
    snippet: "First team to represent Europe in the All-Ireland Championship",
    category: "championship" as const,
  },
  {
    year: 2025,
    title: "First European Club Wins Leinster Title",
    snippet: "Amsterdam GAC defeats Longford Slashers in a historic final",
    category: "championship" as const,
  },
];

const categoryIcons = {
  founding: Users,
  championship: Trophy,
  milestone: Star,
  award: Award,
};

const categoryGlow = {
  founding: "shadow-blue-500/40",
  championship: "shadow-yellow-500/40",
  milestone: "shadow-[#2B9EB3]/40",
  award: "shadow-purple-500/40",
};

const categoryColors = {
  founding: "bg-blue-500",
  championship: "bg-yellow-500",
  milestone: "bg-[#2B9EB3]",
  award: "bg-purple-500",
};

export default function MuseumPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-14 md:py-28 bg-[#0a1a24] relative overflow-hidden"
    >
      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#2B9EB3]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#1a3a4a]/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-10 md:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full mb-5">
            <Landmark size={14} className="text-[#4ecde6]" />
            <span className="text-[#4ecde6] text-xs font-semibold uppercase tracking-wider">
              The Benelux Museum
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            50+ Years of History
          </h2>
          <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto">
            From the first clubs in the 1970s to European championship glory
            &mdash; explore the story of Gaelic Games on the continent.
          </p>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden space-y-1">
          {highlights.map((item, idx) => {
            const Icon = categoryIcons[item.category];
            return (
              <div
                key={item.year + item.title}
                className={`flex items-start gap-3 transition-all duration-500 ${
                  isVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
                style={{
                  transitionDelay: isVisible ? `${idx * 100 + 200}ms` : "0ms",
                }}
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full ${categoryColors[item.category]} flex items-center justify-center shadow-lg ${categoryGlow[item.category]}`}
                  >
                    <Icon size={14} className="text-white" />
                  </div>
                  {idx < highlights.length - 1 && (
                    <div className="w-0.5 h-full min-h-[2rem] bg-white/10 mt-1" />
                  )}
                </div>
                <div className="pb-4">
                  <span className="text-[#4ecde6] font-bold text-lg">
                    {item.year}
                  </span>
                  <h3 className="text-white font-semibold text-sm leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-white/40 text-xs leading-relaxed mt-0.5">
                    {item.snippet}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: Horizontal timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Timeline line */}
            <div
              className={`absolute top-4 left-0 right-0 h-px transition-all duration-1000 origin-left ${
                isVisible ? "scale-x-100" : "scale-x-0"
              }`}
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(78,205,230,0.4) 20%, rgba(43,158,179,0.6) 50%, rgba(78,205,230,0.4) 80%, transparent 100%)",
              }}
            />

            <div className="grid grid-cols-5 gap-4">
              {highlights.map((item, idx) => {
                const Icon = categoryIcons[item.category];
                return (
                  <div
                    key={item.year + item.title}
                    className={`relative flex flex-col items-center text-center transition-all duration-600 ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8"
                    }`}
                    style={{
                      transitionDelay: isVisible
                        ? `${idx * 120 + 300}ms`
                        : "0ms",
                    }}
                  >
                    {/* Node */}
                    <div
                      className={`w-8 h-8 rounded-full ${categoryColors[item.category]} flex items-center justify-center shadow-lg ${categoryGlow[item.category]} z-10 ring-2 ring-[#0a1a24] ring-offset-2 ring-offset-[#0a1a24]`}
                    >
                      <Icon size={14} className="text-white" />
                    </div>

                    {/* Card */}
                    <div className="mt-6 bg-white/[0.08] backdrop-blur-sm border border-white/15 rounded-xl p-5 hover:bg-white/[0.12] hover:border-white/25 hover:-translate-y-1 transition-all duration-300 w-full group">
                      <span className="text-[#4ecde6] font-bold text-3xl block mb-2 group-hover:text-white transition-colors">
                        {item.year}
                      </span>
                      <h3 className="text-white font-semibold text-base leading-snug mb-2">
                        {item.title}
                      </h3>
                      <p className="text-white/50 text-sm leading-relaxed">
                        {item.snippet}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-10 md:mt-16 transition-all duration-700 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <InternalLink
            href="/timeline"
            className="relative inline-flex items-center gap-3 px-10 py-4 bg-white text-[#0a1a24] font-bold text-lg rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(78,205,230,0.4)] transition-all duration-300 group"
          >
            Explore the Full Museum
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1.5 transition-transform"
            />
          </InternalLink>
        </div>
      </div>
    </section>
  );
}
