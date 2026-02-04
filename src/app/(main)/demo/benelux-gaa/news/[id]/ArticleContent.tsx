"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Calendar, Clock, User, ArrowLeft, Share2, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useBasePath } from "../../hooks/useBasePath";
import { useState } from "react";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  readTime: number;
  category: string;
  tags: string[];
  imageUrl: string;
  featured: boolean;
}

// LinkedIn icon component
const LinkedInIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticleContent({ article }: { article: NewsArticle }) {
  const { basePath } = useBasePath();
  const [copied, setCopied] = useState(false);

  const articleUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://beneluxgaa.com/news/${article.id}`;

  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Convert content with line breaks to paragraphs
  const contentParagraphs = article.content
    .split("\n\n")
    .filter((p) => p.trim());

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage="News" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-3xl mx-auto px-4">
          {/* Back link */}
          <Link
            href={`${basePath}/news`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#2B9EB3] transition-colors mb-6 text-sm"
          >
            <ArrowLeft size={16} />
            Back to News
          </Link>

          {/* Article Header */}
          <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {/* Hero Image */}
            {article.imageUrl && (
              <div className="relative h-48 sm:h-64 md:h-80 bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3] flex items-center justify-center">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    width={200}
                    height={200}
                    className="object-contain w-32 h-32 md:w-40 md:h-40"
                    unoptimized
                  />
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8 md:p-10">
              {/* Category & Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-[#2B9EB3]/10 text-[#2B9EB3] text-xs font-medium rounded-full">
                  {article.category}
                </span>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-6 pb-6 border-b border-gray-100">
                <span className="flex items-center gap-1.5">
                  <User size={16} />
                  {article.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  {formatDate(article.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} />
                  {article.readTime} min read
                </span>
              </div>

              {/* Share Section - Prominent for LinkedIn */}
              <div className="bg-gradient-to-r from-[#0077b5]/5 to-[#2B9EB3]/5 rounded-xl p-4 mb-8 border border-[#0077b5]/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-gray-600 font-medium">
                    Share this article
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href={linkedInShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0077b5] text-white rounded-lg font-medium hover:bg-[#006396] transition-colors text-sm"
                    >
                      <LinkedInIcon size={18} />
                      Share on LinkedIn
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                      {copied ? (
                        <>
                          <Check size={16} className="text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 size={16} />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="prose prose-gray max-w-none">
                {contentParagraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-gray-700 leading-relaxed mb-4 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Bottom Share Section */}
              <div className="mt-10 pt-8 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-gray-900 font-semibold mb-1">
                      Enjoyed this article?
                    </p>
                    <p className="text-gray-500 text-sm">
                      Share it with your network on LinkedIn
                    </p>
                  </div>
                  <a
                    href={linkedInShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#0077b5] text-white rounded-lg font-medium hover:bg-[#006396] transition-colors"
                  >
                    <LinkedInIcon size={20} />
                    Share on LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* Back to News */}
          <div className="mt-8 text-center">
            <Link
              href={`${basePath}/news`}
              className="inline-flex items-center gap-2 text-[#2B9EB3] hover:text-[#1a3a4a] transition-colors font-medium"
            >
              <ArrowLeft size={18} />
              Back to all news
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
