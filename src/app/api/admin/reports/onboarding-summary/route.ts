import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all user preferences
    const preferences = await prisma.userPreferences.findMany({
      select: {
        motivations: true,
        competitiveLevels: true,
        preferredCities: true,
        preferredCountries: true,
        budgetRange: true,
        preferredMonths: true,
        onboardingCompleted: true,
        onboardingSkipped: true,
      },
    });

    // Calculate totals
    const totalUsers = preferences.length;
    const completedOnboarding = preferences.filter(
      (p) => p.onboardingCompleted
    ).length;
    const skippedOnboarding = preferences.filter(
      (p) => p.onboardingSkipped
    ).length;

    // Aggregate motivations
    const motivationCounts: Record<string, number> = {};
    preferences.forEach((p) => {
      p.motivations.forEach((m) => {
        motivationCounts[m] = (motivationCounts[m] || 0) + 1;
      });
    });

    // Aggregate competitive levels
    const competitiveLevelCounts: Record<string, number> = {};
    preferences.forEach((p) => {
      p.competitiveLevels.forEach((c) => {
        competitiveLevelCounts[c] = (competitiveLevelCounts[c] || 0) + 1;
      });
    });

    // Aggregate destinations (cities + countries combined)
    const destinationCounts: Record<string, number> = {};
    preferences.forEach((p) => {
      [...p.preferredCities, ...p.preferredCountries].forEach((d) => {
        const normalized = d.trim().toLowerCase();
        if (normalized) {
          destinationCounts[normalized] =
            (destinationCounts[normalized] || 0) + 1;
        }
      });
    });

    // Aggregate budget ranges
    const budgetCounts: Record<string, number> = {};
    preferences.forEach((p) => {
      if (p.budgetRange) {
        budgetCounts[p.budgetRange] = (budgetCounts[p.budgetRange] || 0) + 1;
      }
    });

    // Aggregate preferred months
    const monthCounts: Record<string, number> = {};
    preferences.forEach((p) => {
      p.preferredMonths.forEach((m) => {
        monthCounts[m] = (monthCounts[m] || 0) + 1;
      });
    });

    // Sort and format results
    const sortByCount = (obj: Record<string, number>) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({
          name,
          count,
          percentage:
            totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
        }));

    const report = {
      summary: {
        totalUsers,
        completedOnboarding,
        skippedOnboarding,
        completionRate:
          totalUsers > 0
            ? Math.round((completedOnboarding / totalUsers) * 100)
            : 0,
      },
      motivations: sortByCount(motivationCounts),
      competitiveLevels: sortByCount(competitiveLevelCounts),
      topDestinations: sortByCount(destinationCounts).slice(0, 20),
      budgetRanges: sortByCount(budgetCounts),
      preferredMonths: sortByCount(monthCounts),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating onboarding summary:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
