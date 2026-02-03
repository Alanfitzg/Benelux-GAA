import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth-helpers";
import { EventReviewStatus, Prisma } from "@prisma/client";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const reviewSubmissionSchema = z.object({
  token: z.string().min(1, "Token is required"),
  rating: z.number().min(1).max(5),
  content: z.string().max(500).optional(),
  complaint: z.string().optional(),
  improvementSuggestion: z.string().optional(),
});

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();

    const result = reviewSubmissionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, rating, content, complaint, improvementSuggestion } =
      result.data;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const reviewToken = await prisma.reviewToken.findUnique({
      where: { token: hashedToken },
      include: {
        review: true,
      },
    });

    if (!reviewToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    if (reviewToken.used || reviewToken.review) {
      return NextResponse.json(
        { error: "This review has already been submitted" },
        { status: 400 }
      );
    }

    if (new Date() > reviewToken.expiresAt) {
      return NextResponse.json(
        { error: "This review link has expired" },
        { status: 400 }
      );
    }

    // Validate content based on rating
    if (rating <= 2 && !complaint) {
      return NextResponse.json(
        { error: "Please provide details about your complaint" },
        { status: 400 }
      );
    }

    if (rating === 3 && !improvementSuggestion) {
      return NextResponse.json(
        { error: "Please tell us what could be improved" },
        { status: 400 }
      );
    }

    if (rating >= 4 && !content) {
      return NextResponse.json(
        { error: "Please share your experience" },
        { status: 400 }
      );
    }

    const isConflict = rating <= 2;
    const status = isConflict ? "CONFLICT_OPEN" : "PENDING";

    // Create the review and optionally the conflict in a transaction
    const review = await prisma.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.eventReview.create({
        data: {
          tokenId: reviewToken.id,
          eventId: reviewToken.eventId,
          reviewerClubId: reviewToken.reviewerClubId,
          targetClubId: reviewToken.targetClubId,
          rating,
          content: rating >= 4 ? content : null,
          complaint: rating <= 2 ? complaint : null,
          improvementSuggestion: rating === 3 ? improvementSuggestion : null,
          status,
          isConflict,
        },
      });

      // Mark token as used
      await tx.reviewToken.update({
        where: { id: reviewToken.id },
        data: { used: true },
      });

      // If it's a conflict, create the conflict record
      if (isConflict) {
        await tx.conflict.create({
          data: {
            reviewId: newReview.id,
            eventId: reviewToken.eventId,
            complainantClubId: reviewToken.reviewerClubId,
            respondentClubId: reviewToken.targetClubId,
            status: "OPEN",
            priority: rating === 1 ? "HIGH" : "MEDIUM",
          },
        });
      }

      return newReview;
    });

    return NextResponse.json({
      success: true,
      reviewId: review.id,
      isConflict,
      message: isConflict
        ? "Your feedback has been submitted. Our team will review your concerns and get back to you."
        : "Thank you for your feedback! It will be reviewed shortly.",
    });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "An error occurred submitting your review" },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(RATE_LIMITS.FORMS, postHandler);

async function getHandler(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetClubId = searchParams.get("targetClubId");
    const status = searchParams.get("status") as EventReviewStatus | null;
    const isConflict = searchParams.get("isConflict");

    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    // Build the where clause
    const where: Prisma.EventReviewWhereInput = {};

    // Non-super admins must specify a target club
    if (!isSuperAdmin && !targetClubId) {
      return NextResponse.json(
        { error: "targetClubId is required for non-admin users" },
        { status: 400 }
      );
    }

    if (targetClubId) {
      where.targetClubId = targetClubId;
    }

    if (status && Object.values(EventReviewStatus).includes(status)) {
      where.status = status;
    }

    if (isConflict !== null && isConflict !== undefined) {
      where.isConflict = isConflict === "true";
    }

    const reviews = await prisma.eventReview.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
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
        conflict: {
          select: {
            id: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "An error occurred fetching reviews" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getHandler);
