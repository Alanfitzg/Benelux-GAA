import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { UserRole, ClubAdminRequestStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    const whereClause =
      status === "ALL" ? {} : { status: status as ClubAdminRequestStatus };

    const requests = await prisma.clubAdminRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            createdAt: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
            location: true,
            imageUrl: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    const formattedRequests = requests.map((req) => ({
      id: req.id,
      reason: req.reason,
      status: req.status,
      requestedAt: req.requestedAt.toISOString(),
      reviewedAt: req.reviewedAt?.toISOString(),
      rejectionReason: req.rejectionReason,
      user: req.user,
      club: req.club,
      reviewer: req.reviewer,
    }));

    return NextResponse.json({ success: true, requests: formattedRequests });
  } catch (error) {
    console.error("Error fetching club admin requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, action, rejectionReason } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Request ID and action are required" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const adminRequest = await prisma.clubAdminRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        club: true,
      },
    });

    if (!adminRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (adminRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Request has already been reviewed" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Update the request status
      await prisma.clubAdminRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      });

      // Add user to club admins
      await prisma.club.update({
        where: { id: adminRequest.clubId },
        data: {
          admins: {
            connect: { id: adminRequest.userId },
          },
        },
      });

      // Update user role to CLUB_ADMIN if they're currently just a USER
      if (adminRequest.user.role === UserRole.USER) {
        await prisma.user.update({
          where: { id: adminRequest.userId },
          data: {
            role: UserRole.CLUB_ADMIN,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Request approved successfully",
      });
    } else {
      // Reject the request
      await prisma.clubAdminRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          rejectionReason: rejectionReason || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Request rejected",
      });
    }
  } catch (error) {
    console.error("Error reviewing club admin request:", error);
    return NextResponse.json(
      { error: "Failed to review request" },
      { status: 500 }
    );
  }
}
