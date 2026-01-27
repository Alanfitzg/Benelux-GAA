import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all interest registrations
    const interests = await prisma.socialGAAInterest.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Calculate statistics
    const totalRegistrations = interests.length;

    // Count by event type
    const eventTypeCounts = {
      DADS_AND_LADS: 0,
      GAELIC4MOTHERS_AND_OTHERS: 0,
      SOCIAL_CAMOGIE: 0,
    };

    interests.forEach((interest) => {
      const types = interest.eventTypes.split(",");
      types.forEach((type) => {
        if (type in eventTypeCounts) {
          eventTypeCounts[type as keyof typeof eventTypeCounts]++;
        }
      });
    });

    // Count by county
    const countyBreakdown: Record<string, number> = {};
    interests.forEach((interest) => {
      const county = interest.county || "Unknown";
      countyBreakdown[county] = (countyBreakdown[county] || 0) + 1;
    });

    // Sort counties by count
    const sortedCounties = Object.entries(countyBreakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([county, count]) => ({ county, count }));

    // Count by estimated players
    const playerBreakdown: Record<string, number> = {};
    interests.forEach((interest) => {
      const players = interest.estimatedPlayers || "Not specified";
      playerBreakdown[players] = (playerBreakdown[players] || 0) + 1;
    });

    // Count by previous participation
    const participationBreakdown: Record<string, number> = {};
    interests.forEach((interest) => {
      const participation = interest.previousParticipation || "Not specified";
      participationBreakdown[participation] =
        (participationBreakdown[participation] || 0) + 1;
    });

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = interests.filter(
      (i) => new Date(i.createdAt) >= sevenDaysAgo
    ).length;

    // Monthly trend
    const monthlyTrend: Record<string, number> = {};
    interests.forEach((interest) => {
      const month = new Date(interest.createdAt).toLocaleDateString("en-IE", {
        month: "short",
        year: "numeric",
      });
      monthlyTrend[month] = (monthlyTrend[month] || 0) + 1;
    });

    return NextResponse.json({
      summary: {
        totalRegistrations,
        recentRegistrations,
        uniqueCounties: sortedCounties.length,
      },
      eventTypeCounts,
      countyBreakdown: sortedCounties,
      playerBreakdown,
      participationBreakdown,
      monthlyTrend,
      registrations: interests.map((i) => ({
        id: i.id,
        clubName: i.clubName,
        county: i.county,
        contactName: i.contactName,
        contactEmail: i.contactEmail,
        contactPhone: i.contactPhone,
        eventTypes: i.eventTypes.split(","),
        estimatedPlayers: i.estimatedPlayers,
        previousParticipation: i.previousParticipation,
        additionalNotes: i.additionalNotes,
        createdAt: i.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error generating GGE interest report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
