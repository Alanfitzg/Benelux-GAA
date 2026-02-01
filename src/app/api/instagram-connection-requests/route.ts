import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

// GET - List all requests (super admin only) or check status for a club
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  // If clubId provided, return that specific request (no auth needed for status check)
  if (clubId) {
    const connectionRequest =
      await prisma.instagramConnectionRequest.findUnique({
        where: { clubId },
      });

    return NextResponse.json({
      request: connectionRequest,
    });
  }

  // List all requests - super admin only
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.instagramConnectionRequest.findMany({
    orderBy: [
      { status: "asc" }, // PENDING first
      { requestedAt: "desc" },
    ],
  });

  return NextResponse.json({ requests });
}

// POST - Create a new connection request (from club admin dashboard)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Sanitize and validate inputs
    const clubId =
      typeof body.clubId === "string" ? body.clubId.trim().slice(0, 100) : "";
    const clubName =
      typeof body.clubName === "string"
        ? body.clubName.trim().slice(0, 200)
        : "";
    const instagramHandle =
      typeof body.instagramHandle === "string"
        ? body.instagramHandle.trim().slice(0, 50)
        : null;

    if (!clubId || !clubName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Basic validation for clubId format (alphanumeric with hyphens)
    if (!/^[a-zA-Z0-9-]+$/.test(clubId)) {
      return NextResponse.json(
        { error: "Invalid club ID format" },
        { status: 400 }
      );
    }

    // Check if request already exists
    const existing = await prisma.instagramConnectionRequest.findUnique({
      where: { clubId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Request already exists", request: existing },
        { status: 409 }
      );
    }

    const connectionRequest = await prisma.instagramConnectionRequest.create({
      data: {
        clubId,
        clubName,
        instagramHandle: instagramHandle || null,
      },
    });

    return NextResponse.json({ request: connectionRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating Instagram connection request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}

// PATCH - Update request status (super admin only)
export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status, notes } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const connectionRequest = await prisma.instagramConnectionRequest.update({
      where: { id },
      data: {
        status,
        notes: notes || null,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    });

    return NextResponse.json({ request: connectionRequest });
  } catch (error) {
    console.error("Error updating Instagram connection request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a request (super admin only)
export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    await prisma.instagramConnectionRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting Instagram connection request:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
