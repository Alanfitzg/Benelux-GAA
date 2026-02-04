"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export default function SponsorSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-6 md:py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-4 md:mb-8">
            Proudly Sponsored By
          </p>

          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-center md:gap-14">
            <div
              className={`w-80 h-32 sm:w-96 sm:h-40 md:w-80 md:h-56 relative flex-shrink-0 transition-all duration-700 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-4 scale-95"
              }`}
            >
              <Image
                src="/sponsors/breagh.jpg"
                alt="Breagh Recruitment - Official Sponsor of Benelux GAA"
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {/* Mobile: Subtle link */}
            <a
              href="https://breaghrecruitment.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`md:hidden inline-flex items-center gap-1.5 text-gray-400 text-sm hover:text-[#2B9EB3] transition-all duration-500 ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              Visit Website
              <ExternalLink size={14} />
            </a>

            {/* Desktop: Description and link */}
            <div className="hidden md:block text-left max-w-md">
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Specialists in construction recruitment. Breagh is proud to
                support Gaelic Games across the Benelux region.
              </p>
              <a
                href="https://breaghrecruitment.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#2B9EB3] font-semibold text-lg hover:text-[#1a3a4a] transition-colors"
              >
                Visit Breagh
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
