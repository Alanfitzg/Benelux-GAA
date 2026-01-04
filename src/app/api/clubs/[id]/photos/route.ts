import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";

const MAX_PHOTOS = 3;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const photos = await prisma.clubPhoto.findMany({
      where: { clubId: id },
      orderBy: { order: "asc" },
      take: MAX_PHOTOS,
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching club photos:", error);
    return NextResponse.json(
      { error: "Error fetching photos" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    // Check if user is admin of this club or super admin
    const club = await prisma.club.findFirst({
      where: {
        id,
        OR: [
          { admins: { some: { id: session.user.id } } },
          { id: session.user.role === "SUPER_ADMIN" ? id : undefined },
        ],
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check current photo count
    const currentCount = await prisma.clubPhoto.count({
      where: { clubId: id },
    });

    if (currentCount >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_PHOTOS} photos allowed` },
        { status: 400 }
      );
    }

    const { url, caption } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Photo URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Get the next order number
    const maxOrder = await prisma.clubPhoto.aggregate({
      where: { clubId: id },
      _max: { order: true },
    });

    const photo = await prisma.clubPhoto.create({
      data: {
        clubId: id,
        url,
        caption: caption || null,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Error adding club photo:", error);
    return NextResponse.json({ error: "Error adding photo" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { searchParams } = new URL(req.url);
  const photoId = searchParams.get("photoId");

  if (!photoId) {
    return NextResponse.json(
      { error: "Photo ID is required" },
      { status: 400 }
    );
  }

  try {
    // Check if user is admin of this club or super admin
    const club = await prisma.club.findFirst({
      where: {
        id,
        OR: [
          { admins: { some: { id: session.user.id } } },
          { id: session.user.role === "SUPER_ADMIN" ? id : undefined },
        ],
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify photo belongs to this club
    const photo = await prisma.clubPhoto.findFirst({
      where: { id: photoId, clubId: id },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    await prisma.clubPhoto.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting club photo:", error);
    return NextResponse.json(
      { error: "Error deleting photo" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    // Check if user is admin of this club or super admin
    const club = await prisma.club.findFirst({
      where: {
        id,
        OR: [
          { admins: { some: { id: session.user.id } } },
          { id: session.user.role === "SUPER_ADMIN" ? id : undefined },
        ],
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { photoId, caption, order } = await req.json();

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 }
      );
    }

    // Verify photo belongs to this club
    const photo = await prisma.clubPhoto.findFirst({
      where: { id: photoId, clubId: id },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const updateData: { caption?: string | null; order?: number } = {};
    if (caption !== undefined) updateData.caption = caption;
    if (order !== undefined) updateData.order = order;

    const updatedPhoto = await prisma.clubPhoto.update({
      where: { id: photoId },
      data: updateData,
    });

    return NextResponse.json(updatedPhoto);
  } catch (error) {
    console.error("Error updating club photo:", error);
    return NextResponse.json(
      { error: "Error updating photo" },
      { status: 500 }
    );
  }
}
