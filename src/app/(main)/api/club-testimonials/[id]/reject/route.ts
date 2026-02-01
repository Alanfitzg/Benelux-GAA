import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the testimonial to check clubId
    const testimonial = await prisma.clubTestimonialRequest.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    // Check if user is admin (SUPER_ADMIN or ClubSiteAdmin)
    const isSuper = session.user.role === "SUPER_ADMIN";
    const isClubAdmin = await prisma.clubSiteAdmin.findFirst({
      where: {
        clubId: testimonial.clubId,
        email: session.user.email ?? "",
      },
    });

    if (!isSuper && !isClubAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update status to REJECTED
    await prisma.clubTestimonialRequest.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    return NextResponse.json({
      success: true,
      message: "Testimonial rejected",
    });
  } catch (error) {
    console.error("Error rejecting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to reject testimonial" },
      { status: 500 }
    );
  }
}
