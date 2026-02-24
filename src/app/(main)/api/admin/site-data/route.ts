import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

const VALID_KEYS = ["fixtures", "standings", "timeline", "news"];

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (!key || !VALID_KEYS.includes(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const record = await prisma.siteData.findUnique({ where: { key } });

  return NextResponse.json({ key, data: record?.data ?? null });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { key, data } = body;

  if (!key || !VALID_KEYS.includes(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const record = await prisma.siteData.upsert({
    where: { key },
    update: { data },
    create: { key, data },
  });

  return NextResponse.json({ key, data: record.data });
}
