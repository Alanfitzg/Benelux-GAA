import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tokens = await prisma.instagramToken.findMany();
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
          console.error(
            `Instagram refresh failed for ${tokenRecord.clubId}:`,
            error
          );
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

        console.log(
          `Instagram token refreshed for ${tokenRecord.clubId}, expires ${newExpiresAt.toISOString()}`
        );
      } catch (error) {
        console.error(
          `Instagram refresh error for ${tokenRecord.clubId}:`,
          error
        );
        results.push({
          clubId: tokenRecord.clubId,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      tokensProcessed: tokens.length,
      results,
    });
  } catch (error) {
    console.error("Instagram cron error:", error);
    return NextResponse.json(
      { error: "Failed to run Instagram refresh cron" },
      { status: 500 }
    );
  }
}
