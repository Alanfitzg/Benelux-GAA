import { NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import fs from "fs"
import path from "path"

const BACKUP_DIR = "./backups"

export async function GET() {
  try {
    const authResult = await requireSuperAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    // Get local backup files
    const localBackups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('gaelic-trips-backup-'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file)
        const stats = fs.statSync(filePath)
        return {
          filename: file,
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          created: stats.mtime.toISOString(),
          type: 'local' as const
        }
      })
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

    // Note: In a full implementation, you would also list S3 backups here
    // For now, we'll just return local backups
    const backups = [...localBackups]

    return NextResponse.json({ backups })
  } catch (error) {
    console.error("Error listing backups:", error)
    return NextResponse.json(
      { error: "Failed to list backups" },
      { status: 500 }
    )
  }
}