import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all clubs that have a twin club relationship
    const twinRelationships = await prisma.club.findMany({
      where: {
        twinClubId: { not: null },
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        location: true,
        twinClub: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            location: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format the relationships as pairs
    const relationships = twinRelationships.map((club) => ({
      club: {
        id: club.id,
        name: club.name,
        imageUrl: club.imageUrl,
        location: club.location,
      },
      twinClub: club.twinClub,
    }));

    return NextResponse.json({
      total: relationships.length,
      relationships,
    });
  } catch (error) {
    console.error("Error fetching twin clubs:", error);
    return NextResponse.json(
      { error: "Failed to fetch twin clubs" },
      { status: 500 }
    );
  }
}
