import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await context.params;
  const { status } = await request.json();

  if (!["UPCOMING", "ACTIVE", "CLOSED"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Must be UPCOMING, ACTIVE, or CLOSED" },
      { status: 400 }
    );
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: {
          include: {
            admins: true,
          },
        },
        report: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    const isAdmin = user?.role === "SUPER_ADMIN" || 
      event.club?.admins.some(admin => admin.id === user?.id);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (status === "CLOSED" && !event.report) {
      return NextResponse.json(
        { error: "Cannot close event without a report. Please create an event report first." },
        { status: 400 }
      );
    }

    if (status === "CLOSED" && event.report?.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Cannot close event with a draft report. Please publish the report first." },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { status: status as "UPCOMING" | "ACTIVE" | "CLOSED" },
    });

    return NextResponse.json({
      message: `Event status updated to ${status}`,
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event status:", error);
    return NextResponse.json(
      { error: "Failed to update event status" },
      { status: 500 }
    );
  }
}