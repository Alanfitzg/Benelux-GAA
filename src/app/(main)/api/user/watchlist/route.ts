import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const watchedEvents = await prisma.eventWatchlist.findMany({
      where: { userId: session.user.id },
      include: {
        event: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: { event: { startDate: "asc" } },
    });

    const events = watchedEvents.map((w) => ({
      id: w.event.id,
      title: w.event.title,
      eventType: w.event.eventType,
      location: w.event.location,
      startDate: w.event.startDate,
      endDate: w.event.endDate,
      imageUrl: w.event.imageUrl,
      status: w.event.status,
      club: w.event.club,
      watchedAt: w.createdAt,
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
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
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const existingWatch = await prisma.eventWatchlist.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    });

    if (existingWatch) {
      return NextResponse.json(
        { error: "Event already in watchlist" },
        { status: 409 }
      );
    }

    const watchlistEntry = await prisma.eventWatchlist.create({
      data: {
        userId: session.user.id,
        eventId,
      },
    });

    return NextResponse.json({
      success: true,
      watchlistEntry,
      message: "Event added to watchlist",
    });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return NextResponse.json(
      { error: "Failed to add to watchlist" },
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
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    await prisma.eventWatchlist.deleteMany({
      where: {
        userId: session.user.id,
        eventId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event removed from watchlist",
    });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from watchlist" },
      { status: 500 }
    );
  }
}
