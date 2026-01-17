import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all survey responses
    const responses = await prisma.surveyResponse.findMany({
      orderBy: { submittedAt: "desc" },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
      },
    });

    const totalResponses = responses.length;

    // Role distribution
    const roleCounts: Record<string, number> = {};
    responses.forEach((r) => {
      if (r.role) {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      }
    });

    // Country distribution
    const countryCounts: Record<string, number> = {};
    responses.forEach((r) => {
      if (r.country) {
        countryCounts[r.country] = (countryCounts[r.country] || 0) + 1;
      }
    });

    // Sport code distribution
    const sportCodeCounts: Record<string, number> = {};
    responses.forEach((r) => {
      if (r.sportCode) {
        sportCodeCounts[r.sportCode] = (sportCodeCounts[r.sportCode] || 0) + 1;
      }
    });

    // Preferred months distribution
    const preferredMonthCounts: Record<string, number> = {};
    responses.forEach((r) => {
      (r.preferredMonths || []).forEach((m) => {
        preferredMonthCounts[m] = (preferredMonthCounts[m] || 0) + 1;
      });
    });

    // Specific destinations mentioned
    const destinationCounts: Record<string, number> = {};
    responses.forEach((r) => {
      if (r.specificDestination) {
        const dest = r.specificDestination.trim().toLowerCase();
        destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
      }
    });

    // Budget distribution
    const budgetCounts: Record<string, number> = {};
    responses.forEach((r) => {
      if (r.budgetPerPerson) {
        budgetCounts[r.budgetPerPerson] =
          (budgetCounts[r.budgetPerPerson] || 0) + 1;
      }
    });

    // Team size distribution
    const teamSizeCounts: Record<string, number> = {};
    responses.forEach((r) => {
      if (r.teamSize) {
        teamSizeCounts[r.teamSize] = (teamSizeCounts[r.teamSize] || 0) + 1;
      }
    });

    // Interested services
    const serviceCounts: Record<string, number> = {};
    responses.forEach((r) => {
      (r.interestedServices || []).forEach((s) => {
        serviceCounts[s] = (serviceCounts[s] || 0) + 1;
      });
    });

    // Biggest challenges
    const challengeCounts: Record<string, number> = {};
    responses.forEach((r) => {
      if (r.biggestChallenge) {
        challengeCounts[r.biggestChallenge] =
          (challengeCounts[r.biggestChallenge] || 0) + 1;
      }
    });

    // Preferred travel time
    const travelTimeCounts: Record<string, number> = {};
    responses.forEach((r) => {
      if (r.preferredTravelTime) {
        travelTimeCounts[r.preferredTravelTime] =
          (travelTimeCounts[r.preferredTravelTime] || 0) + 1;
      }
    });

    // Has traveled abroad distribution
    const traveledCounts: Record<string, number> = {};
    responses.forEach((r) => {
      if (r.hasTraveledAbroad) {
        traveledCounts[r.hasTraveledAbroad] =
          (traveledCounts[r.hasTraveledAbroad] || 0) + 1;
      }
    });

    // Monthly trends (submissions per month)
    const monthlySubmissions: Record<string, number> = {};
    responses.forEach((r) => {
      const month = new Date(r.submittedAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlySubmissions[month] = (monthlySubmissions[month] || 0) + 1;
    });

    // Responses with feedback
    const withFeedback = responses.filter(
      (r) => r.improvementSuggestion || r.additionalFeedback
    ).length;

    // Responses linked to events
    const linkedToEvent = responses.filter((r) => r.eventId).length;

    // Responses with preferred months selected
    const withPreferredMonths = responses.filter(
      (r) => r.preferredMonths && r.preferredMonths.length > 0
    ).length;

    // Responses with specific destination
    const withSpecificDestination = responses.filter(
      (r) => r.specificDestination
    ).length;

    // Sort helper
    const sortByCount = (obj: Record<string, number>) =>
      Object.entries(obj)
        .filter(([name]) => name && name !== "null" && name !== "undefined")
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({
          name,
          count,
          percentage:
            totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0,
        }));

    // Recent submissions (last 10)
    const recentSubmissions = responses.slice(0, 10).map((r) => ({
      contactName: r.contactName,
      contactEmail: r.contactEmail,
      role: r.role,
      country: r.country,
      clubName: r.clubName,
      sportCode: r.sportCode,
      preferredMonths: r.preferredMonths,
      specificDestination: r.specificDestination,
      budget: r.budgetPerPerson,
      teamSize: r.teamSize,
      submittedAt: r.submittedAt.toISOString(),
      eventTitle: r.event?.title || null,
    }));

    const report = {
      summary: {
        totalResponses,
        withFeedback,
        linkedToEvent,
        withPreferredMonths,
        withSpecificDestination,
        feedbackRate:
          totalResponses > 0
            ? Math.round((withFeedback / totalResponses) * 100)
            : 0,
        eventLinkRate:
          totalResponses > 0
            ? Math.round((linkedToEvent / totalResponses) * 100)
            : 0,
      },
      byRole: sortByCount(roleCounts),
      byCountry: sortByCount(countryCounts).slice(0, 15),
      bySportCode: sortByCount(sportCodeCounts),
      byPreferredMonth: sortByCount(preferredMonthCounts),
      bySpecificDestination: sortByCount(destinationCounts).slice(0, 20),
      byBudget: sortByCount(budgetCounts),
      byTeamSize: sortByCount(teamSizeCounts),
      byService: sortByCount(serviceCounts),
      byChallenge: sortByCount(challengeCounts),
      byTravelTime: sortByCount(travelTimeCounts),
      byTraveledAbroad: sortByCount(traveledCounts),
      monthlyTrends: Object.entries(monthlySubmissions)
        .map(([month, count]) => ({ month, count }))
        .slice(0, 12),
      recentSubmissions,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating trip requests report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
