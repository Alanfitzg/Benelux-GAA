import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET - Fetch guest testimonials (approved ones for public, all for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostClubId = searchParams.get("hostClubId");
    const status = searchParams.get("status");
    const includeAll = searchParams.get("includeAll") === "true";

    const session = await getServerSession();
    const isAdmin = session?.user?.role === "SUPER_ADMIN";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (hostClubId) {
      where.hostClubId = hostClubId;
    }

    // Non-admins can only see approved testimonials
    if (!isAdmin || !includeAll) {
      where.status = "APPROVED";
    } else if (status) {
      where.status = status;
    }

    const testimonials = await prisma.guestTestimonial.findMany({
      where,
      include: {
        guestClub: {
          select: {
            id: true,
            name: true,
            location: true,
            imageUrl: true,
          },
        },
        hostClub: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        guestUser: {
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
    console.error("Error fetching guest testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST - Create a new guest testimonial
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guestClubId, hostClubId, eventId, content, rating } = body;

    if (!guestClubId || !hostClubId || !content) {
      return NextResponse.json(
        { error: "Missing required fields: guestClubId, hostClubId, content" },
        { status: 400 }
      );
    }

    // Verify user is admin of the guest club
    const isClubAdmin = await prisma.club.findFirst({
      where: {
        id: guestClubId,
        admins: { some: { id: session.user.id } },
      },
    });

    if (!isClubAdmin && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          error:
            "You must be an admin of the guest club to submit a testimonial",
        },
        { status: 403 }
      );
    }

    // Check for existing testimonial
    const existing = await prisma.guestTestimonial.findUnique({
      where: {
        guestClubId_hostClubId_eventId: {
          guestClubId,
          hostClubId,
          eventId: eventId || null,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A testimonial already exists for this host club" },
        { status: 409 }
      );
    }

    const testimonial = await prisma.guestTestimonial.create({
      data: {
        guestClubId,
        guestUserId: session.user.id,
        hostClubId,
        eventId: eventId || null,
        content: content.substring(0, 500),
        rating: rating ? Math.min(5, Math.max(1, rating)) : null,
        status: "PENDING",
      },
      include: {
        guestClub: { select: { name: true } },
        hostClub: { select: { name: true } },
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating guest testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
