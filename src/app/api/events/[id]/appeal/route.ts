import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;
    const body = await request.json();
    const { appealReason } = body;

    if (!appealReason || appealReason.trim().length === 0) {
      return NextResponse.json(
        { error: "Appeal reason is required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: {
          include: {
            admins: { select: { id: true } },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.approvalStatus !== "REJECTED") {
      return NextResponse.json(
        { error: "Only rejected events can be appealed" },
        { status: 400 }
      );
    }

    if (event.appealStatus) {
      return NextResponse.json(
        { error: "This event has already been appealed" },
        { status: 400 }
      );
    }

    const isClubAdmin = event.club?.admins.some(
      (admin) => admin.id === session.user.id
    );
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isClubAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to appeal this event" },
        { status: 403 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        rejectionAppeal: appealReason.trim(),
        appealStatus: "PENDING",
        appealedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error submitting appeal:", error);
    return NextResponse.json(
      { error: "An error occurred submitting the appeal" },
      { status: 500 }
    );
  }
}
