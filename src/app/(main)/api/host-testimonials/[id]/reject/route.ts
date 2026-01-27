import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// POST - Reject a host testimonial (Super Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const testimonial = await prisma.hostTestimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.hostTestimonial.update({
      where: { id },
      data: {
        status: "REJECTED",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error rejecting host testimonial:", error);
    return NextResponse.json(
      { error: "Failed to reject testimonial" },
      { status: 500 }
    );
  }
}
