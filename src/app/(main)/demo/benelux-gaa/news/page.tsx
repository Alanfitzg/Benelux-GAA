"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import { Calendar, Clock, User, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useBasePath } from "../hooks/useBasePath";

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
  const { basePath } = useBasePath();

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const res = await fetch("/api/benelux-news");
        const data = await res.json();
        setArticles(data);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const featuredArticle = articles.find((a) => a.featured);
  const regularArticles = articles.filter((a) => !a.featured);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage="News" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              <EditableText
                pageKey="news"
                contentKey="title"
                defaultValue="News from the Benelux"
                maxLength={40}
              />
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto px-2">
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
                <Link href={`${basePath}/news/${featuredArticle.id}`}>
                  <article className="mb-10 bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow border-2 border-gray-200 cursor-pointer group">
                    <div className="grid md:grid-cols-2">
                      <div className="relative h-48 sm:h-64 md:h-auto bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 sm:p-8">
                        {featuredArticle.imageUrl ? (
                          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow">
                            <Image
                              src={featuredArticle.imageUrl}
                              alt={featuredArticle.title}
                              width={200}
                              height={200}
                              className="object-contain w-28 h-28 md:w-36 md:h-36"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                              <span className="text-3xl">📰</span>
                            </div>
                            <span className="text-gray-500 text-sm uppercase tracking-wider">
                              Featured Story
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 md:p-8 flex flex-col justify-center">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-[#2B9EB3] transition-colors">
                          {featuredArticle.title}
                        </h2>
                        <p className="text-gray-600 mb-5 leading-relaxed line-clamp-3 text-sm md:text-base">
                          {featuredArticle.excerpt}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-400 text-xs sm:text-sm mb-4 sm:mb-5">
                          <span className="flex items-center gap-1.5">
                            <User size={14} />
                            <span className="truncate max-w-[100px] sm:max-w-none">
                              {featuredArticle.author}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formatDate(featuredArticle.date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {featuredArticle.readTime}m
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a3a4a] text-white rounded-lg font-medium group-hover:bg-[#0d2530] transition-colors w-fit text-sm">
                          Read Article
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              {/* Article List - Simple vertical layout */}
              <div className="space-y-4">
                {regularArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`${basePath}/news/${article.id}`}
                  >
                    <article className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 group border border-gray-100 cursor-pointer">
                      <div className="flex flex-col sm:flex-row">
                        {/* Image */}
                        <div className="sm:w-48 md:w-56 h-40 sm:h-auto bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden flex-shrink-0">
                          {article.imageUrl ? (
                            <Image
                              src={article.imageUrl}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-3xl opacity-30">📰</span>
                            </div>
                          )}
                        </div>
                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-400 text-xs">
                              {formatDate(article.date)}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-400 text-xs">
                              {article.readTime} min read
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#2B9EB3] transition-colors leading-snug">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                            {article.excerpt}
                          </p>
                          <div className="mt-3">
                            <span className="text-[#2B9EB3] text-sm font-medium group-hover:underline">
                              Read more →
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {articles.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📭</span>
                  </div>
                  <p className="text-gray-500">
                    No articles yet. Check back soon!
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
