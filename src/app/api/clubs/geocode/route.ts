import { prisma } from "@/lib/prisma";
import { geocodeLocation } from "@/lib/utils";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";
import { MESSAGES } from "@/lib/constants";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Specify Node.js runtime
export const runtime = "nodejs";

// GET - Geocode a single address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    const coords = await geocodeLocation(address);

    if (coords.latitude === null || coords.longitude === null) {
      return NextResponse.json(
        { error: "Could not geocode address" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  } catch (error) {
    console.error("Error geocoding address:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}

// POST - Bulk geocode all clubs
export async function POST() {
  try {
    // Test database connection first
    await prisma.$connect();

    // Get all clubs with locations
    const clubs = await prisma.club.findMany({
      select: {
        id: true,
        name: true,
        location: true,
      },
      where: {
        location: { not: null },
      },
    });

    console.log(`Found ${clubs.length} clubs to process`);

    // Update each club with coordinates
    const updates = clubs.map(
      async (club: { id: string; location: string | null; name: string }) => {
        if (!club.location) return null;

        const coords = await geocodeLocation(club.location);

        if (coords.latitude === null || coords.longitude === null) {
          console.log(`Could not geocode location for club: ${club.name}`);
          return null;
        }

        try {
          return await prisma.club.update({
            where: { id: club.id },
            data: {
              latitude: coords.latitude as number | null,
              longitude: coords.longitude as number | null,
            },
          });
        } catch (updateError) {
          console.error(`Error updating club ${club.name}:`, updateError);
          return null;
        }
      }
    );

    const results = await Promise.all(updates.filter(Boolean));

    // Invalidate club caches after bulk geocoding update
    console.log("Bulk geocoding completed, invalidating club caches");
    revalidateTag("clubs");

    await prisma.$disconnect();

    return createSuccessResponse(
      {
        total: clubs.length,
        updated: results.length,
      },
      MESSAGES.SUCCESS.CLUBS_UPDATED
    );
  } catch (error) {
    console.error("Error updating club coordinates:", error);

    // Ensure we disconnect from the database
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }

    return createErrorResponse(
      MESSAGES.ERROR.CLUBS_UPDATE_FAILED,
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
