import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { execSync } from "child_process"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import fs from "fs"
import path from "path"

const BACKUP_DIR = "./backups"

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireSuperAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { uploadToS3 = false } = body

    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `gaelic-trips-backup-${timestamp}.sql.gz`
    const backupPath = path.join(BACKUP_DIR, filename)

    // Check if pg_dump is available
    try {
      execSync('which pg_dump', { stdio: 'pipe' })
    } catch {
      throw new Error("PostgreSQL client tools (pg_dump) are not installed on this system")
    }

    // Create backup command
    const dbUrl = process.env.DATABASE_URL!
    const command = `pg_dump "${dbUrl}" --verbose --clean --no-acl --no-owner | gzip > "${backupPath}"`

    // Execute backup
    execSync(command, { stdio: 'pipe' })

    // Verify backup file was created and has content
    const stats = fs.statSync(backupPath)
    if (stats.size === 0) {
      throw new Error("Backup file is empty")
    }

    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2)

    // Upload to S3 if requested
    if (uploadToS3) {
      try {
        const fileContent = fs.readFileSync(backupPath)
        const s3Key = `backups/database/${filename}`
        
        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: s3Key,
          Body: fileContent,
          ContentType: 'application/gzip',
          Metadata: {
            'backup-type': 'database',
            'created-at': new Date().toISOString(),
            'application': 'gaelic-trips'
          }
        })
        
        await s3Client.send(command)
      } catch (s3Error) {
        console.error("S3 upload failed:", s3Error)
        // Don't fail the entire backup if S3 upload fails
      }
    }

    // Clean up old local backups (keep last 7)
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('gaelic-trips-backup-'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        created: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.created.getTime() - a.created.getTime())

    if (files.length > 7) {
      const filesToDelete = files.slice(7)
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path)
      }
    }

    return NextResponse.json({
      success: true,
      filename,
      size: `${sizeInMB} MB`,
      uploadedToS3: uploadToS3
    })

  } catch (error) {
    console.error("Backup creation failed:", error)
    return NextResponse.json(
      { error: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}