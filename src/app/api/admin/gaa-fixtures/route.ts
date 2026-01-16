import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-helpers";

// GET - Fetch all GAA fixtures (optionally filtered by year)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");

    const fixtures = await prisma.gAAFixture.findMany({
      where: year ? { year: parseInt(year) } : undefined,
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ fixtures });
  } catch (error) {
    console.error("Error fetching GAA fixtures:", error);
    return NextResponse.json(
      { error: "Failed to fetch fixtures" },
      { status: 500 }
    );
  }
}

// POST - Create a new GAA fixture (super admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Super admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { date, endDate, title, description, impact, year } = body;

    if (!date || !title || !year) {
      return NextResponse.json(
        { error: "Date, title, and year are required" },
        { status: 400 }
      );
    }

    const fixture = await prisma.gAAFixture.create({
      data: {
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        title,
        description,
        impact: impact || "HIGH",
        year,
      },
    });

    return NextResponse.json({ fixture });
  } catch (error) {
    console.error("Error creating GAA fixture:", error);
    return NextResponse.json(
      { error: "Failed to create fixture" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a GAA fixture (super admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Super admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Fixture ID is required" },
        { status: 400 }
      );
    }

    await prisma.gAAFixture.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting GAA fixture:", error);
    return NextResponse.json(
      { error: "Failed to delete fixture" },
      { status: 500 }
    );
  }
}
