import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/auth-helpers"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireSuperAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const clubId = params.id
    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      )
    }

    // Validate that the club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    })

    if (!club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      )
    }

    // Update the club with the new image URL
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: { imageUrl },
    })

    return NextResponse.json({
      club: {
        id: updatedClub.id,
        name: updatedClub.name,
        imageUrl: updatedClub.imageUrl,
      },
    })
  } catch (error) {
    console.error("Error updating club image:", error)
    return NextResponse.json(
      { error: "Failed to update club image" },
      { status: 500 }
    )
  }
}