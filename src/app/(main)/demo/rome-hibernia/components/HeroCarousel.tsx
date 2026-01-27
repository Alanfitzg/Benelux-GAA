"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBasePath } from "../hooks/useBasePath";

const baseSlides = [
  {
    id: 1,
    title: "Rome Hibernia GAA",
    subtitle: "The home of Gaelic Games in Rome",
    image: "/demo/rome-hibernia/carousel-1.jpg",
    cta: { text: "Join Us", href: "/contact" },
    secondaryCta: { text: "Learn More", href: "/history" },
  },
  {
    id: 2,
    title: "Train With Us",
    subtitle: "All levels welcome - beginners to experienced",
    image: "/demo/rome-hibernia/carousel-2.jpg",
    cta: { text: "Training Info", href: "/training" },
  },
  {
    id: 3,
    title: "Compete Across Europe",
    subtitle: "Representing Rome at tournaments throughout the continent",
    image: "/demo/rome-hibernia/carousel-3.jpg",
    cta: { text: "View Events", href: "/events" },
  },
  {
    id: 4,
    title: "Men's Football",
    subtitle: "Training Tuesdays & Thursdays",
    image: "/demo/rome-hibernia/carousel-4.jpg",
    cta: { text: "Get Involved", href: "/contact" },
  },
  {
    id: 5,
    title: "Ladies Football",
    subtitle: "Join our growing ladies section",
    image: "/demo/rome-hibernia/carousel-5.jpg",
    cta: { text: "Join Us", href: "/contact" },
  },
  {
    id: 6,
    title: "A Community Like No Other",
    subtitle: "Sport, culture and friendship in equal measure",
    image: "/demo/rome-hibernia/carousel-6.jpg",
    cta: { text: "Our History", href: "/history" },
  },
  {
    id: 7,
    title: "Youth GAA",
    subtitle: "Building the next generation since 2025",
    image: "/demo/rome-hibernia/carousel-7.jpg",
    cta: { text: "Youth Programs", href: "/youth" },
  },
  {
    id: 8,
    title: "Join Rome Hibernia",
    subtitle: "20+ nationalities, one team",
    image: "/demo/rome-hibernia/carousel-8.jpg",
    cta: { text: "Contact Us", href: "/contact" },
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { basePath } = useBasePath();

  const slides = useMemo(() => {
    return baseSlides.map((slide) => ({
      ...slide,
      cta: { ...slide.cta, href: `${basePath}${slide.cta.href}` },
      secondaryCta: slide.secondaryCta
        ? {
            ...slide.secondaryCta,
            href: `${basePath}${slide.secondaryCta.href}`,
          }
        : undefined,
    }));
  }, [basePath]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section className="relative h-[400px] sm:h-[500px] md:h-[700px] lg:h-[800px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          className="object-cover object-center transition-opacity duration-500"
          priority
          unoptimized
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end justify-center pb-16 sm:pb-20 md:pb-24">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 drop-shadow-lg">
            {slide.title}
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-white/90 mb-4 sm:mb-6 md:mb-8 drop-shadow-md">
            {slide.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
            <Link
              href={slide.cta.href}
              className="bg-[#c41e3a] text-white px-6 sm:px-8 py-2 sm:py-3 font-bold text-sm sm:text-lg hover:bg-[#a01830] transition-colors"
            >
              {slide.cta.text}
            </Link>
            {slide.secondaryCta && (
              <Link
                href={slide.secondaryCta.href}
                className="border-2 border-white text-white px-6 sm:px-8 py-2 sm:py-3 font-bold text-sm sm:text-lg hover:bg-white/10 transition-colors"
              >
                {slide.secondaryCta.text}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} className="sm:hidden" />
        <ChevronLeft size={28} className="hidden sm:block" />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={20} className="sm:hidden" />
        <ChevronRight size={28} className="hidden sm:block" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
              index === currentSlide
                ? "bg-white"
                : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
