"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const affiliations = [
  {
    name: "Gaelic Games Europe",
    src: "/crests/gge.png",
    href: "https://gaelicgameseurope.com",
  },
  { name: "GAA", src: "/crests/gaa.png", href: "https://www.gaa.ie" },
  { name: "LGFA", src: "/crests/lgfa.png", href: "https://ladiesgaelic.ie" },
  {
    name: "Camogie Association",
    src: "/crests/camogie.png",
    href: "https://camogie.ie",
  },
];

export default function AffiliationsBanner() {
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
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-gray-50 border-y border-gray-100 py-5 sm:py-6">
      <div className="max-w-5xl mx-auto px-4">
        <p
          className={`text-center text-gray-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium mb-4 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          Affiliated with
        </p>
        <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-14">
          {affiliations.map((org, idx) => (
            <a
              key={org.name}
              href={org.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-all duration-500 hover:opacity-70 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
              style={{
                transitionDelay: isVisible ? `${150 + idx * 100}ms` : "0ms",
              }}
              title={org.name}
            >
              <Image
                src={org.src}
                alt={org.name}
                width={80}
                height={80}
                className="object-contain h-14 sm:h-16 md:h-20 w-auto"
                unoptimized
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
