import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Validate token and return request details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const testimonialRequest = await prisma.clubTestimonialRequest.findUnique({
      where: { token },
      select: {
        id: true,
        clubId: true,
        email: true,
        status: true,
        expiresAt: true,
      },
    });

    if (!testimonialRequest) {
      return NextResponse.json(
        { error: "Invalid or expired link" },
        { status: 404 }
      );
    }

    if (new Date() > testimonialRequest.expiresAt) {
      return NextResponse.json(
        { error: "This link has expired" },
        { status: 410 }
      );
    }

    if (testimonialRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Testimonial already submitted" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      clubId: testimonialRequest.clubId,
      email: testimonialRequest.email,
    });
  } catch (error) {
    console.error("Error validating token:", error);
    return NextResponse.json(
      { error: "Failed to validate token" },
      { status: 500 }
    );
  }
}

// POST: Submit testimonial content
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { name, clubName, content, honeypot } = body;

    // Check honeypot
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // Validate input
    if (!name || !content) {
      return NextResponse.json(
        { error: "Name and testimonial are required" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Name must be 100 characters or less" },
        { status: 400 }
      );
    }

    if (content.length > 300) {
      return NextResponse.json(
        { error: "Testimonial must be 300 characters or less" },
        { status: 400 }
      );
    }

    if (clubName && clubName.length > 100) {
      return NextResponse.json(
        { error: "Club name must be 100 characters or less" },
        { status: 400 }
      );
    }

    // Find and validate the request
    const testimonialRequest = await prisma.clubTestimonialRequest.findUnique({
      where: { token },
    });

    if (!testimonialRequest) {
      return NextResponse.json(
        { error: "Invalid or expired link" },
        { status: 404 }
      );
    }

    if (new Date() > testimonialRequest.expiresAt) {
      return NextResponse.json(
        { error: "This link has expired" },
        { status: 410 }
      );
    }

    if (testimonialRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Testimonial already submitted" },
        { status: 400 }
      );
    }

    // Update the request with submitted content
    await prisma.clubTestimonialRequest.update({
      where: { token },
      data: {
        name: name.trim(),
        memberClubName: clubName ? clubName.trim() : null,
        content: content.trim(),
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your testimonial has been submitted for review.",
    });
  } catch (error) {
    console.error("Error submitting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to submit testimonial" },
      { status: 500 }
    );
  }
}
