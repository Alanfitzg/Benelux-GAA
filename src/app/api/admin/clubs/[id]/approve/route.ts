import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["SUPER_ADMIN", "GUEST_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      action,
      rejectionReason,
      adminNotes,
      editedData,
      internationalUnitId,
    } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "reject" && !rejectionReason?.trim()) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    if (action === "approve" && !internationalUnitId?.trim()) {
      return NextResponse.json(
        { error: "International Unit assignment is required for approval" },
        { status: 400 }
      );
    }

    // Find the club
    const club = await prisma.club.findUnique({
      where: { id: params.id },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    if (club.status !== "PENDING") {
      return NextResponse.json(
        { error: "Club has already been reviewed" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: {
      status: "APPROVED" | "REJECTED";
      reviewedAt: Date;
      reviewedBy: string;
      adminNotes?: string | null;
      rejectionReason?: string;
      internationalUnitId?: string;
      name?: string;
      location?: string;
      region?: string | null;
      subRegion?: string | null;
      facebook?: string | null;
      instagram?: string | null;
      website?: string | null;
      teamTypes?: string[];
      primaryContactName?: string;
      primaryContactEmail?: string | null;
    } = {
      status: action === "approve" ? "APPROVED" : "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
      adminNotes: adminNotes || club.adminNotes,
    };

    if (action === "reject") {
      updateData.rejectionReason = rejectionReason;
    }

    // Assign international unit for approval
    if (action === "approve" && internationalUnitId) {
      updateData.internationalUnitId = internationalUnitId;
    }

    // Apply edited data if provided
    if (editedData) {
      // Map the interface fields back to database fields
      if (editedData.name) updateData.name = editedData.name;
      if (editedData.location) updateData.location = editedData.location;
      if (editedData.region !== undefined)
        updateData.region = editedData.region;
      if (editedData.subRegion !== undefined)
        updateData.subRegion = editedData.subRegion;
      if (editedData.facebook !== undefined)
        updateData.facebook = editedData.facebook;
      if (editedData.instagram !== undefined)
        updateData.instagram = editedData.instagram;
      if (editedData.website !== undefined)
        updateData.website = editedData.website;
      if (editedData.teamTypes) updateData.teamTypes = editedData.teamTypes;

      // Handle contact fields - combine first and last name back to primaryContactName
      if (editedData.contactFirstName || editedData.contactLastName) {
        const firstName = editedData.contactFirstName || "";
        const lastName = editedData.contactLastName || "";
        updateData.primaryContactName = `${firstName} ${lastName}`.trim();
      }

      if (editedData.contactEmail) {
        updateData.primaryContactEmail = editedData.contactEmail;
      }
    }

    // Update the club
    const updatedClub = await prisma.club.update({
      where: { id: params.id },
      data: updateData,
      include: {
        submitter: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Club ${action}d successfully`,
      club: updatedClub,
    });
  } catch (error) {
    console.error("Error updating club status:", error);
    return NextResponse.json(
      { error: "Failed to update club status" },
      { status: 500 }
    );
  }
}
