import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; inquiryId: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: clubId, inquiryId } = await params;

  // Check if user is admin of this club or super admin
  const club = await prisma.club.findFirst({
    where: {
      id: clubId,
      OR: [
        { admins: { some: { id: session.user.id } } },
        ...(session.user.role === "SUPER_ADMIN" ? [{ id: clubId }] : []),
      ],
    },
    select: { id: true },
  });

  if (!club) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Verify the inquiry belongs to this club
  const inquiry = await prisma.clubInterest.findFirst({
    where: { id: inquiryId, clubId },
  });

  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  const body = await request.json();
  const { isRead, isArchived, respondedAt } = body;

  const updateData: {
    isRead?: boolean;
    isArchived?: boolean;
    respondedAt?: Date | null;
  } = {};

  if (typeof isRead === "boolean") {
    updateData.isRead = isRead;
  }
  if (typeof isArchived === "boolean") {
    updateData.isArchived = isArchived;
  }
  if (respondedAt !== undefined) {
    updateData.respondedAt = respondedAt ? new Date(respondedAt) : null;
  }

  const updated = await prisma.clubInterest.update({
    where: { id: inquiryId },
    data: updateData,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; inquiryId: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: clubId, inquiryId } = await params;

  // Only super admins can delete
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Only super admins can delete inquiries" },
      { status: 403 }
    );
  }

  // Verify the inquiry belongs to this club
  const inquiry = await prisma.clubInterest.findFirst({
    where: { id: inquiryId, clubId },
  });

  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  await prisma.clubInterest.delete({
    where: { id: inquiryId },
  });

  return NextResponse.json({ success: true });
}
