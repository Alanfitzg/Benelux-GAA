import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all clubs where the user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        adminOfClubs: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ 
      clubs: user?.adminOfClubs || [] 
    });
  } catch (error) {
    console.error("Error fetching admin clubs:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin clubs" },
      { status: 500 }
    );
  }
}