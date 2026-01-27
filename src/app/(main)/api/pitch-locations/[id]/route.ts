import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pitchLocation = await prisma.pitchLocation.findUnique({
      where: { id },
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
      },
    });

    if (!pitchLocation) {
      return NextResponse.json(
        { error: "Pitch location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pitchLocation);
  } catch (error) {
    console.error("Error fetching pitch location:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitch location" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const pitchLocation = await prisma.pitchLocation.findUnique({
      where: { id },
      include: {
        club: true,
      },
    });

    if (!pitchLocation) {
      return NextResponse.json(
        { error: "Pitch location not found" },
        { status: 404 }
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

    // Check if user has permission to edit
    const isSuperAdmin = user.role === "SUPER_ADMIN";
    const isClubAdmin = user.adminOfClubs.some(
      (club) => club.id === pitchLocation.clubId
    );

    if (!isSuperAdmin && !isClubAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to edit this pitch location" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      address,
      city,
      latitude,
      longitude,
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

    const updated = await prisma.pitchLocation.update({
      where: { id },
      data: {
        name,
        address,
        city,
        latitude,
        longitude,
        // Optional fields (only include if provided)
        ...(originalPurpose !== undefined && { originalPurpose }),
        ...(surfaceType !== undefined && { surfaceType }),
        ...(numberOfPitches !== undefined && {
          numberOfPitches: numberOfPitches
            ? parseInt(numberOfPitches.toString())
            : null,
        }),
        ...(hasFloodlights !== undefined && { hasFloodlights }),
        ...(floodlightHours !== undefined && { floodlightHours }),
        ...(changingRooms !== undefined && { changingRooms }),
        ...(spectatorFacilities !== undefined && { spectatorFacilities }),
        ...(parking !== undefined && { parking }),
        ...(otherAmenities !== undefined && { otherAmenities }),
        ...(seasonalAvailability !== undefined && { seasonalAvailability }),
        ...(bookingSystem !== undefined && { bookingSystem }),
        ...(bookingLeadTime !== undefined && { bookingLeadTime }),
        ...(maxPlayerCapacity !== undefined && {
          maxPlayerCapacity: maxPlayerCapacity
            ? parseInt(maxPlayerCapacity.toString())
            : null,
        }),
        ...(maxSpectatorCapacity !== undefined && {
          maxSpectatorCapacity: maxSpectatorCapacity
            ? parseInt(maxSpectatorCapacity.toString())
            : null,
        }),
        ...(ageGroupSuitability !== undefined && { ageGroupSuitability }),
        ...(tournamentCapacity !== undefined && {
          tournamentCapacity: tournamentCapacity
            ? parseInt(tournamentCapacity.toString())
            : null,
        }),
        ...(equipmentProvided !== undefined && { equipmentProvided }),
        ...(contactName !== undefined && { contactName }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(customDirections !== undefined && { customDirections }),
        ...(previousEvents !== undefined && { previousEvents }),
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating pitch location:", error);
    return NextResponse.json(
      { error: "Failed to update pitch location" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const pitchLocation = await prisma.pitchLocation.findUnique({
      where: { id },
      include: {
        events: true,
      },
    });

    if (!pitchLocation) {
      return NextResponse.json(
        { error: "Pitch location not found" },
        { status: 404 }
      );
    }

    // Check if pitch is being used by any events
    if (pitchLocation.events.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete pitch location that is being used by events" },
        { status: 400 }
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

    // Check if user has permission to delete
    const isSuperAdmin = user.role === "SUPER_ADMIN";
    const isClubAdmin = user.adminOfClubs.some(
      (club) => club.id === pitchLocation.clubId
    );

    if (!isSuperAdmin && !isClubAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to delete this pitch location" },
        { status: 403 }
      );
    }

    await prisma.pitchLocation.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Pitch location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pitch location:", error);
    return NextResponse.json(
      { error: "Failed to delete pitch location" },
      { status: 500 }
    );
  }
}
