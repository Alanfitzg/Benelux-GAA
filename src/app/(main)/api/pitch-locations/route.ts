import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateCompletePitchData } from "@/lib/validation/pitch-validation";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");
    const clubId = searchParams.get("clubId");

    const where: Record<string, string> = {};
    if (city) where.city = city;
    if (clubId) where.clubId = clubId;

    const pitchLocations = await prisma.pitchLocation.findMany({
      where,
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        events: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(pitchLocations);
  } catch (error) {
    console.error("Error fetching pitch locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitch locations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        adminOfClubs: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      address,
      city,
      latitude,
      longitude,
      clubId,
      // Optional fields
      originalPurpose,
      surfaceType,
      numberOfPitches,
      hasFloodlights,
      floodlightHours,
      changingRooms,
      spectatorFacilities,
      parking,
      otherAmenities,
      seasonalAvailability,
      bookingSystem,
      bookingLeadTime,
      maxPlayerCapacity,
      maxSpectatorCapacity,
      ageGroupSuitability,
      tournamentCapacity,
      equipmentProvided,
      contactName,
      contactPhone,
      contactEmail,
      customDirections,
      previousEvents,
    } = body;

    // Check if user is super admin or club admin for the specified club (if clubId provided)
    const isSuperAdmin = user.role === "SUPER_ADMIN";
    const isClubAdmin = clubId
      ? user.adminOfClubs.some((club) => club.id === clubId)
      : false;

    // If clubId is provided, user must be admin of that club or super admin
    if (clubId && !isSuperAdmin && !isClubAdmin) {
      return NextResponse.json(
        {
          error:
            "You must be a club admin to add pitch locations for that club",
        },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!name || !city || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, city, latitude, longitude" },
        { status: 400 }
      );
    }

    // If no clubId provided, create a "general" pitch location (associated with user's first admin club if available)
    let finalClubId = clubId;
    if (!finalClubId && user.adminOfClubs.length > 0) {
      finalClubId = user.adminOfClubs[0].id; // Use first admin club
    }

    // Super admins can create pitch locations without club association by using a default system club
    if (!finalClubId && !isSuperAdmin) {
      return NextResponse.json(
        {
          error:
            "You must be a club admin or provide a club ID to create pitch locations",
        },
        { status: 403 }
      );
    }

    // Validate all pitch data
    const validation = validateCompletePitchData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const pitchLocation = await prisma.pitchLocation.create({
      data: {
        name,
        address,
        city,
        latitude,
        longitude,
        clubId: finalClubId,
        createdBy: session.user.id,
        // Optional fields (only include if provided)
        ...(originalPurpose && { originalPurpose }),
        ...(surfaceType && { surfaceType }),
        ...(numberOfPitches && {
          numberOfPitches: parseInt(numberOfPitches.toString()),
        }),
        hasFloodlights: hasFloodlights || false,
        ...(floodlightHours && { floodlightHours }),
        ...(changingRooms && { changingRooms }),
        ...(spectatorFacilities && { spectatorFacilities }),
        ...(parking && { parking }),
        ...(otherAmenities && { otherAmenities }),
        ...(seasonalAvailability && { seasonalAvailability }),
        ...(bookingSystem && { bookingSystem }),
        ...(bookingLeadTime && { bookingLeadTime }),
        ...(maxPlayerCapacity && {
          maxPlayerCapacity: parseInt(maxPlayerCapacity.toString()),
        }),
        ...(maxSpectatorCapacity && {
          maxSpectatorCapacity: parseInt(maxSpectatorCapacity.toString()),
        }),
        ...(ageGroupSuitability && { ageGroupSuitability }),
        ...(tournamentCapacity && {
          tournamentCapacity: parseInt(tournamentCapacity.toString()),
        }),
        ...(equipmentProvided && { equipmentProvided }),
        ...(contactName && { contactName }),
        ...(contactPhone && { contactPhone }),
        ...(contactEmail && { contactEmail }),
        ...(customDirections && { customDirections }),
        ...(previousEvents && { previousEvents }),
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(pitchLocation, { status: 201 });
  } catch (error) {
    console.error("Error creating pitch location:", error);
    return NextResponse.json(
      { error: "Failed to create pitch location" },
      { status: 500 }
    );
  }
}
