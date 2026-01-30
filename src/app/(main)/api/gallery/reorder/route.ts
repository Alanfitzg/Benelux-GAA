import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

export async function PUT(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "CLUB_ADMIN";
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { imageIds } = body as { imageIds: string[] };

  if (!imageIds || !Array.isArray(imageIds)) {
    return NextResponse.json(
      { error: "imageIds array is required" },
      { status: 400 }
    );
  }

  await prisma.$transaction(
    imageIds.map((id, index) =>
      prisma.galleryImage.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  return NextResponse.json({ success: true });
}
