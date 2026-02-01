import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clubId, orderedIds } = body;

    if (!clubId || !Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: "clubId and orderedIds array are required" },
        { status: 400 }
      );
    }

    // Check if user is admin (SUPER_ADMIN or ClubSiteAdmin)
    const isSuper = session.user.role === "SUPER_ADMIN";
    const isClubAdmin = await prisma.clubSiteAdmin.findFirst({
      where: {
        clubId,
        email: session.user.email ?? "",
      },
    });

    if (!isSuper && !isClubAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update display order for each testimonial
    await Promise.all(
      orderedIds.map((id: string, index: number) =>
        prisma.clubTestimonialRequest.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Order updated",
    });
  } catch (error) {
    console.error("Error reordering testimonials:", error);
    return NextResponse.json(
      { error: "Failed to reorder testimonials" },
      { status: 500 }
    );
  }
}
