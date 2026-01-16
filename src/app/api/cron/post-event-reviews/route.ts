import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPostEventReviewEmail } from "@/lib/emails/post-event-review-email";
import crypto from "crypto";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedEvents = await prisma.event.findMany({
      where: {
        OR: [
          {
            endDate: {
              gte: yesterday,
              lt: today,
            },
          },
          {
            endDate: null,
            startDate: {
              gte: yesterday,
              lt: today,
            },
          },
        ],
      },
      include: {
        club: {
          include: {
            admins: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        teams: {
          include: {
            club: {
              include: {
                admins: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let tokensSent = 0;
    let emailsSent = 0;
    const errors: string[] = [];

    for (const event of completedEvents) {
      const hostClub = event.club;
      if (!hostClub) continue;

      const participatingClubs = event.teams
        .map((team) => team.club)
        .filter((club): club is NonNullable<typeof club> => club !== null)
        .filter(
          (club, index, self) =>
            self.findIndex((c) => c.id === club.id) === index
        )
        .filter((club) => club.id !== hostClub.id);

      const eventDate = event.startDate.toLocaleDateString("en-IE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      for (const travellingClub of participatingClubs) {
        const existingHostToTraveller = await prisma.reviewToken.findFirst({
          where: {
            eventId: event.id,
            reviewerClubId: hostClub.id,
            targetClubId: travellingClub.id,
          },
        });

        if (!existingHostToTraveller) {
          const rawToken = crypto.randomBytes(32).toString("hex");
          const hashedToken = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

          await prisma.reviewToken.create({
            data: {
              token: hashedToken,
              eventId: event.id,
              reviewerClubId: hostClub.id,
              targetClubId: travellingClub.id,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
          tokensSent++;

          for (const admin of hostClub.admins) {
            if (admin.email) {
              const result = await sendPostEventReviewEmail({
                to: admin.email,
                recipientName: admin.name || "Club Admin",
                recipientClubName: hostClub.name,
                eventTitle: event.title,
                eventDate,
                eventLocation: event.location,
                targetClubName: travellingClub.name,
                reviewToken: rawToken,
              });

              if (result.success) {
                emailsSent++;
              } else {
                errors.push(
                  `Failed to send to ${admin.email}: ${result.error}`
                );
              }
            }
          }
        }

        const existingTravellerToHost = await prisma.reviewToken.findFirst({
          where: {
            eventId: event.id,
            reviewerClubId: travellingClub.id,
            targetClubId: hostClub.id,
          },
        });

        if (!existingTravellerToHost) {
          const rawToken = crypto.randomBytes(32).toString("hex");
          const hashedToken = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

          await prisma.reviewToken.create({
            data: {
              token: hashedToken,
              eventId: event.id,
              reviewerClubId: travellingClub.id,
              targetClubId: hostClub.id,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
          tokensSent++;

          for (const admin of travellingClub.admins) {
            if (admin.email) {
              const result = await sendPostEventReviewEmail({
                to: admin.email,
                recipientName: admin.name || "Club Admin",
                recipientClubName: travellingClub.name,
                eventTitle: event.title,
                eventDate,
                eventLocation: event.location,
                targetClubName: hostClub.name,
                reviewToken: rawToken,
              });

              if (result.success) {
                emailsSent++;
              } else {
                errors.push(
                  `Failed to send to ${admin.email}: ${result.error}`
                );
              }
            }
          }
        }
      }
    }

    console.log(
      `Post-event review cron: ${completedEvents.length} events, ${tokensSent} tokens created, ${emailsSent} emails sent`
    );

    return NextResponse.json({
      success: true,
      eventsProcessed: completedEvents.length,
      tokensCreated: tokensSent,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "An error occurred processing post-event reviews" },
      { status: 500 }
    );
  }
}
