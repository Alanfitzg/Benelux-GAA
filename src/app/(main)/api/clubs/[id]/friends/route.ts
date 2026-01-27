import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import type { FriendClub } from "@/types";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const club = await prisma.club.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Get clubs that registered for events hosted by this club (auto-derived)
    const autoFriends = await prisma.tournamentTeam.findMany({
      where: {
        event: {
          clubId: id,
        },
        clubId: {
          not: id,
        },
      },
      select: {
        clubId: true,
        registeredAt: true,
        club: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            location: true,
          },
        },
      },
    });

    // Group auto-derived friends by club and count visits
    const autoFriendsMap = new Map<
      string,
      {
        club: (typeof autoFriends)[0]["club"];
        visitCount: number;
        lastVisitYear: number;
      }
    >();

    for (const team of autoFriends) {
      const existing = autoFriendsMap.get(team.clubId);
      const visitYear = new Date(team.registeredAt).getFullYear();

      if (existing) {
        existing.visitCount += 1;
        if (visitYear > existing.lastVisitYear) {
          existing.lastVisitYear = visitYear;
        }
      } else {
        autoFriendsMap.set(team.clubId, {
          club: team.club,
          visitCount: 1,
          lastVisitYear: visitYear,
        });
      }
    }

    // Get manually added friends
    const manualFriends = await prisma.clubFriend.findMany({
      where: { clubId: id },
      include: {
        friendClub: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            location: true,
          },
        },
      },
    });

    // Combine and deduplicate (manual friends take precedence)
    const manualFriendIds = new Set(manualFriends.map((f) => f.friendClubId));

    const friends: FriendClub[] = [];

    // Add manual friends first
    for (const mf of manualFriends) {
      const autoData = autoFriendsMap.get(mf.friendClubId);
      friends.push({
        id: mf.friendClub.id,
        name: mf.friendClub.name,
        imageUrl: mf.friendClub.imageUrl,
        location: mf.friendClub.location,
        visitCount: autoData?.visitCount || 1,
        lastVisitYear: mf.visitYear || autoData?.lastVisitYear || null,
        isManual: true,
      });
    }

    // Add auto-derived friends (that weren't manually added)
    for (const [clubId, data] of autoFriendsMap) {
      if (!manualFriendIds.has(clubId)) {
        friends.push({
          id: data.club.id,
          name: data.club.name,
          imageUrl: data.club.imageUrl,
          location: data.club.location,
          visitCount: data.visitCount,
          lastVisitYear: data.lastVisitYear,
          isManual: false,
        });
      }
    }

    // Sort by visit count (most visits first)
    friends.sort((a, b) => b.visitCount - a.visitCount);

    return NextResponse.json({ friends });
  } catch (error) {
    console.error("Error fetching club friends:", error);
    return NextResponse.json(
      { error: "Error fetching friends" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    // Check if user is admin of this club or super admin
    const club = await prisma.club.findFirst({
      where: {
        id,
        OR: [
          { admins: { some: { id: session.user.id } } },
          { id: session.user.role === "SUPER_ADMIN" ? id : undefined },
        ],
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { friendClubId, visitYear, notes } = await req.json();

    if (!friendClubId) {
      return NextResponse.json(
        { error: "Friend club ID is required" },
        { status: 400 }
      );
    }

    if (friendClubId === id) {
      return NextResponse.json(
        { error: "Cannot add club as friend of itself" },
        { status: 400 }
      );
    }

    // Check if friend club exists
    const friendClub = await prisma.club.findUnique({
      where: { id: friendClubId },
    });

    if (!friendClub) {
      return NextResponse.json(
        { error: "Friend club not found" },
        { status: 404 }
      );
    }

    // Create the friend relationship
    const clubFriend = await prisma.clubFriend.create({
      data: {
        clubId: id,
        friendClubId,
        visitYear: visitYear || null,
        notes: notes || null,
      },
      include: {
        friendClub: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(clubFriend, { status: 201 });
  } catch (error: unknown) {
    console.error("Error adding club friend:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This club is already a friend" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Error adding friend" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { searchParams } = new URL(req.url);
  const friendClubId = searchParams.get("friendClubId");

  if (!friendClubId) {
    return NextResponse.json(
      { error: "Friend club ID is required" },
      { status: 400 }
    );
  }

  try {
    // Check if user is admin of this club or super admin
    const club = await prisma.club.findFirst({
      where: {
        id,
        OR: [
          { admins: { some: { id: session.user.id } } },
          { id: session.user.role === "SUPER_ADMIN" ? id : undefined },
        ],
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.clubFriend.delete({
      where: {
        clubId_friendClubId: {
          clubId: id,
          friendClubId,
        },
      },
    });

    return NextResponse.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing club friend:", error);
    return NextResponse.json(
      { error: "Error removing friend" },
      { status: 500 }
    );
  }
}
