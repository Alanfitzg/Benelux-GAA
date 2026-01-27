import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clubAdmins = await prisma.user.findMany({
      where: {
        role: "CLUB_ADMIN",
        adminOfClubs: {
          some: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        adminOfClubs: {
          select: {
            id: true,
            name: true,
            country: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Flatten the data - one entry per admin, using their first managed club
    const admins = clubAdmins.map((admin) => {
      const primaryClub = admin.adminOfClubs[0];
      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        clubId: primaryClub?.id || "",
        clubName: primaryClub?.name || "Unknown Club",
        country: primaryClub?.country?.name || null,
      };
    });

    // Sort by country then club name
    admins.sort((a, b) => {
      if (a.country && b.country) {
        const countryCompare = a.country.localeCompare(b.country);
        if (countryCompare !== 0) return countryCompare;
      }
      return a.clubName.localeCompare(b.clubName);
    });

    return NextResponse.json({ admins });
  } catch (error) {
    console.error("Error fetching club admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch club admins" },
      { status: 500 }
    );
  }
}
