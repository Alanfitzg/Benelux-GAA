import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "clubId is required" }, { status: 400 });
  }

  const images = await prisma.galleryImage.findMany({
    where: { clubId },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(images);
}

export async function POST(request: NextRequest) {
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

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const clubId = formData.get("clubId") as string;
  const caption = formData.get("caption") as string | null;

  if (!file || !clubId) {
    return NextResponse.json(
      { error: "file and clubId are required" },
      { status: 400 }
    );
  }

  const maxCount = await prisma.galleryImage.count({ where: { clubId } });
  const sortOrder = maxCount;

  const blob = await put(`gallery/${clubId}/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  const image = await prisma.galleryImage.create({
    data: {
      clubId,
      url: blob.url,
      caption,
      sortOrder,
      uploadedBy: session.user.id,
    },
  });

  return NextResponse.json(image);
}

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
  const { id, caption, sortOrder } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updateData: { caption?: string; sortOrder?: number } = {};
  if (caption !== undefined) updateData.caption = caption;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

  const image = await prisma.galleryImage.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(image);
}

export async function DELETE(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  await del(image.url);
  await prisma.galleryImage.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
