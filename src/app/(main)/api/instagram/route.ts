import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INITIAL_TOKEN = process.env.ROME_HIBERNIA_INSTAGRAM_TOKEN;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const REFRESH_THRESHOLD_DAYS = 7; // Refresh when less than 7 days remaining

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

interface CachedData {
  posts: InstagramPost[];
  cachedAt: number;
}

let cache: CachedData | null = null;

async function getToken(clubId: string): Promise<string | null> {
  // Try to get token from database first
  const stored = await prisma.instagramToken.findUnique({
    where: { clubId },
  });

  if (stored) {
    // Check if token needs refresh (less than 7 days remaining)
    const daysUntilExpiry =
      (stored.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

    if (daysUntilExpiry < REFRESH_THRESHOLD_DAYS && daysUntilExpiry > 0) {
      // Refresh the token
      const refreshed = await refreshToken(stored.token, clubId);
      if (refreshed) return refreshed;
    }

    // Return stored token if not expired
    if (stored.expiresAt > new Date()) {
      return stored.token;
    }
  }

  // Fall back to env var for initial setup
  if (INITIAL_TOKEN) {
    // Store the initial token with 60-day expiry
    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    await prisma.instagramToken.upsert({
      where: { clubId },
      update: { token: INITIAL_TOKEN, expiresAt },
      create: { clubId, token: INITIAL_TOKEN, expiresAt },
    });
    return INITIAL_TOKEN;
  }

  return null;
}

async function refreshToken(
  currentToken: string,
  clubId: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`
    );

    if (!response.ok) {
      console.error("Failed to refresh Instagram token");
      return null;
    }

    const data = await response.json();
    const newToken = data.access_token;
    const expiresIn = data.expires_in || 5184000; // Default 60 days in seconds
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Store the new token
    await prisma.instagramToken.upsert({
      where: { clubId },
      update: { token: newToken, expiresAt },
      create: { clubId, token: newToken, expiresAt },
    });

    console.log(
      `Instagram token refreshed for ${clubId}, expires: ${expiresAt.toISOString()}`
    );
    return newToken;
  } catch (error) {
    console.error("Error refreshing Instagram token:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "6"), 12);
  const clubId = searchParams.get("clubId") || "rome-hibernia";

  // Return cached data if still valid
  if (cache && Date.now() - cache.cachedAt < CACHE_DURATION) {
    return NextResponse.json(cache.posts.slice(0, limit));
  }

  const token = await getToken(clubId);

  if (!token) {
    return NextResponse.json(
      { error: "Instagram not configured" },
      { status: 503 }
    );
  }

  try {
    const fields =
      "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=${fields}&limit=12&access_token=${token}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Instagram API error:", error);

      if (error.error?.code === 190) {
        // Token expired - try to refresh
        const refreshed = await refreshToken(token, clubId);
        if (refreshed) {
          // Retry with new token
          const retryResponse = await fetch(
            `https://graph.instagram.com/me/media?fields=${fields}&limit=12&access_token=${refreshed}`
          );
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            cache = { posts: retryData.data || [], cachedAt: Date.now() };
            return NextResponse.json(cache.posts.slice(0, limit));
          }
        }
        return NextResponse.json(
          { error: "Instagram token expired and refresh failed" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch Instagram posts" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const posts: InstagramPost[] = data.data || [];

    cache = {
      posts,
      cachedAt: Date.now(),
    };

    return NextResponse.json(posts.slice(0, limit));
  } catch (error) {
    console.error("Instagram fetch error:", error);

    if (cache) {
      return NextResponse.json(cache.posts.slice(0, limit));
    }

    return NextResponse.json(
      { error: "Failed to fetch Instagram posts" },
      { status: 500 }
    );
  }
}
