import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTestimonialSchema = z.object({
  clubId: z.string(),
  content: z.string().min(1).max(500),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const where: Record<string, string> = {};

    if (clubId) where.clubId = clubId;
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const testimonials = await prisma.testimonial.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { displayOrder: "asc" },
        { submittedAt: "desc" },
      ],
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTestimonialSchema.parse(body);

    const existingTestimonial = await prisma.testimonial.findUnique({
      where: {
        clubId_userId: {
          clubId: validatedData.clubId,
          userId: session.user.id,
        },
      },
    });

    if (existingTestimonial) {
      return NextResponse.json(
        { error: "You have already submitted a testimonial for this club" },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        clubId: validatedData.clubId,
        userId: session.user.id,
        content: validatedData.content,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
