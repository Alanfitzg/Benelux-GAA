import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import fs from "fs"
import path from "path"

const BACKUP_DIR = "./backups"

export async function GET(request: NextRequest) {
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

    // Security: Only allow downloading files that start with our prefix
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

    // Read file and return as download
    const fileBuffer = fs.readFileSync(filePath)
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': filename.endsWith('.gz') ? 'application/gzip' : 'text/plain',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error("Download failed:", error)
    return NextResponse.json(
      { error: "Failed to download backup" },
      { status: 500 }
    )
  }
}