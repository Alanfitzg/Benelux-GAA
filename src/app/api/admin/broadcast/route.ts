import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { sendBulkEmail } from "@/lib/email";
import { generateBroadcastEmail } from "@/lib/email-templates";

const EUROPEAN_COUNTRIES = [
  "Germany",
  "France",
  "Spain",
  "Netherlands",
  "Belgium",
  "Austria",
  "Switzerland",
  "Italy",
  "Czech Republic",
  "Poland",
  "Hungary",
  "Sweden",
  "Denmark",
  "Norway",
  "Finland",
  "Portugal",
  "Luxembourg",
  "Slovakia",
  "Croatia",
  "Slovenia",
  "Estonia",
  "Latvia",
  "Lithuania",
  "Romania",
  "Bulgaria",
  "Greece",
  "Cyprus",
  "Malta",
];

const UK_IRELAND_COUNTRIES = [
  "Ireland",
  "United Kingdom",
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
];

const NORTH_AMERICA_COUNTRIES = ["United States", "Canada", "USA", "Mexico"];

const ASIA_PACIFIC_COUNTRIES = [
  "Australia",
  "New Zealand",
  "Japan",
  "China",
  "South Korea",
  "Singapore",
  "Hong Kong",
  "Thailand",
  "Vietnam",
  "Malaysia",
  "Philippines",
  "Indonesia",
  "India",
];

const MIDDLE_EAST_AFRICA_COUNTRIES = [
  "United Arab Emirates",
  "Dubai",
  "Abu Dhabi",
  "Qatar",
  "Bahrain",
  "Saudi Arabia",
  "Kuwait",
  "Oman",
  "South Africa",
  "Kenya",
  "Nigeria",
  "Egypt",
  "Morocco",
];

function getCountriesForGroup(groupId: string): string[] | null {
  switch (groupId) {
    case "mainland-europe":
      return EUROPEAN_COUNTRIES;
    case "uk-ireland":
      return UK_IRELAND_COUNTRIES;
    case "north-america":
      return NORTH_AMERICA_COUNTRIES;
    case "asia-pacific":
      return ASIA_PACIFIC_COUNTRIES;
    case "middle-east-africa":
      return MIDDLE_EAST_AFRICA_COUNTRIES;
    case "all-clubs":
      return null; // null means all clubs
    default:
      return [];
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { groupIds, subject, message } = await req.json();

    if (!groupIds || !Array.isArray(groupIds) || groupIds.length === 0) {
      return NextResponse.json(
        { error: "At least one distribution group is required" },
        { status: 400 }
      );
    }

    if (
      !subject ||
      typeof subject !== "string" ||
      subject.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Subject is required" },
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

    // Determine which clubs to include
    const includeAllClubs = groupIds.includes("all-clubs");
    let countryFilters: string[] = [];

    if (!includeAllClubs) {
      for (const groupId of groupIds) {
        const countries = getCountriesForGroup(groupId);
        if (countries) {
          countryFilters = [...countryFilters, ...countries];
        }
      }
    }

    // Fetch clubs with their admins
    const clubsWithAdmins = await prisma.club.findMany({
      where: {
        admins: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        location: true,
        country: {
          select: {
            name: true,
          },
        },
        admins: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Filter clubs by region if not sending to all
    const targetClubs = includeAllClubs
      ? clubsWithAdmins
      : clubsWithAdmins.filter((club) => {
          const countryName = club.country?.name || "";
          const location = club.location || "";
          return countryFilters.some(
            (c) =>
              countryName.toLowerCase().includes(c.toLowerCase()) ||
              location.toLowerCase().includes(c.toLowerCase())
          );
        });

    if (targetClubs.length === 0) {
      return NextResponse.json(
        { error: "No clubs found in selected distribution groups" },
        { status: 404 }
      );
    }

    // Collect all admin emails
    const personalizations: Array<{
      to: string;
      substitutions: Record<string, string>;
    }> = [];

    const uniqueEmails = new Set<string>();

    for (const club of targetClubs) {
      for (const admin of club.admins) {
        if (!uniqueEmails.has(admin.email)) {
          uniqueEmails.add(admin.email);
          personalizations.push({
            to: admin.email,
            substitutions: {
              recipientName: admin.name || "Club Admin",
              clubName: club.name,
            },
          });
        }
      }
    }

    if (personalizations.length === 0) {
      return NextResponse.json(
        { error: "No admin email addresses found" },
        { status: 400 }
      );
    }

    // Generate email content
    const baseUrl = process.env.NEXTAUTH_URL || "https://playaway.ie";
    const emailData = generateBroadcastEmail({
      subject: subject.trim(),
      message: message.trim(),
      senderName: session.user.name || "PlayAway Team",
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
        { error: "Failed to send some or all broadcasts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Broadcast sent successfully",
      sentTo: personalizations.length,
      clubsNotified: targetClubs.length,
    });
  } catch (error) {
    console.error("Error sending broadcast:", error);
    return NextResponse.json(
      { error: "Failed to send broadcast" },
      { status: 500 }
    );
  }
}
