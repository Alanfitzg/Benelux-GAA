import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: clubId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin of this club or super admin
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        admins: {
          where: { id: session.user.id },
          select: { id: true },
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const isClubAdmin = club.admins.length > 0;
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isClubAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { dayPassPrice, dayPassCurrency } = body;

    // Validate price
    if (typeof dayPassPrice !== "number" || dayPassPrice <= 0) {
      return NextResponse.json(
        { error: "Day-Pass price must be a positive number" },
        { status: 400 }
      );
    }

    if (dayPassPrice > 200) {
      return NextResponse.json(
        { error: "Day-Pass price cannot exceed €200" },
        { status: 400 }
      );
    }

    // Update club with new Day-Pass settings
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        dayPassPrice,
        dayPassCurrency: dayPassCurrency || "EUR",
      },
      select: {
        id: true,
        name: true,
        dayPassPrice: true,
        dayPassCurrency: true,
      },
    });

    return NextResponse.json({
      success: true,
      club: updatedClub,
    });
  } catch (error) {
    console.error("Error updating Day-Pass configuration:", error);
    return NextResponse.json(
      { error: "Failed to update Day-Pass configuration" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params;

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        name: true,
        dayPassPrice: true,
        dayPassCurrency: true,
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    return NextResponse.json(club);
  } catch (error) {
    console.error("Error fetching Day-Pass configuration:", error);
    return NextResponse.json(
      { error: "Failed to fetch Day-Pass configuration" },
      { status: 500 }
    );
  }
}
