import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import fs from "fs"
import path from "path"

const BACKUP_DIR = "./backups"

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireSuperAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      )
    }

    // Security: Only allow deleting files that start with our prefix
    if (!filename.startsWith('gaelic-trips-backup-')) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      )
    }

    const filePath = path.join(BACKUP_DIR, filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Backup file not found" },
        { status: 404 }
      )
    }

    // Delete the file
    fs.unlinkSync(filePath)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Delete failed:", error)
    return NextResponse.json(
      { error: "Failed to delete backup" },
      { status: 500 }
    )
  }
}