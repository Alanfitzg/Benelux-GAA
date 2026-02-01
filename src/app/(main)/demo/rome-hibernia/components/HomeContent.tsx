"use client";

import Image from "next/image";
import EditableText from "./EditableText";
import InternalLink from "./InternalLink";
import InstagramFeed from "./InstagramFeed";
import RomeTestimonialCarousel from "./RomeTestimonialCarousel";
import NewsletterForm from "./NewsletterForm";

const sponsors = [
  {
    name: "The Fiddler's Elbow",
    logo: "/sponsors/fiddlers-elbow.png",
    website: "https://thefiddlerselbowrome.com",
  },
  {
    name: "Roman Vacations",
    logo: "/sponsors/roman-vacations.svg",
    website: "https://www.roman-vacations.com",
  },
];

export default function HomeContent() {
  return (
    <>
      {/* About Section */}
      <section className="py-10 sm:py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
                <EditableText
                  pageKey="home"
                  contentKey="about.title"
                  defaultValue="Welcome to Rome Hibernia"
                  maxLength={50}
                />
              </h2>
              <p className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg">
                <EditableText
                  pageKey="home"
                  contentKey="about.description"
                  defaultValue="Italy's pioneering Gaelic games club since 2012. A vibrant, all-inclusive community where sport, culture and friendship come together in the heart of Rome."
                  maxLength={250}
                />
              </p>
              <InternalLink
                href="/history"
                className="inline-flex items-center gap-2 text-[#c41e3a] font-semibold hover:underline"
              >
                Read our history →
              </InternalLink>
            </div>
            <div className="bg-[#c41e3a] rounded-2xl p-6 sm:p-8 text-white relative mt-14 sm:mt-0">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.years"
                      defaultValue="12+"
                      maxLength={10}
                    />
                  </div>
                  <div className="text-red-200 text-sm sm:text-base">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.years_label"
                      defaultValue="Years Active"
                      maxLength={20}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.members"
                      defaultValue="60+"
                      maxLength={10}
                    />
                  </div>
                  <div className="text-red-200 text-sm sm:text-base">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.members_label"
                      defaultValue="Members"
                      maxLength={20}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.teams"
                      defaultValue="5"
                      maxLength={10}
                    />
                  </div>
                  <div className="text-red-200 text-sm sm:text-base">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.teams_label"
                      defaultValue="Teams"
                      maxLength={20}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.nationalities"
                      defaultValue="20+"
                      maxLength={10}
                    />
                  </div>
                  <div className="text-red-200 text-sm sm:text-base">
                    <EditableText
                      pageKey="home"
                      contentKey="stats.nationalities_label"
                      defaultValue="Nationalities"
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>
              {/* Sports badges */}
              <div className="border-t border-white/20 pt-4 sm:pt-5">
                <div className="flex flex-wrap justify-center gap-2">
                  {["Football", "Hurling", "Camogie", "LGFA", "Youth"].map(
                    (sport) => (
                      <span
                        key={sport}
                        className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-xs sm:text-sm"
                      >
                        <svg
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {sport}
                      </span>
                    )
                  )}
                </div>
              </div>
              {/* Crest overlay - elevated on mobile, centered on desktop */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-12 sm:top-1/2 sm:-translate-y-1/2 pointer-events-none">
                <img
                  src="/club-crests/rome-hibernia-NEW.png"
                  alt="Rome Hibernia Crest"
                  className="w-24 h-24 sm:w-32 sm:h-32"
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* Testimonials Section - Editorial Style */}
      <section className="relative bg-[#0f0f0f] overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#c41e3a]/5 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-10 lg:px-12 py-14 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20">
            {/* Testimonials */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[2px] bg-[#c41e3a]" />
                <p className="text-[#c41e3a] text-[11px] font-semibold uppercase tracking-[0.25em]">
                  Reviews
                </p>
              </div>
              <h2 className="text-[1.75rem] sm:text-3xl lg:text-4xl font-bold text-white mb-8 leading-[1.2]">
                <EditableText
                  pageKey="home"
                  contentKey="testimonials.title"
                  defaultValue="What Our Guests Say"
                  maxLength={50}
                />
              </h2>
              <RomeTestimonialCarousel clubId="rome-hibernia" darkMode />
            </div>

            {/* Newsletter - Clean card style on mobile */}
            <div className="lg:pl-10">
              <div className="bg-gradient-to-br from-[#c41e3a] to-[#9a1830] rounded-2xl sm:rounded-3xl p-6 sm:p-10 relative overflow-hidden">
                {/* Decorative circle */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <svg
                      className="w-5 h-5 text-white/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-white/70 text-[11px] font-semibold uppercase tracking-[0.25em]">
                      Newsletter
                    </p>
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">
                    <EditableText
                      pageKey="home"
                      contentKey="newsletter.title"
                      defaultValue="Stay in the Loop"
                      maxLength={40}
                    />
                  </h2>
                  <p className="text-white/75 text-sm sm:text-base mb-6 leading-relaxed">
                    <EditableText
                      pageKey="home"
                      contentKey="newsletter.description"
                      defaultValue="Get news about training, tournaments and social events straight to your inbox."
                      maxLength={120}
                    />
                  </p>
                  <NewsletterForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-[#c41e3a] text-xs font-bold uppercase tracking-[0.2em] mb-2">
              Our Proud Partners
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Supported by Rome&apos;s Finest
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              We&apos;re grateful to our sponsors who make our community
              possible
            </p>
          </div>

          <div className="flex items-center justify-center gap-12 sm:gap-20 mb-10">
            {sponsors.map((sponsor) => (
              <a
                key={sponsor.name}
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-lg group-hover:border-gray-200 transition-all duration-300">
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    width={160}
                    height={64}
                    className="h-12 sm:h-16 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                    unoptimized
                  />
                </div>
                <p className="text-center text-gray-500 text-sm mt-3 group-hover:text-gray-700 transition-colors">
                  {sponsor.name}
                </p>
              </a>
            ))}
          </div>

          <div className="text-center">
            <InternalLink
              href="/sponsors"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm"
            >
              Become a Partner
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </InternalLink>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-10 sm:py-24 bg-[#0f0f0f] relative overflow-hidden">
        {/* Decorative elements - hidden on mobile */}
        <div className="hidden sm:block absolute top-0 left-0 w-64 h-64 bg-[#c41e3a]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="hidden sm:block absolute bottom-0 right-0 w-96 h-96 bg-[#c41e3a]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* Mobile: Single unified card */}
          <div className="lg:hidden">
            <div className="bg-white rounded-2xl p-5 shadow-xl">
              {/* Header with crest */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="/club-crests/rome-hibernia-NEW.png"
                  alt="Rome Hibernia Crest"
                  className="w-14 h-14"
                />
                <div>
                  <p className="text-[#c41e3a] text-[10px] font-bold uppercase tracking-[0.15em]">
                    Get Involved
                  </p>
                  <h2 className="text-xl font-bold text-gray-900">
                    Join Rome Hibernia
                  </h2>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                Whether you&apos;re a seasoned player or new to Gaelic games,
                everyone is welcome.
              </p>

              {/* Social Media Links - compact */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-500 text-sm">Connect:</span>
                <a
                  href="https://www.instagram.com/romehiberniagaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/romehiberniagaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#1877f2] flex items-center justify-center text-white"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-400">
                    or send a message
                  </span>
                </div>
              </div>

              {/* Compact Contact Form */}
              <form className="space-y-3">
                <input
                  type="text"
                  name="company"
                  autoComplete="off"
                  tabIndex={-1}
                  className="absolute -left-[9999px]"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent text-gray-900 text-sm"
                  required
                />
                <textarea
                  rows={2}
                  placeholder="I'd like to join..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent text-gray-900 resize-none text-sm"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-[#c41e3a] text-white px-4 py-3 rounded-lg font-bold hover:bg-[#a01830] transition-colors text-sm"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Desktop: Two column layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-20 items-center">
            {/* Left side - Content */}
            <div className="text-left">
              <div className="mb-6 flex justify-start">
                <img
                  src="/club-crests/rome-hibernia-NEW.png"
                  alt="Rome Hibernia Crest"
                  className="w-24 h-24"
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(196,30,58,0.3))",
                  }}
                />
              </div>
              <p className="text-[#c41e3a] text-xs font-bold uppercase tracking-[0.2em] mb-4">
                Get Involved
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                <EditableText
                  pageKey="home"
                  contentKey="join.title"
                  defaultValue="Join Rome Hibernia"
                  maxLength={40}
                />
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                <EditableText
                  pageKey="home"
                  contentKey="join.description"
                  defaultValue="Whether you're a seasoned player or completely new to Gaelic games, everyone is welcome. Join our community and be part of something special in Rome."
                  maxLength={200}
                />
              </p>
              {/* Benefits */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#c41e3a]/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-[#c41e3a]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      All skill levels welcome
                    </h4>
                    <p className="text-gray-500 text-sm">
                      From beginners to experienced players
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#c41e3a]/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-[#c41e3a]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      International community
                    </h4>
                    <p className="text-gray-500 text-sm">
                      20+ nationalities training together
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#c41e3a]/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-[#c41e3a]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      Regular training sessions
                    </h4>
                    <p className="text-gray-500 text-sm">
                      Multiple times per week at our pitch
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Contact Options */}
            <div className="bg-white rounded-2xl p-10 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Get in Touch
              </h3>
              <p className="text-gray-500 text-base mb-6">
                Reach out on social media or send us a message
              </p>

              {/* Social Media Links */}
              <div className="flex justify-center gap-4 mb-6">
                <a
                  href="https://www.instagram.com/romehiberniagaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/romehiberniagaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-[#1877f2] flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400">
                    or send a message
                  </span>
                </div>
              </div>

              {/* Contact Form */}
              <form className="space-y-4">
                <input
                  type="text"
                  name="company"
                  autoComplete="off"
                  tabIndex={-1}
                  className="absolute -left-[9999px]"
                  aria-hidden="true"
                />
                <div>
                  <label
                    htmlFor="join-email-desktop"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="join-email-desktop"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="join-message-desktop"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="join-message-desktop"
                    rows={3}
                    placeholder="I'd like to join the club..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:border-transparent text-gray-900 resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#c41e3a] text-white px-6 py-4 rounded-lg font-bold hover:bg-[#a01830] transition-colors text-base"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
