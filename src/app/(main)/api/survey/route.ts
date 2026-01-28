import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract client information
    const userAgent = request.headers.get("user-agent") || "";
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || "";
    const referrer = request.headers.get("referer") || "";

    // Check honeypot field - if filled, it's a bot
    if (body.website && body.website.length > 0) {
      // Silently reject but return success to not alert the bot
      return NextResponse.json(
        {
          success: true,
          id: "fake-id",
          message: "Survey response saved successfully",
        },
        { status: 201 }
      );
    }

    // Validate required fields (simplified form only requires role, country, name, email)
    const requiredFields = ["role", "country", "contactName", "contactEmail"];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.contactEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create survey response
    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        eventId: body.eventId || null,

        // Respondent Info
        role: body.role,
        clubName: body.clubName || null,
        country: body.country,
        city: body.city || null,
        sportCode: body.sportCode || null,

        // Travel History & Intent
        hasTraveledAbroad:
          body.hasTraveledAbroad || body.travelFrequency || null,
        travelFrequency: body.travelFrequency || null,
        destinationsVisited: body.destinationsVisited || [],
        preferredMonths: body.preferredMonths || [],
        specificDestination: body.specificDestination || null,
        preferredTravelTime: body.preferredTravelTime || null,

        // Budgets & Pain Points (optional now)
        teamSize: body.teamSize || null,
        budgetPerPerson: body.budgetPerPerson || null,
        biggestChallenge: body.biggestChallenge || null,

        // Product Fit & Interest
        interestedServices: body.interestedServices || [],

        // Open-Ended Insight
        improvementSuggestion:
          body.groupAndPreferences || body.improvementSuggestion || null,
        additionalFeedback: body.additionalFeedback || null,

        // Contact Information
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone || null,

        // Metadata
        ipAddress,
        userAgent,
        referrer,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: surveyResponse.id,
        message: "Survey response saved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Survey submission error:", error);
    return NextResponse.json(
      { error: "Failed to save survey response" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where = eventId ? { eventId } : {};

    const [responses, total] = await Promise.all([
      prisma.surveyResponse.findMany({
        where,
        orderBy: { submittedAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              location: true,
              startDate: true,
            },
          },
        },
      }),
      prisma.surveyResponse.count({ where }),
    ]);

    return NextResponse.json({
      responses,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Survey fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch survey responses" },
      { status: 500 }
    );
  }
}
