import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["SUPER_ADMIN", "GUEST_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const internationalUnits = await prisma.internationalUnit.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    return NextResponse.json({ internationalUnits });
  } catch (error) {
    console.error("Error fetching international units:", error);
    return NextResponse.json(
      { error: "Failed to fetch international units" },
      { status: 500 }
    );
  }
}
