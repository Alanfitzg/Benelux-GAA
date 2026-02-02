"use client";

import Image from "next/image";
import InternalLink from "./InternalLink";
import EditableText from "./EditableText";
import NewsletterForm from "./NewsletterForm";
import ImageCarousel from "./ImageCarousel";
import ClubsCarousel from "./ClubsCarousel";

// Real fixtures from the 2026 calendar
const upcomingFixtures = [
  {
    date: "2026-02-21",
    title: "Football Development Tournament (11s)",
    venue: "Leuven",
    code: "Football",
  },
  {
    date: "2026-02-28",
    title: "Den Haag Invitational",
    venue: "Den Haag",
    code: "Invitational",
  },
  {
    date: "2026-03-14",
    title: "Cologne Invitational",
    venue: "Cologne",
    code: "Invitational",
  },
];

const codeColors: Record<string, { bg: string; text: string }> = {
  Football: { bg: "bg-green-100", text: "text-green-700" },
  "Camogie/Hurling": { bg: "bg-amber-100", text: "text-amber-700" },
  Invitational: { bg: "bg-orange-100", text: "text-orange-700" },
  Mixed: { bg: "bg-blue-100", text: "text-blue-700" },
};

function formatFixtureDate(dateStr: string): { month: string; day: string } {
  const date = new Date(dateStr);
  return {
    month: date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    day: date.getDate().toString(),
  };
}

const latestNews = {
  title: "2026 Season Fixtures Released",
  excerpt:
    "The full fixtures calendar for the 2026 Benelux GAA season has been published. Check out all upcoming tournaments, league rounds, and championship dates.",
  date: "Jan 15, 2026",
};

