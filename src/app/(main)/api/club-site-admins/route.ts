import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only SUPER_ADMIN can view/manage club site admins
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "clubId is required" }, { status: 400 });
  }

  const admins = await prisma.clubSiteAdmin.findMany({
    where: { clubId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(admins);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const body = await request.json();
  const { clubId, email, name } = body;

  if (!clubId || !email) {
    return NextResponse.json(
      { error: "clubId and email are required" },
      { status: 400 }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  // Check if already exists
  const existing = await prisma.clubSiteAdmin.findUnique({
    where: { clubId_email: { clubId, email: email.toLowerCase() } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "This email is already an admin" },
      { status: 409 }
    );
  }

  const admin = await prisma.clubSiteAdmin.create({
    data: {
      clubId,
      email: email.toLowerCase(),
      name,
      addedBy: session.user.id,
    },
  });

  return NextResponse.json(admin);
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.clubSiteAdmin.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
