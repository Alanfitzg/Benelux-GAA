"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselImage {
  src: string;
  alt: string;
}

const defaultImages: CarouselImage[] = [
  {
    src: "/benelux-gallery/gallery-1.jpg",
    alt: "Benelux GAA gallery image 1",
  },
  {
    src: "/benelux-gallery/gallery-2.jpg",
    alt: "Benelux GAA gallery image 2",
  },
  {
    src: "/benelux-gallery/gallery-3.jpg",
    alt: "Benelux GAA gallery image 3",
  },
  {
    src: "/benelux-gallery/gallery-4.jpg",
    alt: "Benelux GAA gallery image 4",
  },
  {
    src: "/benelux-gallery/gallery-5.jpg",
    alt: "Benelux GAA gallery image 5",
  },
];

interface ImageCarouselProps {
  images?: CarouselImage[];
  autoPlayInterval?: number;
}

export default function ImageCarousel({
  images = defaultImages,
  autoPlayInterval = 5000,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (idx: number) => {
    setLoadedImages((prev) => new Set(prev).add(idx));
  };

  const handleImageError = (idx: number) => {
    setFailedImages((prev) => new Set(prev).add(idx));
  };

  const validImages = images.filter((_, idx) => !failedImages.has(idx));

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isAutoPlaying || validImages.length <= 1) return;
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlayInterval, nextSlide, validImages.length]);

  if (images.length === 0) {
    return null;
  }

  // Hide carousel completely if all images failed to load
  if (failedImages.size === images.length) {
    return null;
  }

  return (
    <section className="py-6 md:py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div
          className="relative group"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden bg-[#1a3a4a]">
            {images.map((image, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  idx === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  unoptimized
                  priority={idx === 0}
                  onLoad={() => handleImageLoad(idx)}
                  onError={() => handleImageError(idx)}
                />
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
