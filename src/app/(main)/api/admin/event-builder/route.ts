import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import {
  allEuropeanEvents,
  europeanCountryFlags,
} from "@/lib/constants/european-events-calendar";
import {
  allBankHolidays,
  countryFlags as bankHolidayFlags,
} from "@/lib/constants/bank-holidays";

// Milestone years that are significant for anniversaries
const MILESTONE_YEARS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 75, 100];

interface ClubMilestone {
  clubId: string;
  clubName: string;
  country: string;
  countryFlag: string;
  foundedYear: number;
  milestoneYear: number;
  anniversaryYears: number;
  milestoneDate: string; // Approximate - just the year
  isVerified: boolean;
  hasAdmin: boolean;
}

interface CombinedOpportunity {
  date: string;
  type: "holiday" | "festival" | "milestone" | "combined";
  title: string;
  description: string;
  country: string;
  countryFlag: string;
  travelAppeal?: string;
  clubMilestone?: ClubMilestone;
  nearbyHoliday?: {
    name: string;
    date: string;
    country: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const currentYearDefault = new Date().getFullYear();
    const year = parseInt(
      searchParams.get("year") || currentYearDefault.toString()
    );
    const countryFilter = searchParams.get("country") || null;

    const currentYear = new Date().getFullYear();

    // Get total European club count (all clubs)
    const totalEuropeanClubCount = await prisma.club.count({
      where: { isMainlandEurope: true },
    });

    // Get European clubs with founded year for milestone calculations
    const clubs = await prisma.club.findMany({
      where: {
        isMainlandEurope: true,
        foundedYear: { not: null },
      },
      select: {
        id: true,
        name: true,
        foundedYear: true,
        verificationStatus: true,
        country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            admins: true,
          },
        },
      },
    });

    // Calculate milestones for each club
    const clubMilestones: ClubMilestone[] = [];

    clubs.forEach((club) => {
      if (!club.foundedYear) return;

      const clubAge = year - club.foundedYear;
      const countryCode = club.country?.code || "";

      // Check if this year is a milestone year for this club
      if (MILESTONE_YEARS.includes(clubAge) && clubAge > 0) {
        clubMilestones.push({
          clubId: club.id,
          clubName: club.name,
          country: club.country?.name || "Unknown",
          countryFlag: europeanCountryFlags[countryCode] || "",
          foundedYear: club.foundedYear,
          milestoneYear: year,
          anniversaryYears: clubAge,
          milestoneDate: `${year}-01-01`, // Placeholder - actual founding date unknown
          isVerified: club.verificationStatus === "VERIFIED",
          hasAdmin: club._count.admins > 0,
        });
      }
    });

    // Sort milestones by anniversary significance
    clubMilestones.sort((a, b) => b.anniversaryYears - a.anniversaryYears);

    // Get European events for the selected year
    const yearEvents = allEuropeanEvents.filter((e) => {
      const eventYear = new Date(e.date).getFullYear();
      return eventYear === year;
    });

    // Apply country filter if specified
    const filteredEvents = countryFilter
      ? yearEvents.filter((e) => e.countryCode === countryFilter)
      : yearEvents;

    // Get bank holidays for source markets (Ireland & UK)
    const sourceHolidays = allBankHolidays.filter((h) => {
      const holidayYear = new Date(h.date).getFullYear();
      return (
        holidayYear === year &&
        (h.countryCode === "IE" || h.countryCode === "GB")
      );
    });

    // Find combined opportunities (milestones near holidays/festivals)
    const combinedOpportunities: CombinedOpportunity[] = [];

    clubMilestones.forEach((milestone) => {
      // Find festivals/events in the same country
      const countryEvents = filteredEvents.filter(
        (e) => e.country === milestone.country && e.travelAppeal === "high"
      );

      if (countryEvents.length > 0) {
        countryEvents.forEach((event) => {
          combinedOpportunities.push({
            date: event.date,
            type: "combined",
            title: `${milestone.clubName} ${milestone.anniversaryYears}th Anniversary + ${event.name}`,
            description: `${milestone.clubName} celebrates ${milestone.anniversaryYears} years in ${year}. Consider timing with ${event.name} for maximum appeal.`,
            country: milestone.country,
            countryFlag: milestone.countryFlag,
            travelAppeal: event.travelAppeal,
            clubMilestone: milestone,
            nearbyHoliday: {
              name: event.name,
              date: event.date,
              country: event.country,
            },
          });
        });
      } else {
        // Just the milestone
        combinedOpportunities.push({
          date: `${year}-06-01`, // Summer placeholder
          type: "milestone",
          title: `${milestone.clubName} ${milestone.anniversaryYears}th Anniversary`,
          description: `${milestone.clubName} was founded in ${milestone.foundedYear}. A ${milestone.anniversaryYears}-year anniversary tournament would be special!`,
          country: milestone.country,
          countryFlag: milestone.countryFlag,
          clubMilestone: milestone,
        });
      }
    });

    // Summary stats
    const summary = {
      totalEuropeanClubs: totalEuropeanClubCount,
      clubsWithFoundedYear: clubs.length,
      milestonesThisYear: clubMilestones.length,
      decadeMilestones: clubMilestones.filter((m) => m.anniversaryYears >= 10)
        .length,
      highAppealEvents: filteredEvents.filter((e) => e.travelAppeal === "high")
        .length,
      totalFestivals: filteredEvents.filter((e) => e.type === "festival")
        .length,
      combinedOpportunities: combinedOpportunities.length,
    };

    // Events by month for calendar view
    const eventsByMonth: Record<
      string,
      {
        europeanEvents: typeof filteredEvents;
        sourceHolidays: typeof sourceHolidays;
      }
    > = {};

    for (let month = 1; month <= 12; month++) {
      const monthKey = month.toString().padStart(2, "0");
      eventsByMonth[monthKey] = {
        europeanEvents: filteredEvents.filter((e) => {
          const eventMonth = new Date(e.date).getMonth() + 1;
          return eventMonth === month;
        }),
        sourceHolidays: sourceHolidays.filter((h) => {
          const holidayMonth = new Date(h.date).getMonth() + 1;
          return holidayMonth === month;
        }),
      };
    }

    // Milestone breakdown by anniversary
    const milestoneBreakdown = MILESTONE_YEARS.map((years) => ({
      anniversary: `${years} years`,
      count: clubMilestones.filter((m) => m.anniversaryYears === years).length,
    })).filter((m) => m.count > 0);

    // Countries with most milestones
    const milestonesByCountry: Record<string, number> = {};
    clubMilestones.forEach((m) => {
      milestonesByCountry[m.country] =
        (milestonesByCountry[m.country] || 0) + 1;
    });

    const topMilestoneCountries = Object.entries(milestonesByCountry)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      year,
      summary,
      milestones: clubMilestones,
      europeanEvents: filteredEvents.map((e) => ({
        ...e,
        countryFlag: europeanCountryFlags[e.countryCode] || "",
      })),
      sourceMarketHolidays: sourceHolidays.map((h) => ({
        ...h,
        countryFlag: bankHolidayFlags[h.countryCode] || "",
      })),
      combinedOpportunities: combinedOpportunities.slice(0, 20),
      eventsByMonth,
      milestoneBreakdown,
      topMilestoneCountries,
      availableCountries: [
        ...new Set(yearEvents.map((e) => e.countryCode)),
      ].map((code) => ({
        code,
        name: yearEvents.find((e) => e.countryCode === code)?.country || code,
        flag: europeanCountryFlags[code] || "",
      })),
    });
  } catch (error) {
    console.error("Error generating event builder data:", error);
    return NextResponse.json(
      { error: "Failed to generate event builder data" },
      { status: 500 }
    );
  }
}
