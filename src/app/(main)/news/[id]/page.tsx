"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Loader2,
  ChevronRight,
  Share2,
} from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  readTime: number;
  imageUrl: string;
  featured: boolean;
  status: "published" | "draft";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.trim().startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc pl-6 space-y-1.5 my-4 text-gray-700">
          {items.map((item, idx) => (
            <li key={idx}>{inlineFormat(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      elements.push(
        <figure key={i} className="my-8">
          <img
            src={imgMatch[2]}
            alt={imgMatch[1] || ""}
            className="w-full rounded-xl"
          />
          {imgMatch[1] && imgMatch[1] !== "image" && (
            <figcaption className="text-center text-sm text-gray-400 mt-2">
              {imgMatch[1]}
            </figcaption>
          )}
        </figure>
      );
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h2
          key={i}
          className="text-2xl font-bold text-[#1a3a4a] mt-8 mb-3 leading-tight"
        >
          {inlineFormat(line.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={i}
          className="text-xl font-bold text-[#1a3a4a] mt-6 mb-2 leading-tight"
        >
          {inlineFormat(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }

    elements.push(
      <p key={i} className="text-gray-700 leading-[1.8] my-4 text-[16px]">
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return elements;
}

function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(
    /(!\[[^\]]*\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g
  );
  return parts.map((part, i) => {
    const inlineImg = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (inlineImg) {
      return (
        <img
          key={i}
          src={inlineImg[2]}
          alt={inlineImg[1] || ""}
          className="inline-block max-h-64 rounded-lg my-1"
        />
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2B9EB3] hover:underline font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [otherArticles, setOtherArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/benelux-news?id=${id}`).then((res) =>
        res.ok ? res.json() : null
      ),
      fetch("/api/benelux-news?status=published&limit=6").then((res) =>
        res.ok ? res.json() : []
      ),
    ])
      .then(([articleData, allArticles]) => {
        if (!articleData) {
          setNotFound(true);
        } else {
          setArticle(articleData);
        }
        setOtherArticles(
          (allArticles as NewsArticle[]).filter((a: NewsArticle) => a.id !== id)
        );
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage="News" />

      <main className="flex-1 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-24 pt-32">
            <Loader2 className="w-8 h-8 animate-spin text-[#2B9EB3]" />
          </div>
        ) : notFound || !article ? (
          <div className="text-center py-24 pt-32">
            <p className="text-gray-500 text-lg mb-4">Article not found.</p>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a3a4a] text-white rounded-lg font-medium hover:bg-[#2B9EB3] transition-colors"
            >
              <ArrowLeft size={16} />
              Back to News
            </Link>
          </div>
        ) : (
          <>
            {/* Full-width hero image */}
            {article.imageUrl && (
              <div className="relative w-full pt-16 sm:pt-20 md:pt-[88px]">
                <div className="relative h-64 sm:h-80 md:h-[420px] lg:h-[480px] bg-gray-900 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a4a]/60 via-transparent to-[#1a3a4a]/20" />
                </div>
              </div>
            )}
            {!article.imageUrl && <div className="pt-20 sm:pt-24 md:pt-28" />}

            <div className="max-w-7xl mx-auto px-4">
              <div
                className={`flex flex-col lg:flex-row gap-8 relative z-10 ${article.imageUrl ? "-mt-12 md:-mt-16" : "mt-8"}`}
              >
                {/* Main Article */}
                <article className="flex-1 min-w-0">
                  <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 md:p-10">
                    <div className="mb-6">
                      <Link
                        href="/news"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-[#1a3a4a] text-sm font-medium transition-colors"
                      >
                        <ArrowLeft size={14} />
                        Back to News
                      </Link>
                    </div>

                    {article.featured && (
                      <span className="inline-block px-3 py-1 bg-[#2B9EB3] text-white text-xs font-semibold rounded-full mb-4">
                        Featured
                      </span>
                    )}

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a3a4a] leading-tight mb-5">
                      {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pb-6 border-b border-gray-100 mb-8">
                      {article.author && (
                        <span className="flex items-center gap-1.5">
                          <User size={14} />
                          {article.author}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatDate(article.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {article.readTime} min read
                      </span>
                      <button
                        type="button"
                        onClick={handleShare}
                        className="flex items-center gap-1.5 hover:text-[#2B9EB3] transition-colors ml-auto"
                      >
                        <Share2 size={14} />
                        Share
                      </button>
                    </div>

                    <div className="max-w-none">
                      {renderMarkdown(article.content)}
                    </div>
                  </div>
                </article>

                {/* Sidebar */}
                <aside className="lg:w-80 flex-shrink-0 space-y-6">
                  {/* Recent Articles */}
                  {otherArticles.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-5">
                      <h3 className="text-sm font-bold text-[#1a3a4a] uppercase tracking-wider mb-4">
                        Recent News
                      </h3>
                      <div className="space-y-4">
                        {otherArticles.slice(0, 5).map((a) => (
                          <Link
                            key={a.id}
                            href={`/news/${a.id}`}
                            className="flex gap-3 group"
                          >
                            {a.imageUrl ? (
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                <img
                                  src={a.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg flex-shrink-0 bg-gradient-to-br from-[#1a3a4a]/10 to-[#2B9EB3]/10 flex items-center justify-center">
                                <span className="text-lg opacity-40">📰</span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#2B9EB3] transition-colors leading-snug">
                                {a.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(a.date)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/news"
                        className="flex items-center gap-1 text-[#2B9EB3] text-sm font-semibold mt-4 hover:text-[#1a3a4a] transition-colors"
                      >
                        View all news
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  )}

                  {/* Sponsors */}
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <h3 className="text-sm font-bold text-[#1a3a4a] uppercase tracking-wider mb-4">
                      Championship Sponsor
                    </h3>
                    <a
                      href="https://breaghrecruitment.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <img
                        src="/sponsors/breagh-blue.png"
                        alt="Breagh Recruitment"
                        className="w-full max-w-[200px] mx-auto"
                      />
                    </a>
                  </div>

                  {/* GGE Crest */}
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <h3 className="text-sm font-bold text-[#1a3a4a] uppercase tracking-wider mb-4">
                      Affiliated with
                    </h3>
                    <div className="flex items-center justify-center gap-4">
                      <img
                        src="/images/gge-crest.png"
                        alt="Gaelic Games Europe"
                        className="h-16 object-contain"
                      />
                      <img
                        src="/images/Benelux Crest white background.png"
                        alt="Benelux GAA"
                        className="h-16 object-contain"
                      />
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
