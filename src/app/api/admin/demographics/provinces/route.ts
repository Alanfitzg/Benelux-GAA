import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provinces = await prisma.demographicsProvince.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        counties: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ provinces });
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return NextResponse.json(
      { error: "Failed to fetch provinces" },
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
        { error: "Province ID is required" },
        { status: 400 }
      );
    }

    const province = await prisma.demographicsProvince.update({
      where: { id },
      data,
      include: {
        counties: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ province });
  } catch (error) {
    console.error("Error updating province:", error);
    return NextResponse.json(
      { error: "Failed to update province" },
      { status: 500 }
    );
  }
}
