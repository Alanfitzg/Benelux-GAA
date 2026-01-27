import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import {
  allBankHolidays,
  bankHolidays2025,
  bankHolidays2026,
  countryFlags,
  type BankHoliday,
} from "@/lib/constants/bank-holidays";

interface HolidayEventMatch {
  holiday: BankHoliday;
  events: {
    id: string;
    title: string;
    startDate: Date;
    location: string;
    registrationCount: number;
  }[];
  totalRegistrations: number;
}

interface HolidayPerformance {
  holidayName: string;
  country: string;
  countryFlag: string;
  date: string;
  year: number;
  eventsCount: number;
  totalRegistrations: number;
  averageRegistrations: number;
  isUpcoming: boolean;
  daysAway: number | null;
}

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Get all events with team registration counts
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        location: true,
        _count: {
          select: {
            teams: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    // Match events to bank holiday windows
    const holidayMatches: HolidayEventMatch[] = [];

    for (const holiday of allBankHolidays) {
      const windowStart = new Date(holiday.travelWindow.start);
      const windowEnd = new Date(holiday.travelWindow.end);
      windowEnd.setHours(23, 59, 59, 999);

      const matchingEvents = events.filter((event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;

        // Event overlaps with holiday window
        return eventStart <= windowEnd && eventEnd >= windowStart;
      });

      if (
        matchingEvents.length > 0 ||
        holiday.countryCode === "IE" ||
        holiday.countryCode === "GB"
      ) {
        holidayMatches.push({
          holiday,
          events: matchingEvents.map((e) => ({
            id: e.id,
            title: e.title,
            startDate: e.startDate,
            location: e.location,
            registrationCount: e._count.teams,
          })),
          totalRegistrations: matchingEvents.reduce(
            (sum, e) => sum + e._count.teams,
            0
          ),
        });
      }
    }

    // Calculate holiday performance rankings (Irish/UK holidays only - source markets)
    const sourceMarketHolidays = holidayMatches.filter(
      (m) => m.holiday.countryCode === "IE" || m.holiday.countryCode === "GB"
    );

    const holidayPerformance: HolidayPerformance[] = sourceMarketHolidays.map(
      (match) => {
        const holidayDate = new Date(match.holiday.date);
        const isUpcoming = holidayDate > now;
        const daysAway = isUpcoming
          ? Math.ceil(
              (holidayDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            )
          : null;

        return {
          holidayName: match.holiday.name,
          country: match.holiday.country,
          countryFlag: countryFlags[match.holiday.countryCode] || "",
          date: match.holiday.date,
          year: holidayDate.getFullYear(),
          eventsCount: match.events.length,
          totalRegistrations: match.totalRegistrations,
          averageRegistrations:
            match.events.length > 0
              ? Math.round(match.totalRegistrations / match.events.length)
              : 0,
          isUpcoming,
          daysAway,
        };
      }
    );

    // Sort by total registrations (historical performance)
    const topPerformingHolidays = [...holidayPerformance]
      .filter((h) => !h.isUpcoming)
      .sort((a, b) => b.totalRegistrations - a.totalRegistrations)
      .slice(0, 10);

    // Upcoming opportunities
    const upcomingOpportunities = [...holidayPerformance]
      .filter((h) => h.isUpcoming && h.daysAway !== null && h.daysAway <= 365)
      .sort((a, b) => (a.daysAway || 0) - (b.daysAway || 0))
      .slice(0, 12);

    // Gap analysis - holidays without events
    const holidayGaps = upcomingOpportunities.filter(
      (h) => h.eventsCount === 0
    );

    // Monthly heatmap data
    const monthlyData: Record<
      string,
      { month: string; holidays: number; events: number; registrations: number }
    > = {};

    for (let i = 0; i < 12; i++) {
      const monthKey = new Date(2025, i, 1).toLocaleString("en-US", {
        month: "short",
      });
      monthlyData[monthKey] = {
        month: monthKey,
        holidays: 0,
        events: 0,
        registrations: 0,
      };
    }

    // Count 2025 holidays by month (Irish/UK only)
    bankHolidays2025
      .filter((h) => h.countryCode === "IE" || h.countryCode === "GB")
      .forEach((holiday) => {
        const month = new Date(holiday.date).toLocaleString("en-US", {
          month: "short",
        });
        if (monthlyData[month]) {
          monthlyData[month].holidays++;
        }
      });

    // Add event data to monthly heatmap
    holidayMatches.forEach((match) => {
      const holidayDate = new Date(match.holiday.date);
      if (
        holidayDate.getFullYear() === 2025 &&
        (match.holiday.countryCode === "IE" ||
          match.holiday.countryCode === "GB")
      ) {
        const month = holidayDate.toLocaleString("en-US", { month: "short" });
        if (monthlyData[month]) {
          monthlyData[month].events += match.events.length;
          monthlyData[month].registrations += match.totalRegistrations;
        }
      }
    });

    const heatmapData = Object.values(monthlyData);

    // Year comparison (2025 vs 2026)
    const yearComparison = {
      "2025": {
        totalHolidays: bankHolidays2025.filter(
          (h) => h.countryCode === "IE" || h.countryCode === "GB"
        ).length,
        longWeekends: bankHolidays2025.filter(
          (h) =>
            (h.countryCode === "IE" || h.countryCode === "GB") &&
            h.isLongWeekend
        ).length,
        eventsScheduled: holidayMatches.filter((m) => {
          const year = new Date(m.holiday.date).getFullYear();
          return (
            year === 2025 &&
            (m.holiday.countryCode === "IE" || m.holiday.countryCode === "GB")
          );
        }).length,
      },
      "2026": {
        totalHolidays: bankHolidays2026.filter(
          (h) => h.countryCode === "IE" || h.countryCode === "GB"
        ).length,
        longWeekends: bankHolidays2026.filter(
          (h) =>
            (h.countryCode === "IE" || h.countryCode === "GB") &&
            h.isLongWeekend
        ).length,
        eventsScheduled: holidayMatches.filter((m) => {
          const year = new Date(m.holiday.date).getFullYear();
          return (
            year === 2026 &&
            (m.holiday.countryCode === "IE" || m.holiday.countryCode === "GB")
          );
        }).length,
      },
    };

    // Summary stats
    const totalEventsOnHolidays = holidayMatches.reduce(
      (sum, m) => sum + m.events.length,
      0
    );
    const totalRegistrationsOnHolidays = holidayMatches.reduce(
      (sum, m) => sum + m.totalRegistrations,
      0
    );
    const totalEvents = events.length;
    const totalRegistrations = events.reduce(
      (sum, e) => sum + e._count.teams,
      0
    );

    const holidayEventShare =
      totalEvents > 0
        ? Math.round((totalEventsOnHolidays / totalEvents) * 100 * 10) / 10
        : 0;

    const holidayRegistrationShare =
      totalRegistrations > 0
        ? Math.round(
            (totalRegistrationsOnHolidays / totalRegistrations) * 100 * 10
          ) / 10
        : 0;

    // Build response
    return NextResponse.json({
      summary: {
        totalEventsOnHolidays,
        totalRegistrationsOnHolidays,
        holidayEventShare,
        holidayRegistrationShare,
        upcomingHolidaysWithEvents: upcomingOpportunities.filter(
          (h) => h.eventsCount > 0
        ).length,
        upcomingHolidaysWithoutEvents: holidayGaps.length,
        totalSourceMarketHolidays:
          yearComparison["2025"].totalHolidays +
          yearComparison["2026"].totalHolidays,
      },
      topPerformingHolidays,
      upcomingOpportunities,
      holidayGaps,
      heatmapData,
      yearComparison,
      // Full data for download
      allHolidayData: holidayPerformance.map((h) => ({
        ...h,
        formattedDate: new Date(h.date).toLocaleDateString("en-IE", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      })),
    });
  } catch (error) {
    console.error("Error generating bank holiday analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
