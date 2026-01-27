import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

export async function GET() {
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

    const [openCount, inProgressCount, awaitingResponseCount, totalCount] =
      await Promise.all([
        prisma.conflict.count({ where: { status: "OPEN" } }),
        prisma.conflict.count({ where: { status: "IN_PROGRESS" } }),
        prisma.conflict.count({ where: { status: "AWAITING_RESPONSE" } }),
        prisma.conflict.count({
          where: {
            status: { in: ["OPEN", "IN_PROGRESS", "AWAITING_RESPONSE"] },
          },
        }),
      ]);

    return NextResponse.json({
      open: openCount,
      inProgress: inProgressCount,
      awaitingResponse: awaitingResponseCount,
      total: totalCount,
    });
  } catch (error) {
    console.error("Error fetching conflict stats:", error);
    return NextResponse.json(
      { error: "An error occurred fetching conflict stats" },
      { status: 500 }
    );
  }
}
