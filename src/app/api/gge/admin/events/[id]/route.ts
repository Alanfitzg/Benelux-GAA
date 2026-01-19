import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { status, rejectionReason, approvedBy } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const updateData: {
      status: "PENDING" | "APPROVED" | "REJECTED";
      rejectionReason?: string | null;
      approvedBy?: string | null;
      approvedAt?: Date | null;
    } = {
      status,
    };

    if (status === "APPROVED") {
      updateData.approvedAt = new Date();
      updateData.approvedBy = approvedBy || null;
      updateData.rejectionReason = null;
    } else if (status === "REJECTED") {
      updateData.rejectionReason = rejectionReason || null;
      updateData.approvedAt = null;
      updateData.approvedBy = null;
    }

    const event = await prisma.socialGAAEvent.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error updating GGE event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.socialGAAEvent.findUnique({
      where: { id },
      include: {
        registrations: {
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error fetching GGE event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
