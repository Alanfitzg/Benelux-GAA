import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await prisma.demographicsReportSummary.findFirst();

    if (!summary) {
      return NextResponse.json(
        { error: "Report summary not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error fetching report summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch report summary" },
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
        { error: "Summary ID is required" },
        { status: 400 }
      );
    }

    const summary = await prisma.demographicsReportSummary.update({
      where: { id },
      data,
    });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error updating report summary:", error);
    return NextResponse.json(
      { error: "Failed to update report summary" },
      { status: 500 }
    );
  }
}
