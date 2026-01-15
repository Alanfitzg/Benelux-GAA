import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: clubId } = await params;

  // Check if user is admin of this club or super admin
  const club = await prisma.club.findFirst({
    where: {
      id: clubId,
      OR: [
        { admins: { some: { id: session.user.id } } },
        ...(session.user.role === "SUPER_ADMIN" ? [{ id: clubId }] : []),
      ],
    },
    select: { id: true },
  });

  if (!club) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "active";
  const type = searchParams.get("type");

  const whereClause: {
    clubId: string;
    isArchived?: boolean;
    type?: string;
  } = { clubId };

  if (filter === "active") {
    whereClause.isArchived = false;
  } else if (filter === "archived") {
    whereClause.isArchived = true;
  }

  if (type && type !== "all") {
    whereClause.type = type;
  }

  const [inquiries, counts] = await Promise.all([
    prisma.clubInterest.findMany({
      where: whereClause,
      orderBy: { submittedAt: "desc" },
    }),
    prisma.clubInterest.groupBy({
      by: ["isRead", "isArchived"],
      where: { clubId },
      _count: true,
    }),
  ]);

  // Calculate unread count
  const unreadCount =
    counts.find((c) => !c.isRead && !c.isArchived)?._count || 0;
  const totalActive = counts
    .filter((c) => !c.isArchived)
    .reduce((sum, c) => sum + c._count, 0);
  const totalArchived = counts
    .filter((c) => c.isArchived)
    .reduce((sum, c) => sum + c._count, 0);

  return NextResponse.json({
    inquiries,
    stats: {
      unread: unreadCount,
      active: totalActive,
      archived: totalArchived,
    },
  });
}
