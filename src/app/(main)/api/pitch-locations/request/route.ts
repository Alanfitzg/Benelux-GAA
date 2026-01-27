import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PitchRequestStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clubId, pitchName, address, city, message } = body;

    // Validate required fields
    if (!clubId || !pitchName || !city) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        admins: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Create the pitch request
    const pitchRequest = await prisma.pitchRequest.create({
      data: {
        userId: session.user.id,
        clubId,
        pitchName,
        address,
        city,
        message,
      },
    });

    // TODO: Send notification to club admins
    // This could be implemented with email notifications or in-app notifications
    // For now, we'll just log it
    console.log(
      `New pitch request from user ${session.user.id} for club ${clubId}:`,
      {
        pitchName,
        city,
        clubAdmins: club.admins,
      }
    );

    return NextResponse.json(pitchRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating pitch request:", error);
    return NextResponse.json(
      { error: "Failed to create pitch request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const where: { clubId?: { in: string[] }; status?: PitchRequestStatus } =
      {};

    // If user is not super admin, only show requests for their clubs
    if (user.role !== "SUPER_ADMIN") {
      const clubIds = user.adminOfClubs.map((club) => club.id);
      where.clubId = { in: clubIds };
    }

    if (status) {
      where.status = status as PitchRequestStatus;
    }

    const pitchRequests = await prisma.pitchRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pitchRequests);
  } catch (error) {
    console.error("Error fetching pitch requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitch requests" },
      { status: 500 }
    );
  }
}
