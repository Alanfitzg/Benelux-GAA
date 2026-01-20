import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      clubName,
      country, // This is actually county now
      contactName,
      contactEmail,
      contactPhone,
      eventTypes,
      estimatedPlayers,
      previousParticipation,
      additionalNotes,
    } = body;

    // Validate required fields
    if (!clubName || !country || !contactName || !contactEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!eventTypes || eventTypes.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one event type" },
        { status: 400 }
      );
    }

    // Check for existing registration with same email
    const existing = await prisma.socialGAAInterest.findFirst({
      where: { contactEmail: contactEmail.toLowerCase() },
    });

    if (existing) {
      // Update existing registration instead of creating duplicate
      const updated = await prisma.socialGAAInterest.update({
        where: { id: existing.id },
        data: {
          clubName,
          county: country,
          contactName,
          contactPhone: contactPhone || null,
          eventTypes: eventTypes.join(","),
          estimatedPlayers: estimatedPlayers || null,
          previousParticipation: previousParticipation || null,
          additionalNotes: additionalNotes || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Interest registration updated",
        id: updated.id,
      });
    }

    // Create new interest registration
    const interest = await prisma.socialGAAInterest.create({
      data: {
        clubName,
        county: country,
        contactName,
        contactEmail: contactEmail.toLowerCase(),
        contactPhone: contactPhone || null,
        eventTypes: eventTypes.join(","),
        estimatedPlayers: estimatedPlayers || null,
        previousParticipation: previousParticipation || null,
        additionalNotes: additionalNotes || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Interest registered successfully",
      id: interest.id,
    });
  } catch (error) {
    console.error("Error registering interest:", error);
    return NextResponse.json(
      { error: "Failed to register interest" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const interests = await prisma.socialGAAInterest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ interests });
  } catch (error) {
    console.error("Error fetching interests:", error);
    return NextResponse.json(
      { error: "Failed to fetch interests" },
      { status: 500 }
    );
  }
}
