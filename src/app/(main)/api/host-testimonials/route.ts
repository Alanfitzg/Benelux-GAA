import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET - Fetch host testimonials (approved ones for public, all for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestClubId = searchParams.get("guestClubId");
    const status = searchParams.get("status");
    const includeAll = searchParams.get("includeAll") === "true";

    const session = await getServerSession();
    const isAdmin = session?.user?.role === "SUPER_ADMIN";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (guestClubId) {
      where.guestClubId = guestClubId;
    }

    // Non-admins can only see approved testimonials
    if (!isAdmin || !includeAll) {
      where.status = "APPROVED";
    } else if (status) {
      where.status = status;
    }

    const testimonials = await prisma.hostTestimonial.findMany({
      where,
      include: {
        hostClub: {
          select: {
            id: true,
            name: true,
            location: true,
            imageUrl: true,
          },
        },
        guestClub: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        hostUser: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
          },
        },
      },
      orderBy: [
        { displayOrder: "asc" },
        { approvedAt: "desc" },
        { submittedAt: "desc" },
      ],
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching host testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST - Create a new host testimonial
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { hostClubId, guestClubId, eventId, content, rating } = body;

    if (!hostClubId || !guestClubId || !content) {
      return NextResponse.json(
        { error: "Missing required fields: hostClubId, guestClubId, content" },
        { status: 400 }
      );
    }

    // Verify user is admin of the host club
    const isClubAdmin = await prisma.club.findFirst({
      where: {
        id: hostClubId,
        admins: { some: { id: session.user.id } },
      },
    });

    if (!isClubAdmin && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          error:
            "You must be an admin of the host club to submit a testimonial",
        },
        { status: 403 }
      );
    }

    // Check for existing testimonial
    const existing = await prisma.hostTestimonial.findUnique({
      where: {
        hostClubId_guestClubId_eventId: {
          hostClubId,
          guestClubId,
          eventId: eventId || null,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A testimonial already exists for this guest club" },
        { status: 409 }
      );
    }

    const testimonial = await prisma.hostTestimonial.create({
      data: {
        hostClubId,
        hostUserId: session.user.id,
        guestClubId,
        eventId: eventId || null,
        content: content.substring(0, 500),
        rating: rating ? Math.min(5, Math.max(1, rating)) : null,
        status: "PENDING",
      },
      include: {
        hostClub: { select: { name: true } },
        guestClub: { select: { name: true } },
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating host testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
