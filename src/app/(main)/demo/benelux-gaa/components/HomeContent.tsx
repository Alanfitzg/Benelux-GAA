"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import InternalLink from "./InternalLink";
import EditableText from "./EditableText";
import NewsletterForm from "./NewsletterForm";
import ImageCarousel from "./ImageCarousel";
import ClubsCarousel from "./ClubsCarousel";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { getAssetUrl } from "../constants";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  featured: boolean;
}

// Real fixtures from the 2026 calendar
const upcomingFixtures = [
  {
    date: "2026-02-21",
    title: "Football Development Tournament (11s)",
    venue: "Leuven",
    code: "Football",
    hostClub: "Earls of Leuven",
    hostCrest: "/club-crests/earls-of-leuven.png",
  },
  {
    date: "2026-02-28",
    title: "Den Haag Invitational",
    venue: "Den Haag",
    code: "Invitational",
    hostClub: "CLG Den Haag",
    hostCrest: "/club-crests/clg-den-haag.png",
  },
  {
    date: "2026-03-14",
    title: "Cologne Invitational",
    venue: "Cologne",
    code: "Invitational",
    hostClub: "Cologne Celtics",
    hostCrest: "/club-crests/logo-cologne_celtics.png",
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

function formatNewsDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HomeContent() {
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("/api/benelux-news?limit=4");
        const data = await res.json();
        setLatestNews(data);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setNewsLoading(false);
      }
    }
    fetchNews();
  }, []);
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
                  className="object-cover object-center"
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
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  The fastest field sport in the world. Players use a wooden
                  stick (hurley) to hit a small ball (sliotar) between the
                  opponent&apos;s goalposts.
                </p>
                <a
                  href="https://www.youtube.com/watch?v=fgEMvRrOCRI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#2B9EB3] font-semibold text-sm hover:text-[#1a3a4a] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Video
                </a>
              </div>
            </div>

            {/* Gaelic Football */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-[#c41e3a] to-[#e63e5c]">
                <Image
                  src="/benelux-sports/football.jpg"
                  alt="Gaelic Football action"
                  fill
                  className="object-cover object-center"
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
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  A dynamic sport combining elements of soccer, rugby, and
                  basketball. Players can kick, hand-pass, and carry the ball.
                </p>
                <a
                  href="https://www.youtube.com/watch?v=TEAbWrdB9XU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#2B9EB3] font-semibold text-sm hover:text-[#1a3a4a] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Video
                </a>
              </div>
            </div>

            {/* Camogie */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-[#f4c430] to-[#ffd700]">
                <Image
                  src="/benelux-sports/camogie.jpg"
                  alt="Camogie - women's hurling"
                  fill
                  className="object-cover object-center"
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
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  The women&apos;s version of hurling. One of the
                  fastest-growing women&apos;s team sports in Europe.
                </p>
                <a
                  href="https://www.youtube.com/watch?v=u_3zS3R5x0Y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#2B9EB3] font-semibold text-sm hover:text-[#1a3a4a] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Video
                </a>
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
            <div className="text-center sm:text-left mb-2 sm:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                <EditableText
                  pageKey="home"
                  contentKey="events_title"
                  defaultValue="Next Three Fixtures"
                  maxLength={30}
                />
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Mark your calendars for these upcoming events
              </p>
            </div>
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
                  className="flex items-center gap-4 md:gap-6 p-4 md:p-5 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 border-2 border-gray-200 hover:border-[#2B9EB3]/30 group"
                >
                  <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {month}
                    </span>
                    <span className="text-xl md:text-2xl font-bold text-gray-800 leading-none">
                      {day}
                    </span>
                  </div>
                  <div className="hidden md:block flex-shrink-0 w-14 h-14">
                    <Image
                      src={getAssetUrl(fixture.hostCrest)}
                      alt={fixture.hostClub}
                      width={56}
                      height={56}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="md:hidden flex-shrink-0 w-10 h-10">
                    <Image
                      src={getAssetUrl(fixture.hostCrest)}
                      alt={fixture.hostClub}
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
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
                      {fixture.venue} • {fixture.hostClub}
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
          <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-8 md:mb-10">
            <div className="text-center sm:text-left mb-2 sm:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                <EditableText
                  pageKey="home"
                  contentKey="news_title"
                  defaultValue="Latest News"
                  maxLength={30}
                />
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Stories from across the Benelux GAA region
              </p>
            </div>
            <InternalLink
              href="/news"
              className="text-[#2B9EB3] font-semibold hover:text-[#1a3a4a] transition-colors hidden sm:inline"
            >
              View all news →
            </InternalLink>
          </div>

          {newsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#2B9EB3] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : latestNews.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Featured Article - Large */}
              {latestNews[0] && (
                <article className="md:row-span-2 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
                  <div className="relative h-48 md:h-64 bg-gradient-to-br from-[#1a3a4a] via-[#1a3a4a] to-[#2B9EB3] flex items-center justify-center">
                    {latestNews[0].imageUrl ? (
                      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
                        <Image
                          src={latestNews[0].imageUrl}
                          alt={latestNews[0].title}
                          width={120}
                          height={120}
                          className="w-20 h-20 md:w-28 md:h-28 object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-3xl">📰</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 text-gray-400 text-xs mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatNewsDate(latestNews[0].date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {latestNews[0].readTime} min read
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#2B9EB3] transition-colors leading-tight">
                      {latestNews[0].title}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 line-clamp-3">
                      {latestNews[0].excerpt}
                    </p>
                    <InternalLink
                      href="/news"
                      className="inline-flex items-center gap-2 text-[#2B9EB3] font-semibold text-sm hover:text-[#1a3a4a] transition-colors group/link"
                    >
                      Read more
                      <ChevronRight
                        size={16}
                        className="group-hover/link:translate-x-1 transition-transform"
                      />
                    </InternalLink>
                  </div>
                </article>
              )}

              {/* Secondary Articles - Compact */}
              <div className="space-y-4">
                {latestNews.slice(1, 4).map((article) => (
                  <article
                    key={article.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100"
                  >
                    <div className="flex">
                      <div className="w-24 md:w-32 flex-shrink-0 bg-gradient-to-br from-[#1a3a4a]/10 to-[#2B9EB3]/10 flex items-center justify-center relative">
                        {article.imageUrl ? (
                          <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-2xl opacity-50">📰</span>
                        )}
                      </div>
                      <div className="p-4 flex-1 min-w-0">
                        <span className="text-gray-400 text-[10px] flex items-center gap-1 mb-2">
                          <Calendar size={10} />
                          {formatNewsDate(article.date)}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#2B9EB3] transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1 hidden md:block">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No news articles available.
            </div>
          )}

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

      {/* Sponsorship & Newsletter Section */}
      <section className="py-16 md:py-20 bg-[#1a3a4a]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Interested in Sponsoring?
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Partner with Benelux GAA and connect your brand with a
                passionate community across the Netherlands, Belgium,
                Luxembourg, and Germany.
              </p>
              <InternalLink
                href="/sponsors"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1a3a4a] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get in Touch
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </InternalLink>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Stay Updated
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Subscribe to our newsletter for the latest news, fixtures, and
                updates from Benelux GAA.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
