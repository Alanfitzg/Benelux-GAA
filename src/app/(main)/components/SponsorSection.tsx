"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export default function SponsorSection() {
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-6 md:py-20 bg-white overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          <h2
            className={`text-gray-400 text-sm md:text-lg uppercase tracking-[0.2em] font-semibold mb-4 md:mb-10 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            Proudly Sponsored By
          </h2>

          <div className="flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-16">
            <a
              href="https://breagh.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`block transition-all duration-700 delay-200 ${
                isVisible
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 -translate-x-8 scale-95"
              }`}
            >
              <Image
                src="/sponsors/breagh-blue.png"
                alt="Breagh Recruitment - Official Sponsor of Benelux GAA"
                width={500}
                height={200}
                className="object-contain w-48 sm:w-64 md:w-80 hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </a>

            <div
              className={`hidden md:block text-left max-w-md transition-all duration-700 delay-400 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
            >
              <p className="text-gray-600 text-lg leading-relaxed mb-5">
                Specialists in construction recruitment. Breagh is proud to
                support Gaelic Games across the Benelux region.
              </p>
              <a
                href="https://breagh.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#2B9EB3] font-semibold text-lg hover:text-[#1a3a4a] transition-colors group"
              >
                Visit Breagh
                <ExternalLink
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
