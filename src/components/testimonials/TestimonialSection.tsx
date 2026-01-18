"use client";

import TestimonialCarousel from "./TestimonialCarousel";

interface Testimonial {
  id: string;
  content: string;
  user: {
    id: string;
    name: string | null;
    username: string;
  };
  submittedAt: string;
}

interface TestimonialSectionProps {
  clubName: string;
  approvedTestimonials: Testimonial[];
  isMainlandEurope?: boolean;
}

export default function TestimonialSection({
  clubName,
  approvedTestimonials,
  isMainlandEurope = true,
}: TestimonialSectionProps) {
  const placeholderTestimonial: Testimonial = {
    id: "placeholder",
    content: isMainlandEurope
      ? `Playing with ${clubName} was an unforgettable experience. The hospitality and competitive spirit made our trip truly special.`
      : `Hosting ${clubName} was a pleasure. Their sportsmanship and enthusiasm made for a memorable tournament weekend.`,
    user: {
      id: "placeholder",
      name: isMainlandEurope ? "PlayAway Traveller" : "European Host Club",
      username: "playaway",
    },
    submittedAt: new Date().toISOString(),
  };

  const testimonialsToDisplay =
    approvedTestimonials.length > 0
      ? approvedTestimonials
      : [placeholderTestimonial];

  return (
    <TestimonialCarousel
      testimonials={testimonialsToDisplay}
      isMainlandEurope={isMainlandEurope}
    />
  );
}
