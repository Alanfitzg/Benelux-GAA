import { NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { PrismaClient } from "@prisma/client"

export async function GET() {
  try {
    const authResult = await requireSuperAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Test database connection using Prisma
    const prisma = new PrismaClient()
    await prisma.$connect()
    
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`
    
    await prisma.$disconnect()
    
    return NextResponse.json({ connected: true })

  } catch (error) {
    console.error("Database connection test failed:", error)
    return NextResponse.json({ connected: false })
  }
}