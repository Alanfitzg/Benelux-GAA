import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";
import { withSiteDataGuard } from "@/lib/site-data-guard";

const VALID_KEYS = ["fixtures", "standings", "timeline", "news"];

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (!key || !VALID_KEYS.includes(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const data = await withSiteDataGuard(async () => {
    const record = await prisma.siteData.findUnique({ where: { key } });
    return record?.data ?? null;
  });

  return NextResponse.json({ key, data });
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

  const result = await withSiteDataGuard(async () => {
    const record = await prisma.siteData.upsert({
      where: { key },
      update: { data },
      create: { key, data },
    });
    return record.data;
  });

  return NextResponse.json({ key, data: result });
}
