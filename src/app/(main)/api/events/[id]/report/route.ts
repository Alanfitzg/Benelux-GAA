import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ParticipatingTeamSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  clubName: z.string(),
  finalPosition: z.number().optional(),
});

const MatchResultSchema = z.object({
  matchId: z.string().optional(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  homeScore: z.number(),
  awayScore: z.number(),
  round: z.string().optional(),
});

const PlayerAwardSchema = z.object({
  awardType: z.string(),
  playerName: z.string(),
  teamName: z.string(),
});

const EventReportSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  winnerTeamId: z.string().optional().nullable(),
  runnerUpTeamId: z.string().optional().nullable(),
  thirdPlaceTeamId: z.string().optional().nullable(),
  participatingTeams: z.array(ParticipatingTeamSchema).optional().nullable(),
  matchResults: z.array(MatchResultSchema).optional().nullable(),
  playerAwards: z.array(PlayerAwardSchema).optional().nullable(),
  amenitiesProvided: z.string().optional().nullable(),
  eventHighlights: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;

  try {
    const report = await prisma.eventReport.findUnique({
      where: { eventId },
      include: {
        event: {
          select: {
            title: true,
            eventType: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        winnerTeam: {
          include: {
            club: true,
          },
        },
        runnerUpTeam: {
          include: {
            club: true,
          },
        },
        thirdPlaceTeam: {
          include: {
            club: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const session = await getServerSession();
    const isDraft = report.status === "DRAFT";

    if (isDraft && !session?.user?.email) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (isDraft && session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { adminOfClubs: true },
      });

      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { clubId: true },
      });

      const isClubAdmin = user?.adminOfClubs.some(
        (club) => club.id === event?.clubId
      );
      const isSuperAdmin = user?.role === "SUPER_ADMIN";

      if (!isClubAdmin && !isSuperAdmin) {
        return NextResponse.json(
          { error: "Report not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching event report:", error);
    return NextResponse.json(
      { error: "Failed to fetch event report" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;

  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { adminOfClubs: true },
    });

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { club: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isClubAdmin = user?.adminOfClubs.some(
      (club) => club.id === event.clubId
    );
    const isSuperAdmin = user?.role === "SUPER_ADMIN";

    if (!isClubAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Unauthorized to create report for this event" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = EventReportSchema.parse(body);

    const existingReport = await prisma.eventReport.findUnique({
      where: { eventId },
    });

    let report;

    if (existingReport) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        status: validatedData.status,
        summary: validatedData.summary,
        amenitiesProvided: validatedData.amenitiesProvided,
        eventHighlights: validatedData.eventHighlights,
        participatingTeams: validatedData.participatingTeams,
        matchResults: validatedData.matchResults,
        playerAwards: validatedData.playerAwards,
        publishedAt:
          validatedData.status === "PUBLISHED" && !existingReport.publishedAt
            ? new Date()
            : existingReport.publishedAt,
      };

      // Only update winner/runner-up/third place team IDs if they are provided
      if (validatedData.winnerTeamId !== undefined) {
        updateData.winnerTeamId = validatedData.winnerTeamId;
      }
      if (validatedData.runnerUpTeamId !== undefined) {
        updateData.runnerUpTeamId = validatedData.runnerUpTeamId;
      }
      if (validatedData.thirdPlaceTeamId !== undefined) {
        updateData.thirdPlaceTeamId = validatedData.thirdPlaceTeamId;
      }

      report = await prisma.eventReport.update({
        where: { eventId },
        data: updateData,
        include: {
          event: true,
          creator: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createData: any = {
        eventId,
        createdBy: user!.id,
        status: validatedData.status,
        winnerTeamId: validatedData.winnerTeamId || null,
        runnerUpTeamId: validatedData.runnerUpTeamId || null,
        thirdPlaceTeamId: validatedData.thirdPlaceTeamId || null,
        participatingTeams: validatedData.participatingTeams || undefined,
        matchResults: validatedData.matchResults || undefined,
        playerAwards: validatedData.playerAwards || undefined,
        amenitiesProvided: validatedData.amenitiesProvided || null,
        eventHighlights: validatedData.eventHighlights || null,
        summary: validatedData.summary || null,
        publishedAt: validatedData.status === "PUBLISHED" ? new Date() : null,
      };

      report = await prisma.eventReport.create({
        data: createData,
        include: {
          event: true,
          creator: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error creating/updating event report:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data provided", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save event report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;

  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { adminOfClubs: true },
    });

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { clubId: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isClubAdmin = user?.adminOfClubs.some(
      (club) => club.id === event.clubId
    );
    const isSuperAdmin = user?.role === "SUPER_ADMIN";

    if (!isClubAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Unauthorized to delete report for this event" },
        { status: 403 }
      );
    }

    const report = await prisma.eventReport.findUnique({
      where: { eventId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    await prisma.eventReport.delete({
      where: { eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event report:", error);
    return NextResponse.json(
      { error: "Failed to delete event report" },
      { status: 500 }
    );
  }
}
