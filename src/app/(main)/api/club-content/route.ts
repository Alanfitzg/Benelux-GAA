import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clubId = searchParams.get("clubId");
    const pageKey = searchParams.get("pageKey");

    if (!clubId) {
      return NextResponse.json(
        { error: "clubId is required" },
        { status: 400 }
      );
    }

    const where: { clubId: string; pageKey?: string } = { clubId };
    if (pageKey) {
      where.pageKey = pageKey;
    }

    const content = await prisma.clubContent.findMany({
      where,
      select: {
        contentKey: true,
        value: true,
        maxLength: true,
        pageKey: true,
      },
    });

    const contentMap: Record<
      string,
      { value: string; maxLength: number | null }
    > = {};
    content.forEach((item) => {
      const key = pageKey
        ? item.contentKey
        : `${item.pageKey}.${item.contentKey}`;
      contentMap[key] = {
        value: item.value,
        maxLength: item.maxLength,
      };
    });

    return NextResponse.json({ content: contentMap });
  } catch (error) {
    console.error("Error fetching club content:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const isAdmin =
      session.user.role === "SUPER_ADMIN" || session.user.role === "CLUB_ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { clubId, pageKey, contentKey, value, maxLength } = data;

    if (!clubId || !pageKey || !contentKey || value === undefined) {
      return NextResponse.json(
        { error: "clubId, pageKey, contentKey, and value are required" },
        { status: 400 }
      );
    }

    if (maxLength && value.length > maxLength) {
      return NextResponse.json(
        { error: `Content exceeds maximum length of ${maxLength} characters` },
        { status: 400 }
      );
    }

    const content = await prisma.clubContent.upsert({
      where: {
        clubId_pageKey_contentKey: {
          clubId,
          pageKey,
          contentKey,
        },
      },
      update: {
        value,
        maxLength: maxLength || null,
      },
      create: {
        clubId,
        pageKey,
        contentKey,
        value,
        maxLength: maxLength || null,
      },
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error updating club content:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
