import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";
import { z } from "zod";

const resolveConflictSchema = z.object({
  resolutionType: z.enum([
    "MEDIATED",
    "REFUND_ISSUED",
    "APOLOGY_ISSUED",
    "NO_ACTION",
    "WARNING_ISSUED",
    "DISMISSED",
  ]),
  resolutionNotes: z.string().min(1, "Resolution notes are required"),
});

export async function POST(
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

    const result = resolveConflictSchema.safeParse(body);
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

    if (
      existingConflict.status === "RESOLVED" ||
      existingConflict.status === "DISMISSED"
    ) {
      return NextResponse.json(
        { error: "This conflict has already been resolved" },
        { status: 400 }
      );
    }

    const { resolutionType, resolutionNotes } = result.data;
    const finalStatus =
      resolutionType === "DISMISSED" ? "DISMISSED" : "RESOLVED";

    // Update conflict and review in a transaction
    const conflict = await prisma.$transaction(async (tx) => {
      // Update the conflict
      const updatedConflict = await tx.conflict.update({
        where: { id },
        data: {
          status: finalStatus,
          resolutionType,
          resolutionNotes,
          resolvedAt: new Date(),
          resolvedBy: session.user.id,
        },
        include: {
          review: true,
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

      // Update the associated review status
      await tx.eventReview.update({
        where: { id: updatedConflict.reviewId },
        data: {
          status: "CONFLICT_RESOLVED",
        },
      });

      return updatedConflict;
    });

    return NextResponse.json({
      success: true,
      conflict,
      message: "Conflict has been resolved successfully",
    });
  } catch (error) {
    console.error("Error resolving conflict:", error);
    return NextResponse.json(
      { error: "An error occurred resolving the conflict" },
      { status: 500 }
    );
  }
}
