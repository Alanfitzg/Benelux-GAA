import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";
import { AppealStatus } from "@prisma/client";

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

    const { id: eventId } = await params;
    const body = await request.json();
    const { decision, resolution } = body;

    if (!decision || !["APPROVED", "DENIED"].includes(decision)) {
      return NextResponse.json(
        { error: "Valid decision (APPROVED or DENIED) is required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.appealStatus !== "PENDING") {
      return NextResponse.json(
        { error: "This appeal is not pending" },
        { status: 400 }
      );
    }

    const updateData: {
      appealStatus: AppealStatus;
      appealResolvedAt: Date;
      appealResolvedBy: string;
      appealResolution?: string;
      approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
    } = {
      appealStatus: decision as AppealStatus,
      appealResolvedAt: new Date(),
      appealResolvedBy: session.user.id,
      appealResolution: resolution?.trim() || null,
    };

    if (decision === "APPROVED") {
      updateData.approvalStatus = "PENDING";
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error resolving appeal:", error);
    return NextResponse.json(
      { error: "An error occurred resolving the appeal" },
      { status: 500 }
    );
  }
}
