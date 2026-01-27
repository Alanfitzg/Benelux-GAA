import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";
import { withErrorHandler } from "@/lib/error-handlers";
import { z } from "zod";

const AdminRequestSchema = z.object({
  clubId: z.string().cuid("Invalid club ID"),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(500, "Reason must be no more than 500 characters"),
});

async function adminRequestHandler(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  if (request.method === "POST") {
    const body = await request.json();
    const { clubId, reason } = AdminRequestSchema.parse(body);

    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        admins: {
          where: { id: session.user.id },
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Check if user is already an admin
    if (club.admins.length > 0) {
      return NextResponse.json(
        { error: "You are already an admin of this club" },
        { status: 400 }
      );
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.clubAdminRequest.findUnique({
      where: {
        userId_clubId: {
          userId: session.user.id,
          clubId: clubId,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return NextResponse.json(
          { error: "You already have a pending request for this club" },
          { status: 400 }
        );
      }

      if (existingRequest.status === "APPROVED") {
        return NextResponse.json(
          { error: "Your request has already been approved" },
          { status: 400 }
        );
      }

      // If rejected, allow a new request by updating the existing one
      if (existingRequest.status === "REJECTED") {
        const updatedRequest = await prisma.clubAdminRequest.update({
          where: { id: existingRequest.id },
          data: {
            reason,
            status: "PENDING",
            requestedAt: new Date(),
            reviewedAt: null,
            reviewedBy: null,
            rejectionReason: null,
          },
        });

        return NextResponse.json(
          {
            success: true,
            message: "Request resubmitted successfully",
            request: updatedRequest,
          },
          { status: 200 }
        );
      }
    }

    // Create new request
    const newRequest = await prisma.clubAdminRequest.create({
      data: {
        userId: session.user.id,
        clubId,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin request submitted successfully",
        request: newRequest,
      },
      { status: 201 }
    );
  }

  if (request.method === "GET") {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");

    if (!clubId) {
      return NextResponse.json(
        { error: "Club ID is required" },
        { status: 400 }
      );
    }

    // Get user's request for this club
    const userRequest = await prisma.clubAdminRequest.findUnique({
      where: {
        userId_clubId: {
          userId: session.user.id,
          clubId,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        request: userRequest,
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const POST = withErrorHandler(adminRequestHandler);
export const GET = withErrorHandler(adminRequestHandler);
