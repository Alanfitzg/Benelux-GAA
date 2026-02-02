import { NextResponse } from "next/server";

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  author: string;
  readTime: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  featured: boolean;
  status: "published" | "draft";
}

// This would eventually connect to WordPress API or a database
// For now, using static data that mirrors the WordPress structure
const newsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "New Club Spotlight – Aachen Gaels",
    excerpt:
      "Germany's first new GAA club in a decade has emerged at the crossroads of Germany, Belgium, and the Netherlands. Aachen Gaels brings Germany's total to 12 clubs, making it the third-largest GAA nation in continental Europe.",
    content: "",
    date: "2026-01-19",
    author: "Alan Fitzgerald",
    readTime: 4,
    category: "Benelux News",
    tags: ["Featured"],
    imageUrl: "/club-crests/aachen gaels.png",
    featured: true,
    status: "published",
  },
  {
    id: "2",
    title: "Young stars — Draft",
    excerpt:
      "Highlighting the emerging talent across the Benelux region as young players make their mark on Gaelic Games.",
    content: "",
    date: "2026-01-19",
    author: "Alan Fitzgerald",
    readTime: 3,
    category: "Benelux News",
    tags: [],
    featured: false,
    status: "draft",
  },
  {
    id: "3",
    title: "Top 10 moments of 2025!",
    excerpt:
      "From historic victories to unforgettable comebacks, we count down the most memorable moments from the 2025 Benelux GAA season.",
    content: "",
    date: "2025-12-02",
    author: "Alan Fitzgerald",
    readTime: 6,
    category: "Featured",
    tags: [],
    imageUrl: "/benelux-sports/football.jpg",
    featured: true,
    status: "published",
  },
  {
    id: "4",
    title:
      "Championing Inclusive Gaelic Games: Meet Charlie Jameson, GGE's Recreational Officer",
    excerpt:
      "An interview with Charlie Jameson about growing recreational GAA across Europe and making the games accessible to all.",
    content: "",
    date: "2025-11-27",
    author: "Alan Fitzgerald",
    readTime: 5,
    category: "Central East News",
    tags: ["Featured"],
    featured: false,
    status: "published",
  },
  {
    id: "5",
    title: "Europes Young Stars – Oisin Shortall",
    excerpt:
      "Spotlight on one of the Benelux region's most promising young talents making waves in European GAA.",
    content: "",
    date: "2025-11-26",
    author: "Alan Fitzgerald",
    readTime: 4,
    category: "Benelux News",
    tags: [],
    featured: false,
    status: "draft",
  },
  {
    id: "6",
    title: "Small Ball in Europe – A year in review",
    excerpt:
      "2025 saw unprecedented growth in hurling and camogie across Europe. We look back at a landmark year for the small ball games.",
    content: "",
    date: "2025-10-15",
    author: "Alan Fitzgerald",
    readTime: 7,
    category: "Benelux News",
    tags: ["Featured"],
    imageUrl: "/benelux-sports/hurling.jpg",
    featured: true,
    status: "published",
  },
  {
    id: "7",
    title:
      "International GAA Player Exchange – Europe Welcomes All-Ireland Winner",
    excerpt:
      "A landmark moment as an All-Ireland winner joins a European club through the new player exchange program.",
    content: "",
    date: "2025-09-25",
    author: "Alan Fitzgerald",
    readTime: 5,
    category: "North-West News",
    tags: ["Featured"],
    featured: false,
    status: "published",
  },
  {
    id: "8",
    title:
      "Europes Player Pathway is Glistening – Féile Sparks a New Generation of Coaches",
    excerpt:
      "How the Féile tournament is inspiring a new wave of coaches across European GAA clubs.",
    content: "",
    date: "2025-08-29",
    author: "Alan Fitzgerald",
    readTime: 6,
    category: "North-West News",
    tags: ["Featured"],
    featured: false,
    status: "published",
  },
  {
    id: "9",
    title:
      "Kingspan Euro Gaelic Games 2025: France Delivers, Europe Accelerates",
    excerpt:
      "The biggest European GAA tournament of the year delivered thrilling action as clubs from across the continent competed in France.",
    content: "",
    date: "2025-07-25",
    author: "Alan Fitzgerald",
    readTime: 8,
    category: "North-West News",
    tags: ["Featured"],
    imageUrl: "/benelux-sports/camogie.jpg",
    featured: false,
    status: "published",
  },
  {
    id: "10",
    title: "History Makers: First-Ever European Féile All-Star Team",
    excerpt:
      "Announcing the inaugural European Féile All-Star team, celebrating the best young talent from across the continent.",
    content: "",
    date: "2025-06-30",
    author: "Alan Fitzgerald",
    readTime: 4,
    category: "Kids Corner",
    tags: ["Featured"],
    featured: false,
    status: "published",
  },
  {
    id: "11",
    title:
      "Gaelic Games Europe Embarks on a New Era with Landmark Kingspan Partnership",
    excerpt:
      "A groundbreaking sponsorship deal that will transform European GAA for years to come.",
    content: "",
    date: "2025-06-24",
    author: "Alan Fitzgerald",
    readTime: 5,
    category: "Featured",
    tags: [],
    featured: false,
    status: "published",
  },
  {
    id: "12",
    title: "Gaelic Games Take Centre Stage at the Vatican's Jubilee of Sport",
    excerpt:
      "GAA represented at a historic gathering of world sports at the Vatican.",
    content: "",
    date: "2025-06-17",
    author: "Alan Fitzgerald",
    readTime: 5,
    category: "Central & Eastern European News",
    tags: ["Featured"],
    featured: false,
    status: "published",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const limit = searchParams.get("limit");
  const status = searchParams.get("status") || "published";

  let filtered = newsArticles.filter((a) => a.status === status);

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
