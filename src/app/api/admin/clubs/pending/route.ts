import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["SUPER_ADMIN", "GUEST_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    const clubs = await prisma.club.findMany({
      where: {
        status: status as "PENDING" | "APPROVED" | "REJECTED",
        dataSource: "USER_SUBMITTED",
      },
      include: {
        submitter: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
          },
        },
        internationalUnit: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the interface expectations
    const transformedClubs = clubs.map((club) => ({
      id: club.id,
      name: club.name,
      location: club.location,
      region: club.region,
      subRegion: club.subRegion,
      imageUrl: club.imageUrl,
      teamTypes: club.teamTypes || [],
      // Map new fields to old interface expectations
      contactFirstName:
        club.primaryContactName?.split(" ")[0] || club.primaryContactName,
      contactLastName:
        club.primaryContactName?.split(" ").slice(1).join(" ") || null,
      contactEmail: club.primaryContactEmail,
      contactPhone: null, // Not collected in new form
      isContactWilling: true, // Default for new submissions
      status: club.status,
      createdAt: club.createdAt.toISOString(),
      submittedBy: club.submittedBy,
      submitter: club.submitter,
      reviewedAt: club.reviewedAt?.toISOString() || null,
      reviewedBy: club.reviewedBy,
      reviewer: club.reviewer,
      rejectionReason: club.rejectionReason,
      adminNotes: club.adminNotes,
      notesForAdmin: club.notesForAdmin,
      facebook: club.facebook,
      instagram: club.instagram,
      website: club.website,
      internationalUnitId: club.internationalUnitId,
    }));

    return NextResponse.json({ clubs: transformedClubs });
  } catch (error) {
    console.error("Error fetching pending clubs:", error);
    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    );
  }
}
