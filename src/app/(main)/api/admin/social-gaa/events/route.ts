import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

const SOCIAL_TEAM_TYPES = ["G4MO", "DADS_AND_LADS", "SOCIAL"];

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: {
        acceptedTeamTypes: {
          hasSome: SOCIAL_TEAM_TYPES,
        },
      },
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        title: true,
        location: true,
        startDate: true,
        endDate: true,
        maxTeams: true,
        acceptedTeamTypes: true,
        visibility: true,
        approvalStatus: true,
        club: {
          select: {
            name: true,
            country: {
              select: { name: true },
            },
          },
        },
        _count: {
          select: {
            teams: true,
          },
        },
      },
    });

    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      location: event.location,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString() || event.startDate.toISOString(),
      maxTeams: event.maxTeams,
      acceptedTeamTypes: event.acceptedTeamTypes,
      status: event.approvalStatus,
      registrationCount: event._count.teams,
      club: event.club,
    }));

    const stats = {
      total: events.length,
      g4mo: events.filter((e) => e.acceptedTeamTypes.includes("G4MO")).length,
      dadsAndLads: events.filter((e) =>
        e.acceptedTeamTypes.includes("DADS_AND_LADS")
      ).length,
      social: events.filter((e) => e.acceptedTeamTypes.includes("SOCIAL"))
        .length,
      totalRegistrations: events.reduce((sum, e) => sum + e._count.teams, 0),
    };

    return NextResponse.json({ events: formattedEvents, stats });
  } catch (error) {
    console.error("Failed to fetch social GAA events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
