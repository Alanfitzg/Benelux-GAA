import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingCount = await prisma.event.count({
      where: {
        appealStatus: "PENDING",
      },
    });

    return NextResponse.json({ total: pendingCount });
  } catch (error) {
    console.error("Error fetching appeal stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch appeal stats" },
      { status: 500 }
    );
  }
}
