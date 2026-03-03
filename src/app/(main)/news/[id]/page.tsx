"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Calendar, Clock, User, ArrowLeft, Loader2 } from "lucide-react";

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
    day: "numeric",
    month: "long",
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

    // Bullet list — collect consecutive list items
    if (line.trim().startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul
          key={i}
          className="list-disc list-inside space-y-1 my-3 text-gray-700"
        >
          {items.map((item, idx) => (
            <li key={idx}>{inlineFormat(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Heading
    if (line.startsWith("# ")) {
      elements.push(
        <h2 key={i} className="text-2xl font-bold text-[#1a3a4a] mt-6 mb-3">
          {inlineFormat(line.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="text-xl font-bold text-[#1a3a4a] mt-5 mb-2">
          {inlineFormat(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p key={i} className="text-gray-700 leading-relaxed my-3">
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return elements;
}

function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
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
          className="text-[#2B9EB3] hover:underline"
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
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/benelux-news?id=${id}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setArticle(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage="News" />

      <main className="flex-1 pt-20 pb-12 sm:pt-24 md:pt-28">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1a3a4a] text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Back to News
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#2B9EB3]" />
            </div>
          ) : notFound || !article ? (
            <div className="text-center py-24">
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
            <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Hero image */}
              {article.imageUrl && (
                <div className="relative h-56 sm:h-72 md:h-80 bg-white flex items-center justify-center p-8">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-contain p-6"
                    unoptimized
                  />
                </div>
              )}
              {!article.imageUrl && <div className="h-2 bg-[#1a3a4a]" />}

              <div className="p-6 sm:p-8 md:p-10">
                {article.featured && (
                  <span className="inline-block px-3 py-1 bg-[#2B9EB3] text-white text-xs font-semibold rounded-full mb-4">
                    Featured
                  </span>
                )}

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a3a4a] leading-tight mb-4">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pb-6 border-b border-gray-100 mb-6">
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
                </div>

                <div className="prose-content">
                  {renderMarkdown(article.content)}
                </div>
              </div>
            </article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
