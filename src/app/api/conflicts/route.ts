import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";
import { ConflictStatus, ConflictPriority, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ConflictStatus | null;
    const priority = searchParams.get("priority") as ConflictPriority | null;
    const clubId = searchParams.get("clubId");

    const where: Prisma.ConflictWhereInput = {};

    if (status && Object.values(ConflictStatus).includes(status)) {
      where.status = status;
    }

    if (priority && Object.values(ConflictPriority).includes(priority)) {
      where.priority = priority;
    }

    if (clubId) {
      where.OR = [{ complainantClubId: clubId }, { respondentClubId: clubId }];
    }

    const conflicts = await prisma.conflict.findMany({
      where,
      include: {
        review: {
          select: {
            id: true,
            rating: true,
            complaint: true,
            submittedAt: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
          },
        },
        complainantClub: {
          select: {
            id: true,
            name: true,
          },
        },
        respondentClub: {
          select: {
            id: true,
            name: true,
          },
        },
        resolver: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ conflicts });
  } catch (error) {
    console.error("Error fetching conflicts:", error);
    return NextResponse.json(
      { error: "An error occurred fetching conflicts" },
      { status: 500 }
    );
  }
}
