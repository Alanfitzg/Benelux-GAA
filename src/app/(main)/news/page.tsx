"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import { Calendar, Clock, User, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

const TAG_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  "New Club": {
    bg: "bg-emerald-500/90 backdrop-blur-sm",
    text: "text-white",
    icon: "🌱",
  },
  Featured: {
    bg: "bg-amber-500/90 backdrop-blur-sm",
    text: "text-white",
    icon: "⭐",
  },
  "Hurling & Camogie": {
    bg: "bg-orange-500/90 backdrop-blur-sm",
    text: "text-white",
    icon: "🏑",
  },
  GAA: {
    bg: "bg-[#1a3a4a]/90 backdrop-blur-sm",
    text: "text-white",
    icon: "🏐",
  },
  LGFA: {
    bg: "bg-rose-500/90 backdrop-blur-sm",
    text: "text-white",
    icon: "🏐",
  },
  Youth: {
    bg: "bg-sky-500/90 backdrop-blur-sm",
    text: "text-white",
    icon: "⚡",
  },
  Misc: {
    bg: "bg-slate-500/90 backdrop-blur-sm",
    text: "text-white",
    icon: "📋",
  },
  Championship: {
    bg: "bg-[#2B9EB3]/90 backdrop-blur-sm",
    text: "text-white",
    icon: "🏅",
  },
};

const DEFAULT_TAG_STYLE = {
  bg: "bg-gray-700/80 backdrop-blur-sm",
  text: "text-white",
  icon: "📌",
};

function getTagStyle(tag: string) {
  return TAG_STYLES[tag] || DEFAULT_TAG_STYLE;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/benelux-news");
        const data = await res.json();
        setArticles(data);
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const featuredArticle = articles.find((a) => a.featured);
  const regularArticles = articles.filter((a) => a !== featuredArticle);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage="News" />

      <main className="flex-1 pt-20 pb-8 sm:pt-24 sm:pb-16 md:pt-28">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-6 md:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              <EditableText
                pageKey="news"
                contentKey="title"
                defaultValue="News from the Benelux"
                maxLength={40}
              />
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              <EditableText
                pageKey="news"
                contentKey="subtitle"
                defaultValue="Stay up to date with the latest news, results, and stories from Benelux GAA."
                maxLength={120}
              />
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#2B9EB3]" />
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {featuredArticle && (
                <article className="mb-12 bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="grid md:grid-cols-2">
                    <div className="relative h-64 md:h-auto min-h-[280px] bg-gray-200 overflow-hidden">
                      {featuredArticle.imageUrl ? (
                        <img
                          src={featuredArticle.imageUrl}
                          alt={featuredArticle.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3]">
                          <div className="text-white text-center">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-4xl">📰</span>
                            </div>
                            <span className="text-white/80 text-sm uppercase tracking-wider">
                              Featured Story
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5 sm:p-8 md:p-10 flex flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="inline-block px-3 py-1 bg-[#2B9EB3] text-white text-xs font-semibold rounded-full">
                          Featured
                        </span>
                        {featuredArticle.tags
                          .filter((t) => t !== "Featured")
                          .map((tag) => {
                            const style = getTagStyle(tag);
                            return (
                              <span
                                key={tag}
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
                              >
                                <span className="text-xs leading-none">
                                  {style.icon}
                                </span>
                                {tag}
                              </span>
                            );
                          })}
                      </div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                        {featuredArticle.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-6">
                        <span className="flex items-center gap-1.5">
                          <User size={14} />
                          {featuredArticle.author}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {formatDate(featuredArticle.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {featuredArticle.readTime} min read
                        </span>
                      </div>
                      <Link
                        href={`/news/${featuredArticle.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a3a4a] text-white rounded-lg font-semibold hover:bg-[#0d2530] transition-colors w-fit"
                      >
                        Read Article
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                </article>
              )}

              {/* Article Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/news/${article.id}`}
                    className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group border border-gray-100 block"
                  >
                    <div className="h-36 sm:h-48 bg-gray-200 relative overflow-hidden">
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a3a4a]/10 to-[#2B9EB3]/10">
                          <span className="text-4xl opacity-50">📰</span>
                        </div>
                      )}
                      {article.tags.length > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/40 to-transparent">
                          <div className="flex flex-wrap gap-1.5">
                            {article.tags.map((tag) => {
                              const style = getTagStyle(tag);
                              return (
                                <span
                                  key={tag}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide shadow-lg ${style.bg} ${style.text}`}
                                >
                                  <span className="text-xs leading-none">
                                    {style.icon}
                                  </span>
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-[#2B9EB3] transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-gray-400 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(article.date)
                              .split(" ")
                              .slice(0, 2)
                              .join(" ")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {article.readTime}m
                          </span>
                        </div>
                        <span className="text-[#2B9EB3] font-medium group-hover:underline">
                          Read →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {articles.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2
                      className={`w-8 h-8 text-[#2B9EB3] mx-auto ${error ? "" : "animate-spin"}`}
                    />
                  </div>
                  <p className="text-gray-500">
                    {error
                      ? "Articles are temporarily unavailable. Please refresh the page."
                      : "Loading articles..."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
