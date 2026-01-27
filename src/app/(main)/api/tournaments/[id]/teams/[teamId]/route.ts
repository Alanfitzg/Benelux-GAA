import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// PATCH /api/tournaments/[id]/teams/[teamId] - Update team status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  const { teamId } = await params;
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Get the team to check authorization
    const team = await prisma.tournamentTeam.findUnique({
      where: { id: teamId },
      include: { club: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Validate user is authorized
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { adminOfClubs: true },
    });

    const isClubAdmin = user?.adminOfClubs.some(
      (club) => club.id === team.clubId
    );
    if (!isClubAdmin && user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Not authorized to update this team" },
        { status: 403 }
      );
    }

    // Update team status
    const updatedTeam = await prisma.tournamentTeam.update({
      where: { id: teamId },
      data: { status },
      include: { club: true },
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    );
  }
}

// DELETE /api/tournaments/[id]/teams/[teamId] - Withdraw a team
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  const { teamId } = await params;
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the team to check authorization
    const team = await prisma.tournamentTeam.findUnique({
      where: { id: teamId },
      include: { club: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Validate user is authorized
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { adminOfClubs: true },
    });

    const isClubAdmin = user?.adminOfClubs.some(
      (club) => club.id === team.clubId
    );
    if (!isClubAdmin && user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Not authorized to withdraw this team" },
        { status: 403 }
      );
    }

    // Check if team has any matches
    const matches = await prisma.match.count({
      where: {
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        status: { not: "CANCELLED" },
      },
    });

    if (matches > 0) {
      // Mark as withdrawn instead of deleting
      const withdrawnTeam = await prisma.tournamentTeam.update({
        where: { id: teamId },
        data: { status: "WITHDRAWN" },
        include: { club: true },
      });
      return NextResponse.json(withdrawnTeam);
    }

    // If no matches, safe to delete
    await prisma.tournamentTeam.delete({
      where: { id: teamId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error withdrawing team:", error);
    return NextResponse.json(
      { error: "Failed to withdraw team" },
      { status: 500 }
    );
  }
}
