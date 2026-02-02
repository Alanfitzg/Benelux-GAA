"use client";

import Image from "next/image";
import EditableText from "./EditableText";

export default function HeroSection() {
  return (
    <section className="relative">
      {/* Banner Image */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src="/Benelux banner.png"
          alt="Benelux GAA players at Croke Park"
          fill
          className="object-cover object-[center_30%] md:object-center"
          unoptimized
          priority
        />
        {/* Gradient overlay at bottom - starts earlier for text clarity */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a3a4a]/30 to-[#1a3a4a]" />

        {/* Content positioned at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 pb-4 md:pb-6">
          <div className="max-w-4xl mx-auto px-4 text-center">
            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-0.5 tracking-tight drop-shadow-lg [text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]">
              <EditableText
                pageKey="home"
                contentKey="hero_title"
                defaultValue="Benelux GAA"
                maxLength={30}
              />
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-lg text-[#4ecde6] font-semibold mb-3 md:mb-4 drop-shadow-md [text-shadow:_0_1px_6px_rgb(0_0_0_/_70%)]">
              <EditableText
                pageKey="home"
                contentKey="hero_subtitle"
                defaultValue="Gaelic Games in Belgium, Netherlands & Luxembourg"
                maxLength={80}
              />
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 max-w-[200px] mx-auto">
              <div className="text-center">
                <div className="text-xl md:text-3xl font-bold text-white drop-shadow-md [text-shadow:_0_1px_6px_rgb(0_0_0_/_70%)]">
                  16
                </div>
                <div className="text-[#4ecde6] text-[10px] md:text-xs uppercase tracking-wider font-semibold">
                  Clubs
                </div>
              </div>
              <div className="text-center border-l border-white/30">
                <div className="text-xl md:text-3xl font-bold text-white drop-shadow-md [text-shadow:_0_1px_6px_rgb(0_0_0_/_70%)]">
                  1,085+
                </div>
                <div className="text-[#4ecde6] text-[10px] md:text-xs uppercase tracking-wider font-semibold">
                  Members
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient continuation to next section */}
      <div className="h-8 md:h-12 bg-gradient-to-b from-[#1a3a4a] to-white" />
    </section>
  );
}
