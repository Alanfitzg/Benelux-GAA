import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireGuestAdmin } from "@/lib/auth-helpers"
import { createUser } from "@/lib/user"
import { UserRole } from "@prisma/client"
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

async function getUsersHandler() {
  try {
    const authResult = await requireGuestAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const users = await prisma.user.findMany({
      include: {
        adminOfClubs: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

async function createUserHandler(request: NextRequest) {
  try {
    const authResult = await requireGuestAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { email, username, password, name, role, clubIds } = body

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Email, username, and password are required" },
        { status: 400 }
      )
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }

    const user = await createUser(email, username, password, name, role)

    // If role is CLUB_ADMIN and clubIds are provided, connect the clubs
    if (role === UserRole.CLUB_ADMIN && clubIds && clubIds.length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          adminOfClubs: {
            connect: clubIds.map((id: string) => ({ id })),
          },
        },
      })
    }

    // Fetch the created user with clubs
    const createdUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        adminOfClubs: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      user: {
        id: createdUser!.id,
        email: createdUser!.email,
        username: createdUser!.username,
        name: createdUser!.name,
        role: createdUser!.role,
        createdAt: createdUser!.createdAt,
        adminOfClubs: createdUser!.adminOfClubs,
      },
    })
  } catch (error: unknown) {
    console.error("Error creating user:", error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      const meta = error as { meta?: { target?: string[] } }
      const field = meta.meta?.target?.includes("email") ? "email" : "username"
      return NextResponse.json(
        { error: `This ${field} is already taken` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}

// Apply rate limiting to admin user endpoints
export const GET = withRateLimit(RATE_LIMITS.ADMIN, getUsersHandler);
export const POST = withRateLimit(RATE_LIMITS.ADMIN, createUserHandler);