import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import type { ClubStats } from "@/types";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const club = await prisma.club.findUnique({
      where: { id },
      select: {
        id: true,
        foundedYear: true,
        createdAt: true,
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Calculate years active
    const currentYear = new Date().getFullYear();
    let yearsActive: number;

    if (club.foundedYear) {
      yearsActive = currentYear - club.foundedYear;
    } else {
      // Fall back to createdAt if foundedYear not set
      yearsActive = currentYear - new Date(club.createdAt).getFullYear();
    }

    // Count events hosted
    const eventsHosted = await prisma.event.count({
      where: { clubId: id },
    });

    // Count unique clubs that have visited (from tournament registrations)
    const uniqueVisitors = await prisma.tournamentTeam.findMany({
      where: {
        event: {
          clubId: id,
        },
        clubId: {
          not: id,
        },
      },
      select: {
        clubId: true,
      },
      distinct: ["clubId"],
    });

    const teamsWelcomed = uniqueVisitors.length;

    const stats: ClubStats = {
      yearsActive: Math.max(yearsActive, 1),
      eventsHosted,
      teamsWelcomed,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching club stats:", error);
    return NextResponse.json(
      { error: "Error fetching stats" },
      { status: 500 }
    );
  }
}
