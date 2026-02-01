import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clubId } = await request.json().catch(() => ({}));

  try {
    const tokens = clubId
      ? await prisma.instagramToken.findMany({ where: { clubId } })
      : await prisma.instagramToken.findMany();

    const results = [];

    for (const tokenRecord of tokens) {
      const daysUntilExpiry = Math.floor(
        (tokenRecord.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry > 10) {
        results.push({
          clubId: tokenRecord.clubId,
          status: "skipped",
          reason: `Token still valid for ${daysUntilExpiry} days`,
        });
        continue;
      }

      try {
        const response = await fetch(
          `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${tokenRecord.token}`
        );

        if (!response.ok) {
          const error = await response.text();
          results.push({
            clubId: tokenRecord.clubId,
            status: "error",
            error,
          });
          continue;
        }

        const data = await response.json();

        const newExpiresAt = new Date(Date.now() + data.expires_in * 1000);

        await prisma.instagramToken.update({
          where: { id: tokenRecord.id },
          data: {
            token: data.access_token,
            expiresAt: newExpiresAt,
          },
        });

        results.push({
          clubId: tokenRecord.clubId,
          status: "refreshed",
          expiresAt: newExpiresAt.toISOString(),
        });
      } catch (error) {
        results.push({
          clubId: tokenRecord.clubId,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error refreshing Instagram tokens:", error);
    return NextResponse.json(
      { error: "Failed to refresh tokens" },
      { status: 500 }
    );
  }
}
