import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const priorityWeekendSchema = z.object({
  date: z.string().datetime(),
  message: z.string().min(1).max(500),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: { date?: { gte: Date; lte: Date } } = {};

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const priorityWeekends = await prisma.priorityWeekend.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return NextResponse.json(priorityWeekends);
  } catch (error) {
    console.error("Error fetching priority weekends:", error);
    return NextResponse.json(
      { error: "Failed to fetch priority weekends" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super admins can create priority weekends
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = priorityWeekendSchema.parse(body);

    // Check if priority weekend already exists for this date
    const existing = await prisma.priorityWeekend.findUnique({
      where: { date: new Date(validatedData.date) },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Priority weekend already exists for this date" },
        { status: 400 }
      );
    }

    const priorityWeekend = await prisma.priorityWeekend.create({
      data: {
        date: new Date(validatedData.date),
        message: validatedData.message,
        createdBy: session.user.id,
      },
    });

    // Send alerts to all European clubs
    await sendPriorityWeekendAlerts(priorityWeekend);

    return NextResponse.json(priorityWeekend, { status: 201 });
  } catch (error) {
    console.error("Error creating priority weekend:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create priority weekend" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super admins can delete priority weekends
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.priorityWeekend.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting priority weekend:", error);
    return NextResponse.json(
      { error: "Failed to delete priority weekend" },
      { status: 500 }
    );
  }
}

async function sendPriorityWeekendAlerts(priorityWeekend: {
  date: Date;
  message: string;
}) {
  // Get all mainland Europe clubs
  const clubs = await prisma.club.findMany({
    where: { isMainlandEurope: true },
    include: {
      admins: {
        select: { email: true, name: true },
      },
    },
  });

  // This will be expanded to send actual email alerts
  console.log(
    `Sending priority weekend alerts to ${clubs.length} clubs for date: ${priorityWeekend.date}`
  );
  console.log(`Message: ${priorityWeekend.message}`);

  // TODO: Implement actual email sending logic
}
