import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ArticleContent from "./ArticleContent";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  date: string;
}

async function getArticle(id: string): Promise<NewsArticle | null> {
  try {
    const record = await prisma.siteData.findUnique({
      where: { key: "news" },
    });
    if (!record?.data) return null;
    const articles = record.data as unknown as NewsArticle[];
    return articles.find((a) => a.id === id) || null;
  } catch {
    return null;
  }
}

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

  const baseUrl = "https://www.beneluxgaa.com";
  const articleUrl = `${baseUrl}/news/${id}`;
  const imageUrl = article.imageUrl?.startsWith("http")
    ? article.imageUrl
    : article.imageUrl
      ? `${baseUrl}${article.imageUrl}`
      : `${baseUrl}/images/benelux-gaa-og.png`;

  return {
    title: `${article.title} | Benelux GAA`,
    description: article.excerpt || `Read "${article.title}" on Benelux GAA`,
    openGraph: {
      title: article.title,
      description: article.excerpt || `Read "${article.title}" on Benelux GAA`,
      url: articleUrl,
      siteName: "Benelux GAA",
      type: "article",
      publishedTime: article.date,
      authors: article.author ? [article.author] : undefined,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || `Read "${article.title}" on Benelux GAA`,
      images: [imageUrl],
    },
  };
}

export default function ArticlePage() {
  return <ArticleContent />;
}
