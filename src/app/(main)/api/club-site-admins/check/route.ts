import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ isAdmin: false });
  }

  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "clubId is required" }, { status: 400 });
  }

  // SUPER_ADMIN always has access
  if (session.user.role === "SUPER_ADMIN") {
    return NextResponse.json({ isAdmin: true, role: "SUPER_ADMIN" });
  }

  // Check ClubSiteAdmin table
  const clubAdmin = await prisma.clubSiteAdmin.findUnique({
    where: {
      clubId_email: {
        clubId,
        email: session.user.email.toLowerCase(),
      },
    },
  });

  return NextResponse.json({
    isAdmin: !!clubAdmin,
    role: clubAdmin ? "CLUB_SITE_ADMIN" : null,
  });
}
