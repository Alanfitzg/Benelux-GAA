import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const interestSchema = z.object({
  interestType: z.enum([
    "SPECIFIC_DATE",
    "ENTIRE_MONTH",
    "DATE_RANGE",
    "MULTIPLE_MONTHS",
  ]),
  specificDate: z.string().optional(),
  months: z.array(z.string()).optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  teamSize: z.number().min(1),
  teamType: z.string().optional(),
  flexibility: z
    .enum(["FIXED", "FLEXIBLE", "VERY_FLEXIBLE"])
    .default("FLEXIBLE"),
  message: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    const where: Prisma.TournamentInterestWhereInput = {
      clubId: id,
    };

    if (status) {
      where.status = status as
        | "PENDING"
        | "IN_DISCUSSION"
        | "APPROVED"
        | "REJECTED"
        | "CANCELLED";
    }

    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      where.OR = [
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
      ];
    }

    const interests = await prisma.tournamentInterest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(interests);
  } catch (error) {
    console.error("Error fetching tournament interests:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournament interests" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = interestSchema.parse(body);

    const interestData: Prisma.TournamentInterestCreateInput = {
      user: {
        connect: { id: session.user.id },
      },
      club: {
        connect: { id },
      },
      interestType: validatedData.interestType as
        | "SPECIFIC_DATE"
        | "ENTIRE_MONTH"
        | "DATE_RANGE"
        | "MULTIPLE_MONTHS",
      teamSize: validatedData.teamSize,
      teamType: validatedData.teamType,
      flexibility: validatedData.flexibility as
        | "FIXED"
        | "FLEXIBLE"
        | "VERY_FLEXIBLE",
      message: validatedData.message,
    };

    if (
      validatedData.interestType === "SPECIFIC_DATE" &&
      validatedData.specificDate
    ) {
      interestData.specificDate = new Date(validatedData.specificDate);
    } else if (
      validatedData.interestType === "ENTIRE_MONTH" &&
      validatedData.months?.[0]
    ) {
      interestData.monthYear = new Date(validatedData.months[0] + "-01");
    } else if (
      validatedData.interestType === "MULTIPLE_MONTHS" &&
      validatedData.months
    ) {
      interestData.monthYear = new Date(validatedData.months[0] + "-01");
    } else if (validatedData.interestType === "DATE_RANGE") {
      if (validatedData.dateRangeStart) {
        interestData.dateRangeStart = new Date(validatedData.dateRangeStart);
      }
      if (validatedData.dateRangeEnd) {
        interestData.dateRangeEnd = new Date(validatedData.dateRangeEnd);
      }
    }

    const interest = await prisma.tournamentInterest.create({
      data: interestData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        club: {
          select: {
            name: true,
            contactEmail: true,
          },
        },
      },
    });

    return NextResponse.json(interest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating tournament interest:", error);
    return NextResponse.json(
      { error: "Failed to create tournament interest" },
      { status: 500 }
    );
  }
}
