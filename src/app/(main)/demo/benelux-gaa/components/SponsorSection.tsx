"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";

export default function SponsorSection() {
  return (
    <section className="py-4 md:py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2 md:mb-8">
            Proudly Sponsored By
          </p>

          <div className="flex flex-col items-center gap-1 md:flex-row md:justify-center md:gap-14">
            <div className="w-80 h-32 md:w-80 md:h-56 relative flex-shrink-0">
              <Image
                src="/sponsors/breagh.jpg"
                alt="Breagh Recruitment - Official Sponsor of Benelux GAA"
                fill
                className="object-contain"
                unoptimized
              />
            </div>

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
