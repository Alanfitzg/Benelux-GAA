import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");

    const where: {
      eventId?: string;
      status?: "CONFIRMED" | "WAITING_LIST" | "CANCELLED";
    } = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (status && status !== "ALL") {
      where.status = status as "CONFIRMED" | "WAITING_LIST" | "CANCELLED";
    }

    const registrations = await prisma.socialGAARegistration.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            clubName: true,
            eventType: true,
            location: true,
            proposedDate: true,
            venueName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error("Error fetching GGE registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
