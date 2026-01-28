import { NextRequest, NextResponse } from "next/server";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function createInterestHandler(request: NextRequest) {
  try {
    const body = await request.json();

    // Check honeypot field - if filled, it's a bot
    if (body.website && body.website.length > 0) {
      // Silently reject but return success to not alert the bot
      return NextResponse.json({ id: "fake-id", success: true });
    }

    const session = await auth();

    // If user is logged in and is a club admin, attach their club info to the interest
    let applicantClubId: string | undefined;
    let applicantClubName: string | undefined;

    if (session?.user?.id) {
      // Find if the user is an admin of any club
      const adminClub = await prisma.club.findFirst({
        where: {
          admins: {
            some: {
              id: session.user.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (adminClub) {
        applicantClubId = adminClub.id;
        applicantClubName = adminClub.name;
      }
    }

    const interest = await prisma.interest.create({
      data: {
        eventId: body.eventId,
        name: body.name,
        email: body.email,
        message: body.message || null,
        applicantClubId,
        applicantClubName,
      },
    });
    return NextResponse.json(interest);
  } catch (error) {
    console.error("Error creating interest:", error);
    return NextResponse.json(
      { error: "Failed to submit interest" },
      { status: 500 }
    );
  }
}

// Apply rate limiting to interest form
export const POST = withRateLimit(RATE_LIMITS.FORMS, createInterestHandler);
