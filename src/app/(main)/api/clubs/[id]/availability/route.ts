import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const availabilitySchema = z.object({
  date: z.string(),
  isRecurring: z.boolean().default(false),
  dayOfWeek: z.number().min(0).max(6).optional(),
  timeSlots: z.array(z.string()),
  capacity: z.number().min(1).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Prisma.AvailabilitySlotWhereInput = {
      clubId: id,
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const availabilitySlots = await prisma.availabilitySlot.findMany({
      where,
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(availabilitySlots);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { adminOfClubs: true },
    });

    const isClubAdmin = user?.adminOfClubs.some((club) => club.id === id);
    const isSuperAdmin = user?.role === "SUPER_ADMIN";

    if (!isClubAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden - must be club admin" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = availabilitySchema.parse(body);

    const availabilitySlot = await prisma.availabilitySlot.create({
      data: {
        clubId: id,
        date: new Date(validatedData.date),
        isRecurring: validatedData.isRecurring,
        dayOfWeek: validatedData.dayOfWeek,
        timeSlots: validatedData.timeSlots,
        capacity: validatedData.capacity,
      },
    });

    return NextResponse.json(availabilitySlot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating availability:", error);
    return NextResponse.json(
      { error: "Failed to create availability" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get("id");

    if (!slotId) {
      return NextResponse.json({ error: "Slot ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { adminOfClubs: true },
    });

    const isClubAdmin = user?.adminOfClubs.some((club) => club.id === id);
    const isSuperAdmin = user?.role === "SUPER_ADMIN";

    if (!isClubAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden - must be club admin" },
        { status: 403 }
      );
    }

    await prisma.availabilitySlot.delete({
      where: {
        id: slotId,
        clubId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json(
      { error: "Failed to delete availability" },
      { status: 500 }
    );
  }
}
