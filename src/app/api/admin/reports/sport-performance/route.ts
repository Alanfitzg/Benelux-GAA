import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all clubs with their sports
    const clubs = await prisma.club.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        sportsSupported: true,
        teamTypes: true,
      },
    });

    // Get all events with their accepted team types
    const events = await prisma.event.findMany({
      where: { approvalStatus: "APPROVED" },
      select: {
        id: true,
        acceptedTeamTypes: true,
        status: true,
        startDate: true,
        teams: {
          select: {
            id: true,
          },
        },
        interests: {
          select: {
            id: true,
          },
        },
      },
    });

    // Get tournament interests with club info to derive sport
    const tournamentInterests = await prisma.tournamentInterest.findMany({
      select: {
        id: true,
        createdAt: true,
        club: {
          select: {
            sportsSupported: true,
            teamTypes: true,
          },
        },
      },
    });

    // Normalize sport names (handle variations like "Mens Football", "Men's Football", "Football")
    const normalizeSport = (sport: string): string => {
      const s = sport.trim();
      // Map common variations to standard names
      if (s.toLowerCase().includes("hurling")) return "Hurling";
      if (s.toLowerCase().includes("camogie")) return "Camogie";
      if (
        s.toLowerCase().includes("lgfa") ||
        s.toLowerCase().includes("ladies football")
      )
        return "LGFA";
      if (
        s.toLowerCase().includes("football") &&
        !s.toLowerCase().includes("ladies")
      )
        return "Football";
      if (s.toLowerCase().includes("handball")) return "Handball";
      if (s.toLowerCase().includes("rounders")) return "Rounders";
      if (
        s.toLowerCase().includes("g4mo") ||
        s.toLowerCase().includes("gaelic4mothers")
      )
        return "G4MO";
      return s;
    };

    // Aggregate sport data
    const sportStats: Record<
      string,
      {
        clubCount: number;
        eventCount: number;
        upcomingEvents: number;
        completedEvents: number;
        teamRegistrations: number;
        interestSubmissions: number;
        tournamentInterests: number;
      }
    > = {};

    // Count clubs per sport
    clubs.forEach((club) => {
      const sports = [
        ...(club.sportsSupported || []),
        ...(club.teamTypes || []),
      ];
      const uniqueSports = [...new Set(sports.map(normalizeSport))];
      uniqueSports.forEach((sport) => {
        if (!sport) return;
        if (!sportStats[sport]) {
          sportStats[sport] = {
            clubCount: 0,
            eventCount: 0,
            upcomingEvents: 0,
            completedEvents: 0,
            teamRegistrations: 0,
            interestSubmissions: 0,
            tournamentInterests: 0,
          };
        }
        sportStats[sport].clubCount++;
      });
    });

    // Count events per sport
    const now = new Date();
    events.forEach((event) => {
      const sports = (event.acceptedTeamTypes || []).map(normalizeSport);
      const uniqueSports = [...new Set(sports)];
      uniqueSports.forEach((sport) => {
        if (!sport) return;
        if (!sportStats[sport]) {
          sportStats[sport] = {
            clubCount: 0,
            eventCount: 0,
            upcomingEvents: 0,
            completedEvents: 0,
            teamRegistrations: 0,
            interestSubmissions: 0,
            tournamentInterests: 0,
          };
        }
        sportStats[sport].eventCount++;
        if (new Date(event.startDate) > now) {
          sportStats[sport].upcomingEvents++;
        } else {
          sportStats[sport].completedEvents++;
        }
        sportStats[sport].teamRegistrations += event.teams.length;
        sportStats[sport].interestSubmissions += event.interests.length;
      });
    });

    // Count tournament interests per sport (derived from club's sports)
    tournamentInterests.forEach((interest) => {
      const clubSports = [
        ...(interest.club?.sportsSupported || []),
        ...(interest.club?.teamTypes || []),
      ];
      const uniqueSports = [...new Set(clubSports.map(normalizeSport))];
      uniqueSports.forEach((sport) => {
        if (!sport) return;
        if (!sportStats[sport]) {
          sportStats[sport] = {
            clubCount: 0,
            eventCount: 0,
            upcomingEvents: 0,
            completedEvents: 0,
            teamRegistrations: 0,
            interestSubmissions: 0,
            tournamentInterests: 0,
          };
        }
        sportStats[sport].tournamentInterests++;
      });
    });

    // Convert to sorted array
    const sportPerformance = Object.entries(sportStats)
      .map(([sport, stats]) => ({
        sport,
        ...stats,
        engagementScore:
          stats.clubCount +
          stats.eventCount * 2 +
          stats.teamRegistrations * 3 +
          stats.tournamentInterests,
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore);

    // Calculate summary
    const totalSports = sportPerformance.length;
    const totalClubSportOfferings = sportPerformance.reduce(
      (acc, s) => acc + s.clubCount,
      0
    );
    const totalSportEvents = sportPerformance.reduce(
      (acc, s) => acc + s.eventCount,
      0
    );
    const topSport = sportPerformance[0]?.sport || "N/A";

    // Get monthly trends for top 5 sports
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentInterests = tournamentInterests.filter(
      (i) => new Date(i.createdAt) > thirtyDaysAgo
    );
    const previousInterests = tournamentInterests.filter(
      (i) =>
        new Date(i.createdAt) > sixtyDaysAgo &&
        new Date(i.createdAt) <= thirtyDaysAgo
    );

    const topSports = sportPerformance.slice(0, 5).map((s) => s.sport);
    const sportTrends = topSports.map((sport) => {
      const recentCount = recentInterests.filter((i) => {
        const clubSports = [
          ...(i.club?.sportsSupported || []),
          ...(i.club?.teamTypes || []),
        ];
        return clubSports.some((s) => normalizeSport(s) === sport);
      }).length;
      const previousCount = previousInterests.filter((i) => {
        const clubSports = [
          ...(i.club?.sportsSupported || []),
          ...(i.club?.teamTypes || []),
        ];
        return clubSports.some((s) => normalizeSport(s) === sport);
      }).length;
      const growthPercent =
        previousCount > 0
          ? Math.round(((recentCount - previousCount) / previousCount) * 100)
          : recentCount > 0
            ? 100
            : 0;

      return {
        sport,
        recentInterests: recentCount,
        previousInterests: previousCount,
        growthPercent,
      };
    });

    // Sport distribution by region (based on club locations)
    const clubsWithLocation = await prisma.club.findMany({
      where: { status: "APPROVED" },
      select: {
        sportsSupported: true,
        teamTypes: true,
        country: {
          select: { name: true },
        },
      },
    });

    const sportsByCountry: Record<string, Record<string, number>> = {};
    clubsWithLocation.forEach((club) => {
      const country = club.country?.name || "Unknown";
      const sports = [
        ...(club.sportsSupported || []),
        ...(club.teamTypes || []),
      ];
      const uniqueSports = [...new Set(sports.map(normalizeSport))];

      if (!sportsByCountry[country]) {
        sportsByCountry[country] = {};
      }
      uniqueSports.forEach((sport) => {
        if (!sport) return;
        sportsByCountry[country][sport] =
          (sportsByCountry[country][sport] || 0) + 1;
      });
    });

    // Get top countries by sport diversity
    const countryDiversity = Object.entries(sportsByCountry)
      .map(([country, sports]) => ({
        country,
        sportCount: Object.keys(sports).length,
        topSport:
          Object.entries(sports).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
        clubCount: Object.values(sports).reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => b.clubCount - a.clubCount)
      .slice(0, 10);

    const report = {
      summary: {
        totalSports,
        totalClubSportOfferings,
        totalSportEvents,
        topSport,
      },
      sportPerformance,
      sportTrends,
      countryDiversity,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating sport performance report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
