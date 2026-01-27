import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where =
      status && status !== "ALL"
        ? { status: status as "PENDING" | "APPROVED" | "REJECTED" }
        : {};

    const events = await prisma.socialGAAEvent.findMany({
      where,
      include: {
        _count: {
          select: { registrations: true },
        },
        registrations: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const eventsWithStats = events.map((event) => ({
      ...event,
      confirmedTeams: event.registrations.filter(
        (r) => r.status === "CONFIRMED"
      ).length,
      waitingListTeams: event.registrations.filter(
        (r) => r.status === "WAITING_LIST"
      ).length,
      registrations: undefined,
    }));

    return NextResponse.json({ events: eventsWithStats });
  } catch (error) {
    console.error("Error fetching GGE events for admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
