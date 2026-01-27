import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all clubs with related data
    const clubs = await prisma.club.findMany({
      select: {
        id: true,
        name: true,
        country: {
          select: {
            name: true,
          },
        },
        region: true,
        clubType: true,
        verificationStatus: true,
        foundedYear: true,
        teamTypes: true,
        sportsSupported: true,
        createdAt: true,
        events: {
          select: { id: true },
        },
        members: {
          select: { id: true },
        },
        admins: {
          select: { id: true },
        },
        testimonials: {
          select: { id: true, status: true },
        },
      },
    });

    // Calculate totals
    const totalClubs = clubs.length;

    // Verification status distribution
    const verificationCounts: Record<string, number> = {};
    clubs.forEach((c) => {
      const status = c.verificationStatus || "UNVERIFIED";
      verificationCounts[status] = (verificationCounts[status] || 0) + 1;
    });

    // Club type distribution
    const clubTypeCounts: Record<string, number> = {};
    clubs.forEach((c) => {
      const type = c.clubType || "CLUB";
      clubTypeCounts[type] = (clubTypeCounts[type] || 0) + 1;
    });

    // Clubs by country
    const countryCounts: Record<string, number> = {};
    clubs.forEach((c) => {
      const country = c.country?.name || "Unknown";
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    // Clubs by region (for countries with regions)
    const regionCounts: Record<string, number> = {};
    clubs.forEach((c) => {
      if (c.region) {
        regionCounts[c.region] = (regionCounts[c.region] || 0) + 1;
      }
    });

    // Sports offered
    const sportsCounts: Record<string, number> = {};
    clubs.forEach((c) => {
      if (c.sportsSupported && Array.isArray(c.sportsSupported)) {
        c.sportsSupported.forEach((sport: string) => {
          sportsCounts[sport] = (sportsCounts[sport] || 0) + 1;
        });
      }
    });

    // Team types offered
    const teamTypeCounts: Record<string, number> = {};
    clubs.forEach((c) => {
      if (c.teamTypes && Array.isArray(c.teamTypes)) {
        c.teamTypes.forEach((type: string) => {
          teamTypeCounts[type] = (teamTypeCounts[type] || 0) + 1;
        });
      }
    });

    // Clubs with events
    const clubsWithEvents = clubs.filter((c) => c.events.length > 0).length;
    const totalEventsHosted = clubs.reduce(
      (sum, c) => sum + c.events.length,
      0
    );

    // Clubs with members
    const clubsWithMembers = clubs.filter((c) => c.members.length > 0).length;
    const totalMembers = clubs.reduce((sum, c) => sum + c.members.length, 0);

    // Clubs with admins
    const clubsWithAdmins = clubs.filter((c) => c.admins.length > 0).length;

    // Testimonials stats
    const clubsWithTestimonials = clubs.filter(
      (c) => c.testimonials.length > 0
    ).length;
    const totalTestimonials = clubs.reduce(
      (sum, c) => sum + c.testimonials.length,
      0
    );
    const approvedTestimonials = clubs.reduce(
      (sum, c) =>
        sum + c.testimonials.filter((t) => t.status === "APPROVED").length,
      0
    );

    // Profile completeness (basic heuristic)
    const profileScores = clubs.map((c) => {
      let score = 0;
      if (c.country) score += 20;
      if (c.region) score += 10;
      if (c.foundedYear) score += 10;
      if (c.teamTypes && c.teamTypes.length > 0) score += 15;
      if (c.sportsSupported && c.sportsSupported.length > 0) score += 15;
      if (c.verificationStatus === "VERIFIED") score += 20;
      if (c.admins.length > 0) score += 10;
      return score;
    });
    const avgProfileCompleteness = Math.round(
      profileScores.reduce((sum, s) => sum + s, 0) / (totalClubs || 1)
    );

    // Clubs created over time (last 12 months)
    const monthlyCreation: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyCreation[key] = 0;
    }
    clubs.forEach((c) => {
      const date = new Date(c.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyCreation[key] !== undefined) {
        monthlyCreation[key]++;
      }
    });

    // Top hosting clubs
    const topHostingClubs = clubs
      .filter((c) => c.events.length > 0)
      .map((c) => ({
        name: c.name,
        country: c.country?.name || null,
        eventsHosted: c.events.length,
        verified: c.verificationStatus === "VERIFIED",
      }))
      .sort((a, b) => b.eventsHosted - a.eventsHosted)
      .slice(0, 10);

    const report = {
      summary: {
        totalClubs,
        verifiedClubs: verificationCounts["VERIFIED"] || 0,
        pendingVerification: verificationCounts["PENDING_VERIFICATION"] || 0,
        clubsWithEvents,
        totalEventsHosted,
        clubsWithMembers,
        totalMembers,
        clubsWithAdmins,
        clubsWithTestimonials,
        totalTestimonials,
        approvedTestimonials,
        avgProfileCompleteness,
      },
      verificationStatus: Object.entries(verificationCounts)
        .map(([status, count]) => ({
          status,
          count,
          percentage: Math.round((count / totalClubs) * 100),
        }))
        .sort((a, b) => b.count - a.count),
      clubTypes: Object.entries(clubTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      topCountries: Object.entries(countryCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
      topRegions: Object.entries(regionCounts)
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15),
      sportsOffered: Object.entries(sportsCounts)
        .map(([sport, count]) => ({ sport, count }))
        .sort((a, b) => b.count - a.count),
      teamTypesOffered: Object.entries(teamTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      monthlyGrowth: Object.entries(monthlyCreation).map(([month, count]) => ({
        month,
        count,
      })),
      topHostingClubs,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating club health report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
