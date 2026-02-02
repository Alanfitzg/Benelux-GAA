"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import { Calendar, Clock, Eye, ChevronRight } from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: number;
  views: number;
  category: string;
  imageUrl?: string;
  featured?: boolean;
}

const newsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "2026 Benelux GAA Season Fixtures Released",
    excerpt:
      "The complete fixtures calendar for the 2026 Benelux GAA season has been published. Check out all the dates and venues for this year's competitions.",
    content: "",
    date: "January 15, 2026",
    readTime: 3,
    views: 245,
    category: "Fixtures",
    featured: true,
  },
  {
    id: "2",
    title: "Amsterdam GAA Wins 2025 Benelux Championship",
    excerpt:
      "Congratulations to Amsterdam GAA on their thrilling victory in the 2025 Benelux Football Championship final.",
    content: "",
    date: "December 10, 2025",
    readTime: 4,
    views: 512,
    category: "Results",
  },
  {
    id: "3",
    title: "New Referee Training Program Launched",
    excerpt:
      "Benelux GAA has launched a comprehensive referee training program to develop officials across the region.",
    content: "",
    date: "November 28, 2025",
    readTime: 2,
    views: 178,
    category: "Development",
  },
  {
    id: "4",
    title: "Luxembourg GAA Celebrates 20 Years",
    excerpt:
      "Luxembourg GAA marked two decades of promoting Gaelic Games in the Grand Duchy with a special celebration event.",
    content: "",
    date: "November 15, 2025",
    readTime: 5,
    views: 324,
    category: "Club News",
  },
  {
    id: "5",
    title: "Youth Development Initiative Expands",
    excerpt:
      "The Benelux GAA youth program is expanding to more schools and clubs across the region in 2026.",
    content: "",
    date: "October 30, 2025",
    readTime: 3,
    views: 156,
    category: "Youth",
  },
  {
    id: "6",
    title: "Benelux Represented at GAA World Games",
    excerpt:
      "Players from across the Benelux region represented their clubs at the GAA World Games in Dublin.",
    content: "",
    date: "October 5, 2025",
    readTime: 6,
    views: 892,
    category: "International",
  },
];

const categories = [
  "All",
  "Fixtures",
  "Results",
  "Club News",
  "Development",
  "Youth",
  "International",
];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredArticles =
    selectedCategory === "All"
      ? newsArticles
      : newsArticles.filter((a) => a.category === selectedCategory);

  const featuredArticle = newsArticles.find((a) => a.featured);
  const regularArticles = filteredArticles.filter((a) => !a.featured);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="News" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <EditableText
                pageKey="news"
                contentKey="title"
                defaultValue="News from the Benelux"
                maxLength={40}
              />
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              <EditableText
                pageKey="news"
                contentKey="subtitle"
                defaultValue="Stay up to date with the latest news, results, and stories from Benelux GAA."
                maxLength={120}
              />
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-[#1a3a4a] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Featured Article */}
          {featuredArticle && selectedCategory === "All" && (
            <article className="mb-12 bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3] rounded-2xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="h-64 md:h-auto bg-black/20" />
                <div className="p-8 md:p-10 text-white">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                    Featured
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-white/80 mb-6 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-white/60 text-sm mb-6">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {featuredArticle.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {featuredArticle.readTime} min read
                    </span>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-6 py-3 bg-white text-[#1a3a4a] rounded-lg font-semibold hover:bg-white/90 transition-colors"
                  >
                    Read More
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </article>
          )}

          {/* Article Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  <span className="absolute top-4 left-4 px-3 py-1 bg-[#2B9EB3] text-white text-xs font-medium rounded-full">
                    {article.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#2B9EB3] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-gray-400 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {article.date.split(",")[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {article.readTime}m
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {article.views}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No articles found in this category.
              </p>
            </div>
          )}

          {/* Load More */}
          {filteredArticles.length > 0 && (
            <div className="text-center mt-10">
              <button
                type="button"
                className="px-8 py-3 border-2 border-[#1a3a4a] text-[#1a3a4a] rounded-lg font-semibold hover:bg-[#1a3a4a] hover:text-white transition-colors"
              >
                Load More Articles
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
