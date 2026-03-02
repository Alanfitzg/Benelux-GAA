"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function SponsorBanner() {
  const ref = useRef<HTMLDivElement>(null);
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

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center py-2">
      <p
        className={`text-[10px] sm:text-xs text-gray-400 uppercase tracking-[0.2em] font-medium mb-3 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        Official Regional Sponsor
      </p>
      <a
        href="https://breaghrecruitment.com"
        target="_blank"
        rel="noopener noreferrer"
        className={`block transition-all duration-700 delay-200 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <Image
          src="/sponsors/breagh-blue.png"
          alt="Breagh Recruitment"
          width={500}
          height={200}
          className="object-contain w-56 sm:w-72 md:w-80 hover:opacity-70 transition-opacity"
          unoptimized
        />
      </a>
      <div
        className={`mt-3 flex items-center gap-3 transition-all duration-500 delay-400 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="w-8 h-px bg-gray-200" />
        <p className="text-[10px] sm:text-xs text-gray-400 tracking-wider">
          2026 Season
        </p>
        <div className="w-8 h-px bg-gray-200" />
      </div>
    </div>
  );
}
