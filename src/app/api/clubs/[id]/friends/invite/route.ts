import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { sendBulkEmail } from "@/lib/email";
import { generateFriendInvitationEmail } from "@/lib/email-templates";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: clubId } = await context.params;

  try {
    // Check if user is admin of this club or super admin
    const club = await prisma.club.findFirst({
      where: {
        id: clubId,
        OR: [
          { admins: { some: { id: session.user.id } } },
          { id: session.user.role === "SUPER_ADMIN" ? clubId : undefined },
        ],
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        location: true,
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { friendClubIds, message, eventId } = await req.json();

    if (
      !friendClubIds ||
      !Array.isArray(friendClubIds) ||
      friendClubIds.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one friend club ID is required" },
        { status: 400 }
      );
    }

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get event details if provided
    let event = null;
    if (eventId) {
      event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          location: true,
          eventType: true,
          imageUrl: true,
        },
      });
    }

    // Get friend clubs with admin emails
    const friendClubs = await prisma.club.findMany({
      where: {
        id: { in: friendClubIds },
      },
      select: {
        id: true,
        name: true,
        location: true,
        admins: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (friendClubs.length === 0) {
      return NextResponse.json(
        { error: "No valid friend clubs found" },
        { status: 404 }
      );
    }

    // Collect all admin emails from friend clubs
    const personalizations: Array<{
      to: string;
      substitutions: Record<string, string>;
    }> = [];

    const baseUrl = process.env.NEXTAUTH_URL || "https://playaway.ie";

    for (const friendClub of friendClubs) {
      for (const admin of friendClub.admins) {
        personalizations.push({
          to: admin.email,
          substitutions: {
            recipientName: admin.name || "Club Admin",
            recipientClubName: friendClub.name,
          },
        });
      }
    }

    if (personalizations.length === 0) {
      return NextResponse.json(
        { error: "No admin email addresses found for selected clubs" },
        { status: 400 }
      );
    }

    // Generate email content
    const emailData = generateFriendInvitationEmail({
      senderClubName: club.name,
      senderClubLocation: club.location,
      senderClubImageUrl: club.imageUrl,
      senderName: session.user.name || "Club Admin",
      message: message.trim(),
      event: event
        ? {
            title: event.title,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate?.toISOString() || null,
            location: event.location,
            eventType: event.eventType,
            eventUrl: `${baseUrl}/events/${event.id}`,
          }
        : null,
      baseUrl,
    });

    // Send emails
    const success = await sendBulkEmail({
      personalizations,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send some or all invitations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Invitations sent successfully",
      sentTo: personalizations.length,
      clubsNotified: friendClubs.length,
    });
  } catch (error) {
    console.error("Error sending friend invitations:", error);
    return NextResponse.json(
      { error: "Failed to send invitations" },
      { status: 500 }
    );
  }
}
