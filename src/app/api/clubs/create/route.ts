import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

async function createClubHandler(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      country,
      cityOrRegion,
      website,
      primaryContactName,
      primaryContactEmail,
      notesForAdmin,
    } = body;

    // Validate required fields
    if (!name || !country || !primaryContactName || !primaryContactEmail) {
      return NextResponse.json(
        {
          error:
            "Club name, country, primary contact name, and primary contact email are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(primaryContactEmail)) {
      return NextResponse.json(
        {
          error: "Please provide a valid email address",
        },
        { status: 400 }
      );
    }

    // Check for duplicate clubs (by name and country)
    const existingClub = await prisma.club.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        location: { equals: country, mode: "insensitive" },
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existingClub) {
      return NextResponse.json(
        {
          error:
            "A club with this name and country already exists or is pending approval",
        },
        { status: 409 }
      );
    }

    // Create the club with status=PENDING and internationalUnitId=null
    const club = await prisma.club.create({
      data: {
        name,
        location: country,
        region: cityOrRegion || undefined,
        website: website || undefined,
        primaryContactName,
        primaryContactEmail,
        notesForAdmin: notesForAdmin || undefined,
        status: "PENDING",
        internationalUnitId: null, // Critical: Users cannot set this
        submittedBy: session.user.id,
        dataSource: "USER_SUBMITTED",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Club submission received. It will be reviewed by our admin team.",
      clubId: club.id,
    });
  } catch (error) {
    console.error("Error creating club:", error);
    return NextResponse.json(
      {
        error: "Failed to submit club. Please try again.",
      },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(RATE_LIMITS.FORMS, createClubHandler);
