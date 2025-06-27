import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await prisma.surveyResponse.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
          },
        },
      },
    });

    if (!response) {
      return NextResponse.json({ error: "Survey response not found" }, { status: 404 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching survey response:", error);
    return NextResponse.json(
      { error: "Failed to fetch survey response" },
      { status: 500 }
    );
  }
}