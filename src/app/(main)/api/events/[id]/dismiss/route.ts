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
        { error: "Only rejected events can be dismissed" },
        { status: 400 }
      );
    }

    const isClubAdmin = event.club?.admins.some(
      (admin) => admin.id === session.user.id
    );
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isClubAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to dismiss this rejection" },
        { status: 403 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        dismissedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error dismissing rejection:", error);
    return NextResponse.json(
      { error: "An error occurred dismissing the rejection" },
      { status: 500 }
    );
  }
}
