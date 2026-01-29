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
    <section className="relative h-[280px] sm:h-[350px] md:h-[550px] lg:h-[650px] overflow-hidden">
      {/* Background Images with crossfade */}
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            className="object-cover object-center"
            priority={index === 0}
            unoptimized
          />
        </div>
      ))}

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

      {/* Animated progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
        <div
          className="h-full bg-[#c41e3a] transition-all ease-linear"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
            transition: isAutoPlaying
              ? "width 5s linear"
              : "width 0.3s ease-out",
          }}
        />
      </div>

      {/* Mobile slide indicator dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex sm:hidden gap-1.5">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white w-6" : "bg-white/40 w-1.5"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content - hidden on mobile */}
      <div className="relative h-full hidden sm:flex items-end justify-center pb-20 md:pb-24">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg animate-fade-in"
            key={`title-${currentSlide}`}
          >
            {slide.title}
          </h1>
          <p
            className="text-lg md:text-2xl text-white/90 mb-6 md:mb-8 drop-shadow-md animate-fade-in-delay"
            key={`subtitle-${currentSlide}`}
          >
            {slide.subtitle}
          </p>
          <div className="flex flex-row gap-4 justify-center">
            <Link
              href={slide.cta.href}
              className="bg-[#c41e3a] text-white px-8 py-3 font-bold text-lg hover:bg-[#a01830] transition-colors hover:scale-105 transform"
            >
              {slide.cta.text}
            </Link>
            {slide.secondaryCta && (
              <Link
                href={slide.secondaryCta.href}
                className="border-2 border-white text-white px-8 py-3 font-bold text-lg hover:bg-white/10 transition-colors hover:scale-105 transform"
              >
                {slide.secondaryCta.text}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows - hidden on mobile */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full hidden sm:flex items-center justify-center text-white transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full hidden sm:flex items-center justify-center text-white transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight size={28} />
      </button>

      {/* Desktop Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/40 hover:bg-white/60 w-3"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fadeIn 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
