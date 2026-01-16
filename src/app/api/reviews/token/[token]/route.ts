import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const reviewToken = await prisma.reviewToken.findUnique({
      where: { token: hashedToken },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            eventType: true,
            location: true,
            startDate: true,
            endDate: true,
          },
        },
        reviewerClub: {
          select: {
            id: true,
            name: true,
          },
        },
        targetClub: {
          select: {
            id: true,
            name: true,
          },
        },
        review: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!reviewToken) {
      return NextResponse.json(
        { error: "Invalid token", code: "INVALID_TOKEN" },
        { status: 404 }
      );
    }

    if (reviewToken.used || reviewToken.review) {
      return NextResponse.json(
        {
          error: "This review has already been submitted",
          code: "ALREADY_USED",
        },
        { status: 400 }
      );
    }

    if (new Date() > reviewToken.expiresAt) {
      return NextResponse.json(
        { error: "This review link has expired", code: "EXPIRED" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      tokenId: reviewToken.id,
      event: reviewToken.event,
      reviewerClub: reviewToken.reviewerClub,
      targetClub: reviewToken.targetClub,
      expiresAt: reviewToken.expiresAt,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { error: "An error occurred validating the token" },
      { status: 500 }
    );
  }
}
