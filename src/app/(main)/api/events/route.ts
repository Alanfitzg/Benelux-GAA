import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geocodeLocation } from "@/lib/utils";
import { withErrorHandling, parseJsonBody } from "@/lib/utils";
import { requireClubAdmin, getServerSession } from "@/lib/auth-helpers";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getCityDefaultImage } from "@/lib/city-utils";
import { validateEventDates } from "@/lib/validation/date-validation";
import type { Prisma } from "@prisma/client";

type CreateEventBody = {
  title: string;
  eventType: string;
  location: string;
  latitude?: number;
  longitude?: number;
  startDate: string;
  endDate?: string;
  cost?: number;
  description?: string;
  isRecurring?: boolean;
  imageUrl?: string;
  clubId?: string;
  pitchLocationId?: string;
  pitchLocationIds?: string[]; // For multiple pitch associations
  // Tournament-specific fields
  minTeams?: number;
  maxTeams?: number;
  acceptedTeamTypes?: string[];
  visibility?: "PUBLIC" | "PRIVATE";
};

async function getEventsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Prisma.EventWhereInput = {};

    if (clubId) {
      where.clubId = clubId;
    }

    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            location: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);

    // Check if it's a database connection error
    if (
      error instanceof Error &&
      error.message.includes("Can't reach database server")
    ) {
      console.warn("Database connection failed, returning empty array");
      // Return empty array to allow the app to function
      return NextResponse.json([]);
    }

    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

async function createEventHandler(request: NextRequest) {
  console.log("=== Event Creation Request Started ===");
  const session = await getServerSession();
  console.log("Session found:", !!session?.user, "User ID:", session?.user?.id);

  if (!session?.user) {
    console.log("❌ Authentication failed - no session or user");
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return withErrorHandling(async () => {
    const body = await parseJsonBody<CreateEventBody>(request);
    console.log(
      "✅ Event creation body parsed:",
      JSON.stringify(body, null, 2)
    );

    // If creating a club event, require club admin privileges
    if (body.clubId) {
      const authResult = await requireClubAdmin();
      if (authResult instanceof NextResponse) {
        return authResult;
      }
    }

    // Validate dates (allow past dates for testing)
    const dateValidation = validateEventDates(
      body.startDate,
      body.endDate,
      true
    );
    if (!dateValidation.isValid) {
      return NextResponse.json(
        { error: dateValidation.error || "Invalid date selection" },
        { status: 400 }
      );
    }

    // Log warning if creating event with past date
    if (dateValidation.warning) {
      console.warn("Creating event with past date:", dateValidation.warning);
    }

    // Use provided coordinates or geocode if not provided
    let latitude = body.latitude;
    let longitude = body.longitude;

    if (!latitude || !longitude) {
      const geocoded = await geocodeLocation(body.location);
      latitude = geocoded.latitude || undefined;
      longitude = geocoded.longitude || undefined;
    }

    let imageUrl = body.imageUrl;
    if (!imageUrl) {
      const cityDefaultImage = await getCityDefaultImage(body.location);
      if (cityDefaultImage) {
        imageUrl = cityDefaultImage;
      }
    }

    const eventData = {
      title: body.title,
      eventType: body.eventType,
      location: body.location,
      latitude,
      longitude,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      cost: body.cost || null,
      description: body.description || null,
      isRecurring: body.isRecurring || false,
      imageUrl,
      clubId: body.clubId || null,
      pitchLocationId: body.pitchLocationId || null,
      // Tournament-specific fields
      minTeams: body.minTeams || null,
      maxTeams: body.maxTeams || null,
      acceptedTeamTypes: body.acceptedTeamTypes || [],
      visibility: body.visibility || "PUBLIC",
    };

    console.log("Event data for database:", JSON.stringify(eventData, null, 2));

    try {
      console.log("📝 Creating event in database...");
      const event = await prisma.event.create({
        data: eventData,
      });
      console.log(
        "✅ Event created successfully! ID:",
        event.id,
        "Title:",
        event.title
      );
      console.log("📤 Returning response with status 201");
      return NextResponse.json(event, { status: 201 });
    } catch (dbError) {
      console.error("❌ Database error creating event:", dbError);
      throw dbError;
    }
  });
}

// Apply rate limiting to endpoints
export const GET = withRateLimit(
  RATE_LIMITS.PUBLIC_API,
  (request: NextRequest) => getEventsHandler(request)
);
export const POST = withRateLimit(RATE_LIMITS.ADMIN, createEventHandler);
