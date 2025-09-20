import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getCalendarPermissions } from "@/lib/calendar/permissions";
import { z } from "zod";

const blockWeekendSchema = z.object({
  clubId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");

    if (!clubId) {
      return NextResponse.json({ error: "Club ID is required" }, { status: 400 });
    }

    const blockedWeekends = await prisma.blockedWeekend.findMany({
      where: { clubId },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json(blockedWeekends);
  } catch (error) {
    console.error("Error fetching blocked weekends:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocked weekends" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = blockWeekendSchema.parse(body);

    const permissions = await getCalendarPermissions(session.user.id, validatedData.clubId);

    if (!permissions.canBlockWeekends) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check for overlapping blocked weekends
    const overlap = await prisma.blockedWeekend.findFirst({
      where: {
        clubId: validatedData.clubId,
        OR: [
          {
            startDate: {
              lte: new Date(validatedData.endDate),
            },
            endDate: {
              gte: new Date(validatedData.startDate),
            },
          },
        ],
      },
    });

    if (overlap) {
      return NextResponse.json(
        { error: "This period overlaps with an existing blocked weekend" },
        { status: 400 }
      );
    }

    const blockedWeekend = await prisma.blockedWeekend.create({
      data: {
        clubId: validatedData.clubId,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        reason: validatedData.reason,
        blockedBy: session.user.id,
      },
    });

    return NextResponse.json(blockedWeekend, { status: 201 });
  } catch (error) {
    console.error("Error creating blocked weekend:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create blocked weekend" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const blockedWeekend = await prisma.blockedWeekend.findUnique({
      where: { id },
    });

    if (!blockedWeekend) {
      return NextResponse.json({ error: "Blocked weekend not found" }, { status: 404 });
    }

    const permissions = await getCalendarPermissions(session.user.id, blockedWeekend.clubId);

    if (!permissions.canBlockWeekends) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.blockedWeekend.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blocked weekend:", error);
    return NextResponse.json(
      { error: "Failed to delete blocked weekend" },
      { status: 500 }
    );
  }
}