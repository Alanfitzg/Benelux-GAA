import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const YOUTH_TEAM_TYPES = [
  "UNDER_8",
  "UNDER_10",
  "UNDER_12",
  "UNDER_14",
  "UNDER_16",
  "UNDER_18",
  "MINOR",
  "YOUTH",
];

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Get all youth events (events that accept youth team types)
    const youthEvents = await prisma.event.findMany({
      where: {
        acceptedTeamTypes: {
          hasSome: YOUTH_TEAM_TYPES,
        },
      },
      include: {
        club: {
          select: {
            name: true,
            subRegion: true,
            location: true,
            country: { select: { name: true } },
          },
        },
        teams: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                subRegion: true,
                location: true,
              },
            },
          },
        },
        _count: {
          select: { teams: true },
        },
      },
      orderBy: { startDate: "desc" },
    });

    // Get all Ireland clubs for county analysis
    const irelandClubs = await prisma.club.findMany({
      where: {
        internationalUnit: {
          name: "Ireland",
        },
      },
      select: {
        id: true,
        name: true,
        subRegion: true,
        location: true,
        teamTypes: true,
        tournamentTeams: {
          where: {
            event: {
              acceptedTeamTypes: { hasSome: YOUTH_TEAM_TYPES },
            },
          },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                acceptedTeamTypes: true,
              },
            },
          },
        },
      },
    });

    // Get youth interests (event interests for youth events)
    const youthInterests = await prisma.interest.findMany({
      where: {
        event: {
          acceptedTeamTypes: { hasSome: YOUTH_TEAM_TYPES },
        },
      },
      include: {
        applicantClub: {
          select: {
            id: true,
            name: true,
            subRegion: true,
          },
        },
        event: {
          select: {
            title: true,
            acceptedTeamTypes: true,
          },
        },
      },
    });

    // Summary stats
    const totalYouthEvents = youthEvents.length;
    const upcomingYouthEvents = youthEvents.filter(
      (e) => new Date(e.startDate) > now
    ).length;
    const pastYouthEvents = totalYouthEvents - upcomingYouthEvents;
    const totalYouthRegistrations = youthEvents.reduce(
      (sum, e) => sum + e._count.teams,
      0
    );
    const totalYouthInterests = youthInterests.length;

    // Demographics: Age group breakdown
    const ageGroupCounts: Record<
      string,
      { events: number; registrations: number }
    > = {};
    YOUTH_TEAM_TYPES.forEach((type) => {
      ageGroupCounts[type] = { events: 0, registrations: 0 };
    });

    youthEvents.forEach((event) => {
      event.acceptedTeamTypes.forEach((type) => {
        if (YOUTH_TEAM_TYPES.includes(type)) {
          ageGroupCounts[type].events++;
        }
      });
      event.teams.forEach((team) => {
        if (YOUTH_TEAM_TYPES.includes(team.teamType)) {
          ageGroupCounts[team.teamType].registrations++;
        }
      });
    });

    const ageGroupBreakdown = Object.entries(ageGroupCounts)
      .filter(([, data]) => data.events > 0 || data.registrations > 0)
      .map(([ageGroup, data]) => ({
        ageGroup: formatAgeGroup(ageGroup),
        ageGroupKey: ageGroup,
        events: data.events,
        registrations: data.registrations,
      }))
      .sort((a, b) => b.registrations - a.registrations);

    // County Analysis: Which counties travel the most (youth)
    const countyTrips: Record<string, number> = {};
    const countyActive: Record<string, Set<string>> = {};
    const countyInterests: Record<string, number> = {};

    // Count trips by county
    irelandClubs.forEach((club) => {
      const county = club.subRegion || "Unknown";
      const youthTrips = club.tournamentTeams.filter((t) =>
        YOUTH_TEAM_TYPES.some((type) =>
          t.event.acceptedTeamTypes.includes(type)
        )
      );
      countyTrips[county] = (countyTrips[county] || 0) + youthTrips.length;

      // Track active clubs per county
      if (youthTrips.length > 0) {
        if (!countyActive[county]) countyActive[county] = new Set();
        countyActive[county].add(club.id);
      }
    });

    // Count interests by county
    youthInterests.forEach((interest) => {
      const county = interest.applicantClub?.subRegion || "Unknown";
      countyInterests[county] = (countyInterests[county] || 0) + 1;
    });

    // Build county analysis arrays
    const countyTripAnalysis = Object.entries(countyTrips)
      .filter(([, count]) => count > 0)
      .map(([county, trips]) => ({ county, trips }))
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 20);

    const countyActiveAnalysis = Object.entries(countyActive)
      .map(([county, clubs]) => ({ county, activeClubs: clubs.size }))
      .sort((a, b) => b.activeClubs - a.activeClubs)
      .slice(0, 20);

    const countyInterestAnalysis = Object.entries(countyInterests)
      .filter(([, count]) => count > 0)
      .map(([county, interests]) => ({ county, interests }))
      .sort((a, b) => b.interests - a.interests)
      .slice(0, 20);

    // Combined county ranking (weighted score)
    const allCounties = new Set([
      ...Object.keys(countyTrips),
      ...Object.keys(countyActive),
      ...Object.keys(countyInterests),
    ]);

    const countyRanking = Array.from(allCounties)
      .map((county) => ({
        county,
        trips: countyTrips[county] || 0,
        activeClubs: countyActive[county]?.size || 0,
        interests: countyInterests[county] || 0,
        score:
          (countyTrips[county] || 0) * 3 +
          (countyActive[county]?.size || 0) * 2 +
          (countyInterests[county] || 0),
      }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    // Top clubs with youth activity
    const topYouthClubs = irelandClubs
      .filter((c) => c.tournamentTeams.length > 0)
      .map((c) => {
        const youthTrips = c.tournamentTeams.filter((t) =>
          YOUTH_TEAM_TYPES.some((type) =>
            t.event.acceptedTeamTypes.includes(type)
          )
        );
        return {
          name: c.name,
          county: c.subRegion || "-",
          location: c.location || "-",
          youthTrips: youthTrips.length,
          lastEvent:
            youthTrips.length > 0
              ? youthTrips.sort(
                  (a, b) =>
                    new Date(b.event.startDate).getTime() -
                    new Date(a.event.startDate).getTime()
                )[0].event.title
              : "-",
        };
      })
      .filter((c) => c.youthTrips > 0)
      .sort((a, b) => b.youthTrips - a.youthTrips)
      .slice(0, 15);

    // Recent youth events
    const recentYouthEvents = youthEvents.slice(0, 10).map((e) => ({
      id: e.id,
      title: e.title,
      location: e.location,
      startDate: e.startDate.toISOString(),
      hostClub: e.club?.name || "Independent",
      registrations: e._count.teams,
      teamTypes: e.acceptedTeamTypes
        .filter((t) => YOUTH_TEAM_TYPES.includes(t))
        .map(formatAgeGroup),
    }));

    // Monthly trend for youth events
    const monthlyTrend: Record<
      string,
      { events: number; registrations: number }
    > = {};
    youthEvents.forEach((event) => {
      const month = new Date(event.startDate).toLocaleDateString("en-IE", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyTrend[month]) {
        monthlyTrend[month] = { events: 0, registrations: 0 };
      }
      monthlyTrend[month].events++;
      monthlyTrend[month].registrations += event._count.teams;
    });

    const monthlyTrendArray = Object.entries(monthlyTrend)
      .map(([month, data]) => ({
        month,
        events: data.events,
        registrations: data.registrations,
      }))
      .slice(0, 12);

    return NextResponse.json({
      summary: {
        totalYouthEvents,
        upcomingYouthEvents,
        pastYouthEvents,
        totalYouthRegistrations,
        totalYouthInterests,
        activeCounties: countyRanking.length,
      },
      demographics: {
        ageGroupBreakdown,
      },
      countyAnalysis: {
        ranking: countyRanking,
        byTrips: countyTripAnalysis,
        byActiveClubs: countyActiveAnalysis,
        byInterests: countyInterestAnalysis,
      },
      topYouthClubs,
      recentYouthEvents,
      monthlyTrend: monthlyTrendArray,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating youth GAA report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

function formatAgeGroup(type: string): string {
  const labels: Record<string, string> = {
    UNDER_8: "Under 8",
    UNDER_10: "Under 10",
    UNDER_12: "Under 12",
    UNDER_14: "Under 14",
    UNDER_16: "Under 16",
    UNDER_18: "Under 18",
    MINOR: "Minor",
    YOUTH: "Youth",
  };
  return labels[type] || type;
}
