import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getCalendarPermissions } from "@/lib/calendar/permissions";
import { z } from "zod";

const submitInterestSchema = z.object({
  clubId: z.string(),
  date: z.string().datetime(),
  preferredLocation: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!clubId) {
      return NextResponse.json({ error: "Club ID is required" }, { status: 400 });
    }

    const permissions = await getCalendarPermissions(session?.user?.id || null, clubId);

    if (!permissions.canViewCalendar) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const where: { clubId: string; date?: { gte: Date; lte: Date } } = { clubId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Check if there are any blocked weekends
    const blockedWeekends = await prisma.blockedWeekend.findMany({
      where: {
        clubId,
        startDate: { lte: endDate ? new Date(endDate) : undefined },
        endDate: { gte: startDate ? new Date(startDate) : undefined },
      },
    });

    const interests = await prisma.calendarInterest.findMany({
      where,
      orderBy: { date: "asc" },
    });

    // Group interests by date and calculate totals
    const interestsByDate = interests.reduce((acc, interest) => {
      const dateKey = interest.date.toISOString().split("T")[0];

      // Check if this date is blocked
      const isBlocked = blockedWeekends.some((blocked) =>
        interest.date >= blocked.startDate && interest.date <= blocked.endDate
      );

      if (isBlocked) return acc;

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: interest.date,
          totalSubmissions: 0,
          uniqueUsers: new Set(),
          locations: [],
          userIds: permissions.canViewInterestIdentities ? new Set() : undefined,
        };
      }

      acc[dateKey].totalSubmissions += interest.submissionCount;
      acc[dateKey].uniqueUsers.add(interest.userId);

      if (interest.preferredLocation) {
        acc[dateKey].locations.push(interest.preferredLocation);
      }

      // Store user IDs for later lookup
      if (permissions.canViewInterestIdentities) {
        acc[dateKey].userIds.add(interest.userId);
      }

      return acc;
    }, {} as Record<string, { count: number; userIds: Set<string> }>);

    // Get user details for superadmins (if needed)
    const formattedInterests = await Promise.all(
      Object.values(interestsByDate).map(async (item: { count: number; userIds: Set<string> }) => {
        let users = undefined;

        if (permissions.canViewInterestIdentities && item.userIds) {
          users = await prisma.user.findMany({
            where: { id: { in: Array.from(item.userIds) } },
            select: { id: true, name: true, email: true },
          });
        }

        return {
          date: item.date,
          totalSubmissions: item.totalSubmissions,
          uniqueUsers: item.uniqueUsers.size,
          locations: [...new Set(item.locations)],
          users,
        };
      })
    );

    return NextResponse.json(formattedInterests);
  } catch (error) {
    console.error("Error fetching calendar interests:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar interests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = submitInterestSchema.parse(body);

    const permissions = await getCalendarPermissions(session.user.id, validatedData.clubId);

    if (!permissions.canSubmitInterest) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if the date is blocked
    const blockedWeekend = await prisma.blockedWeekend.findFirst({
      where: {
        clubId: validatedData.clubId,
        startDate: { lte: new Date(validatedData.date) },
        endDate: { gte: new Date(validatedData.date) },
      },
    });

    if (blockedWeekend) {
      return NextResponse.json(
        { error: "This date has been blocked by the club" },
        { status: 400 }
      );
    }

    // Check if user already expressed interest for this date
    const existingInterest = await prisma.calendarInterest.findUnique({
      where: {
        clubId_userId_date: {
          clubId: validatedData.clubId,
          userId: session.user.id,
          date: new Date(validatedData.date),
        },
      },
    });

    let interest;
    if (existingInterest) {
      // Increment submission count
      interest = await prisma.calendarInterest.update({
        where: { id: existingInterest.id },
        data: {
          submissionCount: { increment: 1 },
          preferredLocation: validatedData.preferredLocation || existingInterest.preferredLocation,
        },
      });
    } else {
      // Create new interest
      interest = await prisma.calendarInterest.create({
        data: {
          clubId: validatedData.clubId,
          userId: session.user.id,
          date: new Date(validatedData.date),
          preferredLocation: validatedData.preferredLocation,
          submissionCount: 1,
          isAnonymous: false, // Will be true when viewed by club admins
        },
      });
    }

    return NextResponse.json(interest, { status: 201 });
  } catch (error) {
    console.error("Error submitting calendar interest:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit calendar interest" },
      { status: 500 }
    );
  }
}