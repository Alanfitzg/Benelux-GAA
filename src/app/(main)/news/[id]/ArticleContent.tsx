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
  Landmark,
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

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
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

    const bareYtId = extractYouTubeId(line.trim());
    if (bareYtId) {
      elements.push(
        <figure key={i} className="my-8">
          <div
            className="relative w-full rounded-xl overflow-hidden"
            style={{ paddingBottom: "56.25%" }}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${bareYtId}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </figure>
      );
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
      const ytId = extractYouTubeId(imgMatch[2]);
      if (ytId) {
        elements.push(
          <figure key={i} className="my-8">
            <div
              className="relative w-full rounded-xl overflow-hidden"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                title={imgMatch[1] || "YouTube video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            {imgMatch[1] && imgMatch[1] !== "image" && (
              <figcaption className="text-center text-sm text-gray-400 mt-2">
                {imgMatch[1]}
              </figcaption>
            )}
          </figure>
        );
      } else {
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
      }
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

export default function ArticleContent() {
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
            <div className="pt-20 sm:pt-24 md:pt-[88px]" />

            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-col lg:flex-row gap-8 mt-4">
                {/* Main Article */}
                <article className="flex-1 min-w-0">
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-auto max-h-[480px] object-cover"
                      />
                    )}

                    <div className="p-6 sm:p-8 md:p-10">
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

                      {/* Share */}
                      <div className="mt-10 pt-6 border-t border-gray-100">
                        <p className="text-sm font-semibold text-gray-400 mb-3">
                          Share this article
                        </p>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(article.title + " " + (typeof window !== "undefined" ? window.location.href : ""))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                            title="Share on WhatsApp"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          </a>
                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                            title="Share on X"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          </a>
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                            title="Share on Facebook"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                window.location.href
                              );
                            }}
                            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
                            title="Copy link"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Sidebar */}
                <aside className="lg:w-80 flex-shrink-0 lg:sticky lg:top-28 lg:self-start space-y-6">
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

                  {/* Museum */}
                  <Link
                    href="/timeline"
                    className="block rounded-2xl overflow-hidden group relative"
                  >
                    <div className="bg-[#1a3a4a] p-5 relative overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-5"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />
                      <div className="relative flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                          <Landmark size={18} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            The Benelux Museum
                          </h3>
                          <p className="text-xs text-white/60">
                            Explore our history since 1747 →
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* GGE Shop */}
                  <a
                    href="https://www.mckeeversports.com/collections/gaelic-games-europe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="bg-gray-100 p-4 flex items-center justify-center">
                      <img
                        src="/images/gge-jersey.png"
                        alt="GGE Jersey"
                        className="h-32 object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-[#1a3a4a] mb-1">
                        GGE Official Gear
                      </h3>
                      <p className="text-xs text-gray-500">
                        Shop at McKeever Sports →
                      </p>
                    </div>
                  </a>

                  <div className="flex items-center justify-center gap-5 py-4 opacity-50">
                    <img
                      src="/images/gaa-logo.png"
                      alt="GAA"
                      className="h-7 max-w-[60px] object-contain"
                    />
                    <img
                      src="/images/lgfa-logo.png"
                      alt="LGFA"
                      className="h-7 object-contain"
                    />
                    <img
                      src="/images/camogie-logo.jpg"
                      alt="Camogie Association"
                      className="h-7 object-contain"
                    />
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
