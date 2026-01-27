import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const conflict = await prisma.conflict.findUnique({
      where: { id },
      include: {
        review: {
          select: {
            id: true,
            rating: true,
            complaint: true,
            content: true,
            improvementSuggestion: true,
            submittedAt: true,
            status: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            eventType: true,
            location: true,
            startDate: true,
            endDate: true,
          },
        },
        complainantClub: {
          select: {
            id: true,
            name: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
        respondentClub: {
          select: {
            id: true,
            name: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
        resolver: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!conflict) {
      return NextResponse.json(
        { error: "Conflict not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ conflict });
  } catch (error) {
    console.error("Error fetching conflict:", error);
    return NextResponse.json(
      { error: "An error occurred fetching the conflict" },
      { status: 500 }
    );
  }
}

const updateConflictSchema = z.object({
  status: z
    .enum(["OPEN", "IN_PROGRESS", "AWAITING_RESPONSE", "RESOLVED", "DISMISSED"])
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  adminNotes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const result = updateConflictSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const existingConflict = await prisma.conflict.findUnique({
      where: { id },
    });

    if (!existingConflict) {
      return NextResponse.json(
        { error: "Conflict not found" },
        { status: 404 }
      );
    }

    const conflict = await prisma.conflict.update({
      where: { id },
      data: result.data,
      include: {
        review: {
          select: {
            id: true,
            rating: true,
            complaint: true,
          },
        },
        complainantClub: {
          select: {
            id: true,
            name: true,
          },
        },
        respondentClub: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ conflict });
  } catch (error) {
    console.error("Error updating conflict:", error);
    return NextResponse.json(
      { error: "An error occurred updating the conflict" },
      { status: 500 }
    );
  }
}
