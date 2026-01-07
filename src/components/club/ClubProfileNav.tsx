"use client";

import { useState, useEffect } from "react";

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: "events", label: "Tournaments" },
  { id: "friends", label: "Friends" },
  { id: "gallery", label: "Gallery" },
  { id: "testimonials", label: "Testimonials" },
  { id: "twin-club", label: "Twin Club" },
  { id: "calendar", label: "Calendar" },
];

export default function ClubProfileNav() {
  const [activeSection, setActiveSection] = useState<string>("events");

  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-100px 0px -70% 0px",
      threshold: 0,
    });

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-16 z-40 bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
            {sections.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all
                  ${
                    activeSection === id
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-900"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
