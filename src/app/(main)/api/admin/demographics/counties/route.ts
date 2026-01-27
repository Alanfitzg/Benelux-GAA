import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get("provinceId");

    const where = provinceId ? { provinceId } : {};

    const counties = await prisma.demographicsCounty.findMany({
      where,
      orderBy: { displayOrder: "asc" },
      include: {
        province: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ counties });
  } catch (error) {
    console.error("Error fetching counties:", error);
    return NextResponse.json(
      { error: "Failed to fetch counties" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "County ID is required" },
        { status: 400 }
      );
    }

    const county = await prisma.demographicsCounty.update({
      where: { id },
      data,
      include: {
        province: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await recalculateProvinceTotals(county.provinceId);

    return NextResponse.json({ county });
  } catch (error) {
    console.error("Error updating county:", error);
    return NextResponse.json(
      { error: "Failed to update county" },
      { status: 500 }
    );
  }
}

async function recalculateProvinceTotals(provinceId: string) {
  const counties = await prisma.demographicsCounty.findMany({
    where: { provinceId },
  });

  const totals = counties.reduce(
    (acc, county) => ({
      totalClubsGAA: acc.totalClubsGAA + (county.clubsGAA || 0),
      totalClubsLGFA: acc.totalClubsLGFA + (county.clubsLGFA || 0),
      totalClubsCamogie: acc.totalClubsCamogie + (county.clubsCamogie || 0),
      totalYouthMalePlayers:
        acc.totalYouthMalePlayers + (county.youthMalePlayers || 0),
      totalYouthFemalePlayers:
        acc.totalYouthFemalePlayers + (county.youthFemalePlayers || 0),
      totalFullMalePlayers:
        acc.totalFullMalePlayers + (county.fullMalePlayers || 0),
      totalFullFemalePlayers:
        acc.totalFullFemalePlayers + (county.fullFemalePlayers || 0),
      totalNonPlayers: acc.totalNonPlayers + (county.nonPlayers || 0),
      totalPitches: acc.totalPitches + (county.totalPitches || 0),
      totalPopulation: acc.totalPopulation + (county.populationTotal || 0),
    }),
    {
      totalClubsGAA: 0,
      totalClubsLGFA: 0,
      totalClubsCamogie: 0,
      totalYouthMalePlayers: 0,
      totalYouthFemalePlayers: 0,
      totalFullMalePlayers: 0,
      totalFullFemalePlayers: 0,
      totalNonPlayers: 0,
      totalPitches: 0,
      totalPopulation: 0,
    }
  );

  await prisma.demographicsProvince.update({
    where: { id: provinceId },
    data: totals,
  });
}
