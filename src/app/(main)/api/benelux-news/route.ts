import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export interface NewsArticle {
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
  status: "published" | "draft" | "scheduled";
  scheduledDate?: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function getArticles(): Promise<NewsArticle[]> {
  const record = await prisma.siteData.findUnique({ where: { key: "news" } });
  if (!record?.data) return [];
  return record.data as unknown as NewsArticle[];
}

async function saveArticles(articles: NewsArticle[]): Promise<void> {
  await prisma.siteData.upsert({
    where: { key: "news" },
    update: { data: articles as unknown as object },
    create: { key: "news", data: articles as unknown as object },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const featured = searchParams.get("featured");
  const limit = searchParams.get("limit");
  const status = searchParams.get("status") || "published";

  const articles = await getArticles();
  const now = new Date();
  let needsSave = false;
  for (const article of articles) {
    if (
      article.status === "scheduled" &&
      article.scheduledDate &&
      new Date(article.scheduledDate) <= now
    ) {
      article.status = "published";
      article.date = article.scheduledDate.split("T")[0];
      delete article.scheduledDate;
      needsSave = true;
    }
  }
  if (needsSave) {
    await saveArticles(articles);
  }

  if (id) {
    const article = articles.find((a) => a.id === id);
    if (!article) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(article);
  }

  let filtered = [...articles];

  if (status !== "all") {
    filtered = filtered.filter((a) => a.status === status);
  }

  if (featured === "true") {
    filtered = filtered.filter((a) => a.featured);
  }

  filtered.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (limit) {
    filtered = filtered.slice(0, parseInt(limit));
  }

  return NextResponse.json(filtered);
}

async function postHandler(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const articles = await getArticles();

    const newArticle: NewsArticle = {
      id: generateId(),
      title: body.title || "",
      excerpt: body.excerpt || "",
      content: body.content || "",
      date: body.date || new Date().toISOString().split("T")[0],
      author: body.author || "",
      readTime: body.readTime || 3,
      category: "Benelux News",
      tags: [],
      imageUrl: body.imageUrl || "",
      featured: body.featured || false,
      status: body.status || "draft",
      ...(body.scheduledDate ? { scheduledDate: body.scheduledDate } : {}),
    };

    await saveArticles([newArticle, ...articles]);

    return NextResponse.json(newArticle, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 400 }
    );
  }
}

export const POST = withRateLimit(RATE_LIMITS.ADMIN, postHandler);

async function putHandler(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    const articles = await getArticles();
    const index = articles.findIndex((a) => a.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const updatedArticle: NewsArticle = {
      ...articles[index],
      title: body.title ?? articles[index].title,
      excerpt: body.excerpt ?? articles[index].excerpt,
      content: body.content ?? articles[index].content,
      date: body.date ?? articles[index].date,
      author: body.author ?? articles[index].author,
      readTime: body.readTime ?? articles[index].readTime,
      imageUrl: body.imageUrl ?? articles[index].imageUrl,
      featured: body.featured ?? articles[index].featured,
      status: body.status ?? articles[index].status,
      ...(body.scheduledDate !== undefined
        ? body.scheduledDate
          ? { scheduledDate: body.scheduledDate }
          : {}
        : articles[index].scheduledDate
          ? { scheduledDate: articles[index].scheduledDate }
          : {}),
    };

    articles[index] = updatedArticle;
    await saveArticles(articles);

    return NextResponse.json(updatedArticle);
  } catch {
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 400 }
    );
  }
}

export const PUT = withRateLimit(RATE_LIMITS.ADMIN, putHandler);

async function deleteHandler(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    const articles = await getArticles();
    const filtered = articles.filter((a) => a.id !== id);

    if (filtered.length === articles.length) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await saveArticles(filtered);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 400 }
    );
  }
}

export const DELETE = withRateLimit(RATE_LIMITS.ADMIN, deleteHandler);
