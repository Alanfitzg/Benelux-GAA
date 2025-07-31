import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }

  try {
    // Get user with their club associations
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            location: true,
            imageUrl: true,
          },
        },
        adminOfClubs: {
          select: {
            id: true,
            name: true,
            location: true,
            imageUrl: true,
          },
        },
        clubAdminRequests: {
          where: {
            status: "PENDING",
          },
          include: {
            club: {
              select: {
                id: true,
                name: true,
                location: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Format the response
    const clubs = []
    
    // Add member club if exists
    if (user.club) {
      clubs.push({
        ...user.club,
        role: "member",
      })
    }
    
    // Add admin clubs
    for (const club of user.adminOfClubs) {
      const existingClub = clubs.find(c => c.id === club.id)
      if (existingClub) {
        // User is both member and admin
        existingClub.role = "admin"
      } else {
        clubs.push({
          ...club,
          role: "admin",
        })
      }
    }
    
    // Add pending admin requests
    for (const request of user.clubAdminRequests) {
      clubs.push({
        ...request.club,
        role: "pending",
        pendingRequest: {
          id: request.id,
          status: request.status,
          requestedAt: request.requestedAt,
        },
      })
    }

    return NextResponse.json({ clubs })
  } catch (error) {
    console.error("Error fetching user clubs:", error)
    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    )
  }
}