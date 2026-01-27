import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { ggeHostApplicationConfirmation } from "@/lib/gge-email-templates";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = status
      ? { status: status as "PENDING" | "APPROVED" | "REJECTED" }
      : {};

    const events = await prisma.socialGAAEvent.findMany({
      where,
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: {
        proposedDate: "asc",
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching GGE events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      clubName,
      contactName,
      contactEmail,
      contactPhone,
      eventType,
      proposedDate,
      location,
      venueName,
      venueDetails,
      numberOfPitches,
      maxTeams,
      foodOptions,
      accommodationOptions,
      localAttractions,
      additionalNotes,
    } = body;

    if (
      !clubName ||
      !contactName ||
      !contactEmail ||
      !contactPhone ||
      !eventType ||
      !proposedDate ||
      !location ||
      !venueName ||
      !maxTeams
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(proposedDate);

    const event = await prisma.socialGAAEvent.create({
      data: {
        clubName,
        contactName,
        contactEmail,
        contactPhone,
        eventType,
        proposedDate: parsedDate,
        location,
        venueName,
        venueDetails: venueDetails || null,
        numberOfPitches: numberOfPitches || 1,
        maxTeams: parseInt(maxTeams),
        foodOptions: foodOptions || null,
        accommodationOptions: accommodationOptions || null,
        localAttractions: localAttractions || null,
        additionalNotes: additionalNotes || null,
        status: "PENDING",
      },
    });

    // Send confirmation email to host
    try {
      const emailContent = ggeHostApplicationConfirmation({
        clubName,
        contactName,
        eventType,
        proposedDate: formatDate(parsedDate),
        location,
        venueName,
      });

      await sendEmail({
        to: contactEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailError) {
      console.error(
        "Failed to send host application confirmation email:",
        emailError
      );
      // Don't fail the application if email fails
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Error creating GGE event:", error);
    return NextResponse.json(
      { error: "Failed to create event application" },
      { status: 500 }
    );
  }
}
