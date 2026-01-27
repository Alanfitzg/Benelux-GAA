import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        clubId: true,
        adminOfClubs: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const clubIds = [
      ...(user.clubId ? [user.clubId] : []),
      ...user.adminOfClubs.map((c) => c.id),
    ];

    if (clubIds.length === 0) {
      return NextResponse.json({ trips: [] });
    }

    const uniqueClubIds = [...new Set(clubIds)];

    const completedTrips = await prisma.tournamentTeam.findMany({
      where: {
        clubId: { in: uniqueClubIds },
        event: {
          OR: [
            { endDate: { lt: new Date() } },
            {
              AND: [{ endDate: null }, { startDate: { lt: new Date() } }],
            },
          ],
        },
      },
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
            report: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
        club: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { event: { startDate: "desc" } },
    });

    const eventMap = new Map<
      string,
      {
        id: string;
        title: string;
        eventType: string;
        location: string;
        startDate: Date;
        endDate: Date | null;
        imageUrl: string | null;
        hostClub: {
          id: string;
          name: string;
          imageUrl: string | null;
          location: string | null;
        } | null;
        hasReport: boolean;
        participatingTeams: {
          teamName: string;
          clubName: string;
          clubImageUrl: string | null;
        }[];
      }
    >();

    for (const team of completedTrips) {
      const existing = eventMap.get(team.event.id);
      if (existing) {
        existing.participatingTeams.push({
          teamName: team.teamName,
          clubName: team.club.name,
          clubImageUrl: team.club.imageUrl,
        });
      } else {
        eventMap.set(team.event.id, {
          id: team.event.id,
          title: team.event.title,
          eventType: team.event.eventType,
          location: team.event.location,
          startDate: team.event.startDate,
          endDate: team.event.endDate,
          imageUrl: team.event.imageUrl,
          hostClub: team.event.club,
          hasReport: !!team.event.report,
          participatingTeams: [
            {
              teamName: team.teamName,
              clubName: team.club.name,
              clubImageUrl: team.club.imageUrl,
            },
          ],
        });
      }
    }

    const trips = Array.from(eventMap.values());

    return NextResponse.json({ trips });
  } catch (error) {
    console.error("Error fetching completed trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch completed trips" },
      { status: 500 }
    );
  }
}
