import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all users with their preferences
    const usersWithPreferences = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        createdAt: true,
        club: {
          select: {
            name: true,
          },
        },
        preferences: {
          select: {
            motivations: true,
            competitiveLevels: true,
            preferredCities: true,
            preferredCountries: true,
            budgetRange: true,
            preferredMonths: true,
            activities: true,
            onboardingCompleted: true,
            onboardingSkipped: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter to only users who have preferences set
    const usersWithPreferencesData = usersWithPreferences.filter(
      (user) => user.preferences !== null
    );

    // Convert to CSV format
    const headers = [
      "User Email",
      "Username",
      "Name",
      "Club",
      "Account Created",
      "Motivations",
      "Competitive Levels",
      "Preferred Destinations",
      "Budget Range",
      "Preferred Months",
      "Activities",
      "Onboarding Completed",
      "Onboarding Skipped",
      "Preferences Updated",
    ];

    const rows = usersWithPreferencesData.map((user) => {
      const prefs = user.preferences!;
      return [
        user.email,
        user.username,
        user.name || "",
        user.club?.name || "",
        user.createdAt.toISOString().split("T")[0],
        prefs.motivations.join("; "),
        prefs.competitiveLevels.join("; "),
        [...prefs.preferredCities, ...prefs.preferredCountries].join("; "),
        prefs.budgetRange || "",
        prefs.preferredMonths.join("; "),
        prefs.activities.join("; "),
        prefs.onboardingCompleted ? "Yes" : "No",
        prefs.onboardingSkipped ? "Yes" : "No",
        prefs.updatedAt.toISOString().split("T")[0],
      ];
    });

    // Escape CSV values
    const escapeCSV = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    // Return as CSV file download
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="user-preferences-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting user preferences:", error);
    return NextResponse.json(
      { error: "Failed to export user preferences" },
      { status: 500 }
    );
  }
}
