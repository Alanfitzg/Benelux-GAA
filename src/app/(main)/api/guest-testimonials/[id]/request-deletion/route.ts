import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// POST - Request deletion of a guest testimonial (by either club admin)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const testimonial = await prisma.guestTestimonial.findUnique({
      where: { id },
      include: {
        guestClub: { select: { id: true, admins: { select: { id: true } } } },
        hostClub: { select: { id: true, admins: { select: { id: true } } } },
      },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    // Check if user is admin of either club or super admin
    const isGuestClubAdmin = testimonial.guestClub.admins.some(
      (admin) => admin.id === session.user.id
    );
    const isHostClubAdmin = testimonial.hostClub.admins.some(
      (admin) => admin.id === session.user.id
    );
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isGuestClubAdmin && !isHostClubAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: "You must be an admin of either club to request deletion" },
        { status: 403 }
      );
    }

    // Determine which club is requesting deletion
    let deleteRequestedBy = "unknown";
    if (isGuestClubAdmin) {
      deleteRequestedBy = testimonial.guestClubId;
    } else if (isHostClubAdmin) {
      deleteRequestedBy = testimonial.hostClubId;
    } else if (isSuperAdmin) {
      deleteRequestedBy = "super_admin";
    }

    const updated = await prisma.guestTestimonial.update({
      where: { id },
      data: {
        deleteRequested: true,
        deleteRequestedAt: new Date(),
        deleteRequestedBy,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error requesting deletion:", error);
    return NextResponse.json(
      { error: "Failed to request deletion" },
      { status: 500 }
    );
  }
}
