import { NextResponse } from "next/server";

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
  status: "published" | "draft";
}

// In-memory storage for demo purposes
// In production, this would connect to a database
const newsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "New Club Spotlight – Aachen Gaels",
    excerpt:
      "Germany's first new GAA club in a decade has emerged at the crossroads of Germany, Belgium, and the Netherlands. Aachen Gaels brings Germany's total to 12 clubs, making it the third-largest GAA nation in continental Europe.",
    content: `Germany's first new GAA club in a decade has emerged at the crossroads of Germany, Belgium, and the Netherlands.

Aachen Gaels brings Germany's total to 12 clubs, making it the third-largest GAA nation in continental Europe.

The club was founded in late 2025 by a group of Irish expatriates working at RWTH Aachen University and local tech companies. Their inaugural training session drew over 30 participants, a promising start for the fledgling club.

"We've been overwhelmed by the response," said club chairperson Siobhan Murphy. "There's clearly a hunger for GAA in this part of Germany."

The Gaels have already registered for the 2026 Benelux Championships and are actively recruiting players of all skill levels.`,
    date: "2026-01-19",
    author: "Alan Fitzgerald",
    readTime: 4,
    category: "Benelux News",
    tags: ["Featured", "New Club"],
    imageUrl: "/club-crests/aachen gaels.png",
    featured: true,
    status: "published",
  },
  {
    id: "2",
    title: "Amsterdam Leinster Claim 2025 15-a-side Title",
    excerpt:
      "Amsterdam Leinster have secured their fourth consecutive 15-a-side championship title with a commanding victory over Luxembourg in the final.",
    content: `Amsterdam Leinster have secured their fourth consecutive 15-a-side championship title with a commanding victory over Luxembourg in the final.

The match, played at the Benelux Championships in Eindhoven, saw Amsterdam dominate from the opening whistle, eventually running out comfortable winners.

Captain Michael O'Brien lifted the trophy for the fourth time, cementing Amsterdam's dynasty in the 15-a-side code.

"It never gets old," O'Brien said after the match. "The lads put in an incredible effort all year, and this is the reward."

Luxembourg, despite the defeat, can take pride in reaching another final and continuing to challenge the traditional powerhouses.`,
    date: "2025-06-15",
    author: "Benelux GAA",
    readTime: 3,
    category: "Results",
    tags: ["Championships", "Amsterdam"],
    imageUrl: "",
    featured: false,
    status: "published",
  },
  {
    id: "3",
    title: "2026 Championship Dates Announced",
    excerpt:
      "The Benelux GAA Board has confirmed the dates for the 2026 Championships, with the tournament returning to its traditional June slot.",
    content: `The Benelux GAA Board has confirmed the dates for the 2026 Championships.

The tournament will take place on June 13-14, 2026, at a venue to be announced shortly.

All codes will be represented, including Men's and Ladies Football, Hurling, and Camogie across various formats.

Registration opens on March 1st, 2026.`,
    date: "2026-01-10",
    author: "Benelux GAA",
    readTime: 2,
    category: "Announcements",
    tags: ["Championships", "2026"],
    imageUrl: "",
    featured: false,
    status: "published",
  },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const limit = searchParams.get("limit");
  const status = searchParams.get("status") || "published";

  let filtered = [...newsArticles];

  // Filter by status
  if (status !== "all") {
    filtered = filtered.filter((a) => a.status === status);
  }

  // Filter by category (including Benelux News specifically)
  if (category && category !== "All") {
    filtered = filtered.filter(
      (a) => a.category === category || a.category.includes("Benelux")
    );
  }

  // Filter for featured articles
  if (featured === "true") {
    filtered = filtered.filter(
      (a) => a.featured || a.tags.includes("Featured")
    );
  }

  // Sort by date (newest first)
  filtered.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Limit results
  if (limit) {
    filtered = filtered.slice(0, parseInt(limit));
  }

  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newArticle: NewsArticle = {
      id: generateId(),
      title: body.title || "",
      excerpt: body.excerpt || "",
      content: body.content || "",
      date: body.date || new Date().toISOString().split("T")[0],
      author: body.author || "",
      readTime: body.readTime || 3,
      category: body.category || "Benelux News",
      tags: body.tags || [],
      imageUrl: body.imageUrl || "",
      featured: body.featured || false,
      status: body.status || "draft",
    };

    newsArticles.unshift(newArticle);

    return NextResponse.json(newArticle, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    const index = newsArticles.findIndex((a) => a.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const updatedArticle: NewsArticle = {
      ...newsArticles[index],
      title: body.title ?? newsArticles[index].title,
      excerpt: body.excerpt ?? newsArticles[index].excerpt,
      content: body.content ?? newsArticles[index].content,
      date: body.date ?? newsArticles[index].date,
      author: body.author ?? newsArticles[index].author,
      readTime: body.readTime ?? newsArticles[index].readTime,
      category: body.category ?? newsArticles[index].category,
      tags: body.tags ?? newsArticles[index].tags,
      imageUrl: body.imageUrl ?? newsArticles[index].imageUrl,
      featured: body.featured ?? newsArticles[index].featured,
      status: body.status ?? newsArticles[index].status,
    };

    newsArticles[index] = updatedArticle;

    return NextResponse.json(updatedArticle);
  } catch {
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    const index = newsArticles.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    newsArticles.splice(index, 1);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 400 }
    );
  }
}
