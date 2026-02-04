import { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleContent from "./ArticleContent";

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

// Fetch article data for metadata
async function getArticle(id: string): Promise<NewsArticle | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://beneluxgaa.com";
  try {
    const res = await fetch(`${baseUrl}/api/benelux-news?status=all`, {
      cache: "no-store",
    });
    const articles: NewsArticle[] = await res.json();
    return articles.find((a) => a.id === id) || null;
  } catch {
    return null;
  }
}

// Generate dynamic metadata for LinkedIn/social sharing
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return {
      title: "Article Not Found | Benelux GAA",
    };
  }

  const baseUrl = "https://beneluxgaa.com";
  const articleUrl = `${baseUrl}/news/${article.id}`;
  const imageUrl = article.imageUrl
    ? article.imageUrl.startsWith("http")
      ? article.imageUrl
      : `${baseUrl}${article.imageUrl}`
    : `${baseUrl}/benelux-gaa-crest.png`;

  return {
    title: `${article.title} | Benelux GAA`,
    description: article.excerpt,
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: articleUrl,
      siteName: "Benelux GAA",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      locale: "en_IE",
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return <ArticleContent article={article} />;
}
