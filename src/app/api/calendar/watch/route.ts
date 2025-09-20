import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const watchSchema = z.object({
  clubId: z.string(),
  date: z.string().datetime(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");

    if (!clubId) {
      return NextResponse.json({ error: "Club ID is required" }, { status: 400 });
    }

    const watches = await prisma.calendarWatch.findMany({
      where: {
        clubId,
        userId: session.user.id,
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(watches);
  } catch (error) {
    console.error("Error fetching calendar watches:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar watches" },
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
    const validatedData = watchSchema.parse(body);

    // Check if already watching
    const existing = await prisma.calendarWatch.findUnique({
      where: {
        clubId_date_userId: {
          clubId: validatedData.clubId,
          date: new Date(validatedData.date),
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already watching this date" },
        { status: 400 }
      );
    }

    const watch = await prisma.calendarWatch.create({
      data: {
        clubId: validatedData.clubId,
        date: new Date(validatedData.date),
        userId: session.user.id,
        addedToMailingList: true,
      },
    });

    return NextResponse.json(watch, { status: 201 });
  } catch (error) {
    console.error("Error creating calendar watch:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create calendar watch" },
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

    const watch = await prisma.calendarWatch.findUnique({
      where: { id },
    });

    if (!watch) {
      return NextResponse.json({ error: "Watch not found" }, { status: 404 });
    }

    if (watch.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.calendarWatch.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting calendar watch:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar watch" },
      { status: 500 }
    );
  }
}