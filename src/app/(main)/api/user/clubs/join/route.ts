import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clubId } = body;

    if (!clubId) {
      return NextResponse.json(
        { error: "Club ID is required" },
        { status: 400 }
      );
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.clubId === clubId && user.isClubMember) {
      return NextResponse.json(
        { error: "You are already a member of this club" },
        { status: 409 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        clubId: clubId,
        isClubMember: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully joined ${club.name}`,
    });
  } catch (error) {
    console.error("Error joining club:", error);
    return NextResponse.json({ error: "Failed to join club" }, { status: 500 });
  }
}
