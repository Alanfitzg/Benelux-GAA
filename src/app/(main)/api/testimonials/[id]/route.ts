import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTestimonialSchema = z.object({
  content: z.string().min(1).max(500).optional(),
  deleteRequested: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        superAdminApprover: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        clubAdminApprover: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonial" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateTestimonialSchema.parse(body);

    if (testimonial.userId === session.user.id) {
      if (validatedData.content) {
        const updatedTestimonial = await prisma.testimonial.update({
          where: { id },
          data: {
            content: validatedData.content,
            status: "PENDING",
            superAdminApprovedAt: null,
            superAdminApprovedBy: null,
            clubAdminApprovedAt: null,
            clubAdminApprovedBy: null,
          },
        });
        return NextResponse.json(updatedTestimonial);
      }

      if (validatedData.deleteRequested !== undefined) {
        const updatedTestimonial = await prisma.testimonial.update({
          where: { id },
          data: {
            deleteRequested: validatedData.deleteRequested,
            deleteRequestedAt: validatedData.deleteRequested
              ? new Date()
              : null,
          },
        });
        return NextResponse.json(updatedTestimonial);
      }
    }

    return NextResponse.json(
      { error: "You can only edit your own testimonials" },
      { status: 403 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only super admins can delete testimonials" },
        { status: 403 }
      );
    }

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
