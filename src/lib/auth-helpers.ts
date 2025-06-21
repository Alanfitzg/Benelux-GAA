import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export async function getServerSession() {
  return await auth()
}

export async function requireAuth() {
  const session = await getServerSession()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }
  
  return session
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getServerSession()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }
  
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    )
  }
  
  return session
}

export async function requireSuperAdmin() {
  return requireRole([UserRole.SUPER_ADMIN])
}

export async function requireClubAdmin() {
  return requireRole([UserRole.SUPER_ADMIN, UserRole.CLUB_ADMIN])
}