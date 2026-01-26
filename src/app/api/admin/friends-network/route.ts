import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all ClubFriend relationships (Friends)
    const friendships = await prisma.clubFriend.findMany({
      include: {
        club: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            location: true,
          },
        },
        friendClub: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all Twin Club relationships
    const twinRelationships = await prisma.club.findMany({
      where: {
        twinClubId: { not: null },
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        location: true,
        twinClub: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            location: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format friends data
    const friends = friendships.map((f) => ({
      id: f.id,
      club: f.club,
      friendClub: f.friendClub,
      visitYear: f.visitYear,
      notes: f.notes,
      createdAt: f.createdAt,
    }));

    // Format twin clubs data
    const twinClubs = twinRelationships.map((club) => ({
      club: {
        id: club.id,
        name: club.name,
        imageUrl: club.imageUrl,
        location: club.location,
      },
      twinClub: club.twinClub,
    }));

    // Calculate stats
    const uniqueClubsWithFriends = new Set([
      ...friendships.map((f) => f.clubId),
      ...friendships.map((f) => f.friendClubId),
    ]);

    // Calculate most connected clubs (clubs with most friends)
    const clubConnectionCounts: Record<
      string,
      { club: (typeof friends)[0]["club"]; count: number }
    > = {};

    friendships.forEach((f) => {
      // Count for the club
      if (!clubConnectionCounts[f.clubId]) {
        clubConnectionCounts[f.clubId] = { club: f.club, count: 0 };
      }
      clubConnectionCounts[f.clubId].count++;

      // Count for the friend club
      if (!clubConnectionCounts[f.friendClubId]) {
        clubConnectionCounts[f.friendClubId] = { club: f.friendClub, count: 0 };
      }
      clubConnectionCounts[f.friendClubId].count++;
    });

    const mostConnectedClubs = Object.values(clubConnectionCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate strongest relationships (clubs that have visited each other multiple times)
    // Group by club pair to find repeat visits
    const pairVisits: Record<
      string,
      {
        clubs: [(typeof friends)[0]["club"], (typeof friends)[0]["club"]];
        visits: number;
        years: number[];
      }
    > = {};

    friendships.forEach((f) => {
      // Create a consistent key for the pair (alphabetically sorted by id)
      const pairKey = [f.clubId, f.friendClubId].sort().join("-");

      if (!pairVisits[pairKey]) {
        pairVisits[pairKey] = {
          clubs: [f.club, f.friendClub],
          visits: 0,
          years: [],
        };
      }
      pairVisits[pairKey].visits++;
      if (f.visitYear) {
        pairVisits[pairKey].years.push(f.visitYear);
      }
    });

    const strongestRelationships = Object.values(pairVisits)
      .filter((p) => p.visits > 1) // Only pairs with multiple visits
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10)
      .map((p) => ({
        ...p,
        years: [...new Set(p.years)].sort(),
      }));

    return NextResponse.json({
      friends: {
        total: friends.length,
        uniqueClubs: uniqueClubsWithFriends.size,
        relationships: friends,
      },
      twinClubs: {
        total: twinClubs.length,
        relationships: twinClubs,
      },
      leaderboards: {
        mostConnected: mostConnectedClubs,
        strongestRelationships: strongestRelationships,
      },
    });
  } catch (error) {
    console.error("Error fetching friends network:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends network data" },
      { status: 500 }
    );
  }
}
