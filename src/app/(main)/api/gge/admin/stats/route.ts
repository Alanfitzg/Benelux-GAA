import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [pendingEvents, approvedEvents, confirmedTeams, waitingListTeams] =
      await Promise.all([
        prisma.socialGAAEvent.count({ where: { status: "PENDING" } }),
        prisma.socialGAAEvent.count({ where: { status: "APPROVED" } }),
        prisma.socialGAARegistration.count({ where: { status: "CONFIRMED" } }),
        prisma.socialGAARegistration.count({
          where: { status: "WAITING_LIST" },
        }),
      ]);

    return NextResponse.json({
      pendingEvents,
      approvedEvents,
      confirmedTeams,
      waitingListTeams,
    });
  } catch (error) {
    console.error("Error fetching GGE stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
