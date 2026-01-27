import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { ggeTeamRegistrationConfirmation } from "@/lib/gge-email-templates";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();

    const {
      clubName,
      contactName,
      contactEmail,
      contactPhone,
      numberOfPlayers,
      additionalNotes,
    } = body;

    if (
      !clubName ||
      !contactName ||
      !contactEmail ||
      !contactPhone ||
      !numberOfPlayers
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await prisma.socialGAAEvent.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: "CONFIRMED" },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Event is not accepting registrations" },
        { status: 400 }
      );
    }

    const confirmedCount = await prisma.socialGAARegistration.count({
      where: {
        eventId,
        status: "CONFIRMED",
      },
    });

    const status =
      confirmedCount >= event.maxTeams ? "WAITING_LIST" : "CONFIRMED";

    const registration = await prisma.socialGAARegistration.create({
      data: {
        clubName,
        contactName,
        contactEmail,
        contactPhone,
        numberOfPlayers: parseInt(numberOfPlayers.toString()),
        additionalNotes: additionalNotes || null,
        status,
        eventId,
      },
    });

    // Send confirmation email
    try {
      const emailContent = ggeTeamRegistrationConfirmation({
        clubName,
        contactName,
        eventType: event.eventType,
        eventLocation: event.location,
        eventDate: formatDate(event.proposedDate),
        venueName: event.venueName,
        hostClubName: event.clubName,
        status: status as "CONFIRMED" | "WAITING_LIST",
      });

      await sendEmail({
        to: contactEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    console.error("Error creating GGE registration:", error);
    return NextResponse.json(
      { error: "Failed to submit registration" },
      { status: 500 }
    );
  }
}
