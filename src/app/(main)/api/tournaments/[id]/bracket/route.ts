import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

interface BracketNode {
  matchId?: string;
  round: number;
  position: number;
  homeTeamId?: string;
  awayTeamId?: string;
  nextMatchId?: string;
}

function generateSingleEliminationBracket(teamIds: string[]): BracketNode[] {
  const numTeams = teamIds.length;
  const numRounds = Math.ceil(Math.log2(numTeams));
  const bracketSize = Math.pow(2, numRounds);
  const bracket: BracketNode[] = [];

  const shuffledTeams = [...teamIds].sort(() => Math.random() - 0.5);

  let roundMatches: BracketNode[] = [];

  for (let i = 0; i < bracketSize / 2; i++) {
    const homeTeamId = shuffledTeams[i * 2] || undefined;
    const awayTeamId = shuffledTeams[i * 2 + 1] || undefined;

    if (homeTeamId || awayTeamId) {
      roundMatches.push({
        round: 1,
        position: i,
        homeTeamId,
        awayTeamId,
      });
    }
  }

  bracket.push(...roundMatches);

  for (let round = 2; round <= numRounds; round++) {
    const prevRoundMatches = roundMatches;
    roundMatches = [];

    for (let i = 0; i < prevRoundMatches.length / 2; i++) {
      const match: BracketNode = {
        round,
        position: i,
      };

      if (prevRoundMatches[i * 2]) {
        prevRoundMatches[i * 2].nextMatchId = `pending-${round}-${i}`;
      }
      if (prevRoundMatches[i * 2 + 1]) {
        prevRoundMatches[i * 2 + 1].nextMatchId = `pending-${round}-${i}`;
      }

      roundMatches.push(match);
    }

    bracket.push(...roundMatches);
  }

  return bracket;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await context.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
          orderBy: [{ round: "asc" }, { bracketPosition: "asc" }],
        },
        teams: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      bracketType: event.bracketType,
      bracketData: event.bracketData,
      matches: event.matches,
      teams: event.teams,
    });
  } catch (error) {
    console.error("Error fetching bracket:", error);
    return NextResponse.json(
      { error: "Failed to fetch bracket" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await context.params;
  const { bracketType = "SINGLE_ELIMINATION", division } = await request.json();

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        teams: true,
        club: {
          include: {
            admins: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    const isAdmin =
      user?.role === "SUPER_ADMIN" ||
      event.club?.admins.some((admin) => admin.id === user?.id);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Filter teams by division if specified
    const teamsToUse = division
      ? event.teams.filter((team) => team.division === division)
      : event.teams.filter((team) => !team.division || team.division === "");

    if (teamsToUse.length < 2) {
      const divisionMsg = division ? ` in ${division} division` : "";
      return NextResponse.json(
        { error: `Need at least 2 teams${divisionMsg} to generate bracket` },
        { status: 400 }
      );
    }

    const teamIds = teamsToUse.map((team) => team.id);
    const bracketNodes = generateSingleEliminationBracket(teamIds);

    const createdMatches = await prisma.$transaction(
      bracketNodes.map((node) =>
        prisma.match.create({
          data: {
            eventId,
            homeTeamId: node.homeTeamId,
            awayTeamId: node.awayTeamId,
            division: division || undefined,
            round: node.round.toString(),
            bracketPosition: node.position,
            status: "SCHEDULED",
          },
        })
      )
    );

    const matchIdMap = new Map<string, string>();
    createdMatches.forEach((match, index) => {
      const node = bracketNodes[index];
      if (node.nextMatchId) {
        matchIdMap.set(`${node.round}-${node.position}`, match.id);
      }
    });

    const updates = [];
    for (const [index, match] of createdMatches.entries()) {
      const node = bracketNodes[index];
      if (node.nextMatchId) {
        const [, nextRound, nextPosition] = node.nextMatchId.split("-");
        const nextMatchKey = `${nextRound}-${nextPosition}`;
        const nextMatchId = matchIdMap.get(nextMatchKey);

        if (nextMatchId) {
          updates.push(
            prisma.match.update({
              where: { id: match.id },
              data: { nextMatchId },
            })
          );
        }
      }
    }

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    await prisma.event.update({
      where: { id: eventId },
      data: {
        bracketType: bracketType as
          | "SINGLE_ELIMINATION"
          | "DOUBLE_ELIMINATION"
          | "ROUND_ROBIN"
          | "GROUP_STAGE",
        bracketData: JSON.stringify(bracketNodes),
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      message: "Bracket generated successfully",
      matchesCreated: createdMatches.length,
    });
  } catch (error) {
    console.error("Error generating bracket:", error);
    return NextResponse.json(
      { error: "Failed to generate bracket" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await context.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: {
          include: {
            admins: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    const isAdmin =
      user?.role === "SUPER_ADMIN" ||
      event.club?.admins.some((admin) => admin.id === user?.id);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.match.deleteMany({
      where: { eventId },
    });

    await prisma.event.update({
      where: { id: eventId },
      data: {
        bracketType: null,
        bracketData: undefined,
      },
    });

    return NextResponse.json({
      message: "Bracket deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bracket:", error);
    return NextResponse.json(
      { error: "Failed to delete bracket" },
      { status: 500 }
    );
  }
}
