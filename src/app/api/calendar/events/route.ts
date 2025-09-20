import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getCalendarPermissions } from "@/lib/calendar/permissions";
import { z } from "zod";
import { CalendarEventType, EventSource, FixtureType, CrestType } from "@prisma/client";

const createEventSchema = z.object({
  clubId: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  eventType: z.nativeEnum(CalendarEventType),
  eventSource: z.nativeEnum(EventSource).default(EventSource.CLUB),
  fixtureType: z.nativeEnum(FixtureType).optional(),
  crestType: z.nativeEnum(CrestType).default(CrestType.CLUB),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!clubId) {
      return NextResponse.json({ error: "Club ID is required" }, { status: 400 });
    }

    const permissions = await getCalendarPermissions(session?.user?.id || null, clubId);

    if (!permissions.canViewCalendar) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const where: { clubId: string; startDate?: { gte: Date; lte: Date } } = { clubId };

    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startDate: "asc" },
      include: {
        club: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    // Check for conflicts with competitive fixtures
    const eventsWithConflicts = await Promise.all(
      events.map(async (event) => {
        if (event.eventSource === EventSource.FIXTURE && event.fixtureType === FixtureType.COMPETITIVE) {
          return event;
        }

        // Check if there's a competitive fixture on the same date
        const conflict = await prisma.calendarEvent.findFirst({
          where: {
            clubId: event.clubId,
            startDate: event.startDate,
            eventSource: EventSource.FIXTURE,
            fixtureType: FixtureType.COMPETITIVE,
            id: { not: event.id },
          },
        });

        return {
          ...event,
          hasConflict: !!conflict,
        };
      })
    );

    return NextResponse.json(eventsWithConflicts);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
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
    const validatedData = createEventSchema.parse(body);

    const permissions = await getCalendarPermissions(session.user.id, validatedData.clubId);

    if (!permissions.canCreateEvents) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check for conflicts with competitive fixtures
    const existingFixture = await prisma.calendarEvent.findFirst({
      where: {
        clubId: validatedData.clubId,
        startDate: new Date(validatedData.startDate),
        eventSource: EventSource.FIXTURE,
        fixtureType: FixtureType.COMPETITIVE,
      },
    });

    let conflictWarning = null;
    if (existingFixture && validatedData.eventSource !== EventSource.FIXTURE) {
      conflictWarning = `Warning: There is a competitive fixture on this date (${existingFixture.title})`;

      // Notify superadmins about the conflict
      await createConflictNotification(validatedData.clubId, validatedData.startDate, session.user.id);
    }

    // Set crest type based on event type
    let crestType = validatedData.crestType;
    if (validatedData.eventSource === EventSource.FIXTURE && validatedData.fixtureType === FixtureType.COMPETITIVE) {
      crestType = CrestType.EUROPE_GAA;
    }

    const event = await prisma.calendarEvent.create({
      data: {
        ...validatedData,
        crestType,
        conflictWarning,
        createdBy: session.user.id,
      },
      include: {
        club: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating calendar event:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("id");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: { club: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const permissions = await getCalendarPermissions(session.user.id, event.clubId);

    // Check if user can edit this event
    const canEdit = permissions.canEditAllEvents ||
      (permissions.canCreateEvents && event.createdBy === session.user.id);

    if (!canEdit) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: body,
      include: {
        club: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return NextResponse.json(
      { error: "Failed to update calendar event" },
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
    const eventId = searchParams.get("id");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const permissions = await getCalendarPermissions(session.user.id, event.clubId);

    // Check if user can delete this event
    const canDelete = permissions.canEditAllEvents ||
      (permissions.canCreateEvents && event.createdBy === session.user.id);

    if (!canDelete) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar event" },
      { status: 500 }
    );
  }
}

async function createConflictNotification(clubId: string, date: string) {
  // This will be expanded to send actual notifications
  // For now, we'll log it
  console.log(`Conflict notification: Club ${clubId} created event on ${date} with existing fixture`);
}