export default function HomeContent() {
  return (
    <div className="bg-white">
      {/* What are Gaelic Games Section */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              <EditableText
                pageKey="home"
                contentKey="games_title"
                defaultValue="What are the Gaelic Games?"
                maxLength={50}
              />
            </h2>
            <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">
              <EditableText
                pageKey="home"
                contentKey="games_subtitle"
                defaultValue="Ancient Irish sports with a rich history spanning thousands of years, now played across the globe."
                maxLength={150}
              />
            </p>
          </div>

          {/* Mobile: Horizontal compact cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {/* Hurling */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
              <div className="relative w-24 h-20 flex-shrink-0 bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3]">
                <Image
                  src="/benelux-sports/hurling.jpg"
                  alt="Hurling"
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="p-3 flex-1">
                <h3 className="text-sm font-bold text-gray-900">Hurling</h3>
                <p className="text-gray-600 text-xs leading-snug">
                  The fastest field sport in the world using a hurley and
                  sliotar.
                </p>
              </div>
            </div>

            {/* Gaelic Football */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
              <div className="relative w-24 h-20 flex-shrink-0 bg-gradient-to-br from-[#c41e3a] to-[#e63e5c]">
                <Image
                  src="/benelux-sports/football.jpg"
                  alt="Gaelic Football"
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="p-3 flex-1">
                <h3 className="text-sm font-bold text-gray-900">
                  Gaelic Football
                </h3>
                <p className="text-gray-600 text-xs leading-snug">
                  A dynamic sport combining soccer, rugby, and basketball.
                </p>
              </div>
            </div>

            {/* Camogie */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
              <div className="relative w-24 h-20 flex-shrink-0 bg-gradient-to-br from-[#f4c430] to-[#ffd700]">
                <Image
                  src="/benelux-sports/camogie.jpg"
                  alt="Camogie"
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="p-3 flex-1">
                <h3 className="text-sm font-bold text-gray-900">Camogie</h3>
                <p className="text-gray-600 text-xs leading-snug">
                  The women&apos;s version of hurling, one of the
                  fastest-growing sports.
                </p>
              </div>
            </div>
          </div>

          {/* Desktop: Original vertical cards */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {/* Hurling */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3]">
                <Image
                  src="/benelux-sports/hurling.jpg"
                  alt="Hurling - the fastest field sport"
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Hurling
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The fastest field sport in the world. Players use a wooden
                  stick (hurley) to hit a small ball (sliotar) between the
                  opponent&apos;s goalposts.
                </p>
              </div>
            </div>

            {/* Gaelic Football */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-[#c41e3a] to-[#e63e5c]">
                <Image
                  src="/benelux-sports/football.jpg"
                  alt="Gaelic Football action"
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Gaelic Football
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  A dynamic sport combining elements of soccer, rugby, and
                  basketball. Players can kick, hand-pass, and carry the ball.
                </p>
              </div>
            </div>

            {/* Camogie */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-[#f4c430] to-[#ffd700]">
                <Image
                  src="/benelux-sports/camogie.jpg"
                  alt="Camogie - women's hurling"
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Camogie
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The women&apos;s version of hurling. One of the
                  fastest-growing women&apos;s team sports in Europe.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <InternalLink
              href="/faq"
              className="inline-flex items-center text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors"
            >
              Learn more about Gaelic Games →
            </InternalLink>
          </div>
        </div>
      </section>

      {/* Image Gallery Carousel */}
      <ImageCarousel />

      {/* Our Clubs Carousel */}
      <ClubsCarousel />

      {/* Upcoming Events */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center sm:text-left mb-2 sm:mb-0">
              <EditableText
                pageKey="home"
                contentKey="events_title"
                defaultValue="Upcoming Events"
                maxLength={30}
              />
            </h2>
            <InternalLink
              href="/fixtures"
              className="text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors hidden sm:inline"
            >
              View all fixtures →
            </InternalLink>
          </div>

          <div className="space-y-4">
            {upcomingFixtures.map((fixture, idx) => {
              const { month, day } = formatFixtureDate(fixture.date);
              const colors = codeColors[fixture.code] || {
                bg: "bg-gray-100",
                text: "text-gray-700",
              };
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 md:gap-6 p-4 md:p-5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                >
                  <div className="flex-shrink-0 w-16 h-18 md:w-20 md:h-22 bg-gradient-to-br from-[#1a3a4a] to-[#0d2530] rounded-xl flex flex-col items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow">
                    <span className="text-[10px] md:text-xs font-medium tracking-wider opacity-80">
                      {month}
                    </span>
                    <span className="text-2xl md:text-3xl font-bold leading-none">
                      {day}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 group-hover:text-[#2B9EB3] transition-colors">
                      {fixture.title}
                    </h3>
                    <p className="text-gray-500 text-xs md:text-sm flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-[#2B9EB3]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {fixture.venue}
                    </p>
                  </div>
                  <span
                    className={`hidden sm:inline-block px-3 py-1.5 ${colors.bg} ${colors.text} text-xs font-semibold rounded-full`}
                  >
                    {fixture.code}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-6 sm:hidden">
            <InternalLink
              href="/fixtures"
              className="text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors"
            >
              View all fixtures →
            </InternalLink>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center sm:text-left mb-2 sm:mb-0">
              <EditableText
                pageKey="home"
                contentKey="news_title"
                defaultValue="Latest News"
                maxLength={30}
              />
            </h2>
            <InternalLink
              href="/news"
              className="text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors hidden sm:inline"
            >
              View all news →
            </InternalLink>
          </div>

          <article className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
            <div className="flex flex-col md:flex-row">
              <div className="relative h-48 md:h-auto md:w-2/5 bg-gradient-to-br from-[#1a3a4a] via-[#1a3a4a] to-[#2B9EB3] flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 md:w-10 md:h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                  </div>
                  <span className="text-white/60 text-xs uppercase tracking-wider font-medium">
                    News
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8 md:w-3/5 flex flex-col justify-center">
                <span className="inline-flex items-center gap-2 text-[#2B9EB3] text-sm font-semibold mb-2">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {latestNews.date}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#2B9EB3] transition-colors">
                  {latestNews.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
                  {latestNews.excerpt}
                </p>
                <InternalLink
                  href="/news"
                  className="inline-flex items-center gap-2 text-[#2B9EB3] font-semibold text-sm hover:text-[#1a3a4a] transition-colors group/link"
                >
                  Read more
                  <svg
                    className="w-4 h-4 group-hover/link:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </InternalLink>
              </div>
            </div>
          </article>

          <div className="text-center mt-6 sm:hidden">
            <InternalLink
              href="/news"
              className="text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors"
            >
              View all news →
            </InternalLink>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <EditableText
                pageKey="home"
                contentKey="sponsors_title"
                defaultValue="Our Sponsors"
                maxLength={30}
              />
            </h2>
            <p className="text-gray-600">
              <EditableText
                pageKey="home"
                contentKey="sponsors_subtitle"
                defaultValue="Thank you to our partners for supporting Gaelic Games in the Benelux"
                maxLength={100}
              />
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {/* Placeholder sponsor logos */}
            <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              Sponsor 1
            </div>
            <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              Sponsor 2
            </div>
            <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              Sponsor 3
            </div>
          </div>

          <div className="text-center mt-8">
            <InternalLink
              href="/contact"
              className="text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors"
            >
              Become a sponsor →
            </InternalLink>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-20 bg-[#1a3a4a]">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            <EditableText
              pageKey="home"
              contentKey="newsletter_title"
              defaultValue="Stay Updated"
              maxLength={30}
              className="text-white"
            />
          </h2>
          <p className="text-gray-300 mb-8">
            <EditableText
              pageKey="home"
              contentKey="newsletter_subtitle"
              defaultValue="Subscribe to our newsletter for the latest news, fixtures, and updates from Benelux GAA."
              maxLength={150}
            />
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
