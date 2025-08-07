import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, address, city, latitude, longitude, clubId } = body;

    // Check if user is super admin or club admin for the specified club
    const isSuperAdmin = user.role === "SUPER_ADMIN";
    const isClubAdmin = user.adminOfClubs.some(club => club.id === clubId);

    if (!isSuperAdmin && !isClubAdmin) {
      return NextResponse.json(
        { error: "You must be a club admin to add pitch locations" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!name || !city || latitude === undefined || longitude === undefined || !clubId) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
        clubId,
        createdBy: session.user.id,
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