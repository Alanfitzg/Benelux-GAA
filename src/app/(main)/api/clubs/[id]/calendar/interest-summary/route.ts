import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, format } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString()
    );
    const month = searchParams.get("month");

    let startDate: Date;
    let endDate: Date;

    if (month) {
      startDate = startOfMonth(new Date(year, parseInt(month) - 1));
      endDate = endOfMonth(new Date(year, parseInt(month) - 1));
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    const interests = await prisma.tournamentInterest.findMany({
      where: {
        clubId: id,
        status: { in: ["PENDING", "IN_DISCUSSION", "APPROVED"] },
        OR: [
          {
            monthYear: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            specificDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            dateRangeStart: {
              lte: endDate,
            },
            dateRangeEnd: {
              gte: startDate,
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const monthlyStats: Record<
      string,
      {
        total: number;
        flexible: number;
        fixed: number;
        veryFlexible: number;
        totalTeamSize: number;
        interests: Array<{
          id: string;
          userName: string;
          userEmail: string;
          teamSize: number;
          flexibility: string;
          interestType: string;
          status: string;
        }>;
      }
    > = {};

    for (let m = 0; m < 12; m++) {
      const monthKey = format(new Date(year, m), "yyyy-MM");
      monthlyStats[monthKey] = {
        total: 0,
        flexible: 0,
        fixed: 0,
        veryFlexible: 0,
        totalTeamSize: 0,
        interests: [],
      };
    }

    interests.forEach((interest) => {
      const monthsAffected: string[] = [];

      if (interest.interestType === "SPECIFIC_DATE" && interest.specificDate) {
        monthsAffected.push(format(interest.specificDate, "yyyy-MM"));
      } else if (
        interest.interestType === "ENTIRE_MONTH" &&
        interest.monthYear
      ) {
        monthsAffected.push(format(interest.monthYear, "yyyy-MM"));
      } else if (
        interest.interestType === "MULTIPLE_MONTHS" &&
        interest.monthYear
      ) {
        monthsAffected.push(format(interest.monthYear, "yyyy-MM"));
      } else if (
        interest.interestType === "DATE_RANGE" &&
        interest.dateRangeStart &&
        interest.dateRangeEnd
      ) {
        const start = new Date(interest.dateRangeStart);
        const end = new Date(interest.dateRangeEnd);

        for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
          const monthKey = format(d, "yyyy-MM");
          if (!monthsAffected.includes(monthKey)) {
            monthsAffected.push(monthKey);
          }
        }
      }

      monthsAffected.forEach((monthKey) => {
        if (monthlyStats[monthKey]) {
          monthlyStats[monthKey].total++;
          monthlyStats[monthKey].totalTeamSize += interest.teamSize;

          switch (interest.flexibility) {
            case "FIXED":
              monthlyStats[monthKey].fixed++;
              break;
            case "FLEXIBLE":
              monthlyStats[monthKey].flexible++;
              break;
            case "VERY_FLEXIBLE":
              monthlyStats[monthKey].veryFlexible++;
              break;
          }

          monthlyStats[monthKey].interests.push({
            id: interest.id,
            userName: interest.user.name || "Anonymous",
            userEmail: interest.user.email,
            teamSize: interest.teamSize,
            flexibility: interest.flexibility,
            interestType: interest.interestType,
            status: interest.status,
          });
        }
      });
    });

    const summary = Object.entries(monthlyStats).map(([month, stats]) => ({
      month,
      ...stats,
      averageTeamSize:
        stats.total > 0 ? Math.round(stats.totalTeamSize / stats.total) : 0,
    }));

    return NextResponse.json({
      year,
      months: summary,
      totalInterests: interests.length,
    });
  } catch (error) {
    console.error("Error fetching interest summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch interest summary" },
      { status: 500 }
    );
  }
}
