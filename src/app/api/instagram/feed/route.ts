import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

interface InstagramResponse {
  data: InstagramPost[];
  paging?: {
    cursors: { before: string; after: string };
    next?: string;
  };
}

async function fetchInstagramPosts(clubId: string): Promise<InstagramPost[]> {
  const tokenRecord = await prisma.instagramToken.findUnique({
    where: { clubId },
  });

  if (!tokenRecord) {
    return [];
  }

  if (new Date() > tokenRecord.expiresAt) {
    console.warn(`Instagram token expired for club ${clubId}`);
    return [];
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${tokenRecord.token}&limit=12`
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Instagram API error:", error);
      return [];
    }

    const data: InstagramResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching Instagram posts:", error);
    return [];
  }
}

const getCachedInstagramPosts = unstable_cache(
  async (clubId: string) => fetchInstagramPosts(clubId),
  ["instagram-feed"],
  { revalidate: 3600, tags: ["instagram"] }
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "clubId is required" }, { status: 400 });
  }

  try {
    const posts = await getCachedInstagramPosts(clubId);

    return NextResponse.json({
      posts,
      cached: true,
    });
  } catch (error) {
    console.error("Error in Instagram feed API:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram feed" },
      { status: 500 }
    );
  }
}
