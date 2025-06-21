import { execSync } from "child_process"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import fs from "fs"
import path from "path"

// Configuration
const BACKUP_DIR = "./backups"
const MAX_LOCAL_BACKUPS = 7 // Keep last 7 local backups
const MAX_S3_BACKUPS = 30 // Keep last 30 S3 backups

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

interface BackupOptions {
  uploadToS3?: boolean
  verbose?: boolean
  compress?: boolean
}

class DatabaseBackup {
  private backupDir: string
  private dbUrl: string
  private s3Bucket: string

  constructor() {
    this.backupDir = BACKUP_DIR
    this.dbUrl = process.env.DATABASE_URL!
    this.s3Bucket = process.env.S3_BUCKET_NAME!

    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }
  }

  private generateBackupFilename(compressed = false): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const extension = compressed ? ".sql.gz" : ".sql"
    return `gaelic-trips-backup-${timestamp}${extension}`
  }

  private log(message: string, verbose = true) {
    if (verbose) {
      console.log(`[${new Date().toISOString()}] ${message}`)
    }
  }

  async createBackup(options: BackupOptions = {}): Promise<string> {
    const { uploadToS3 = false, verbose = true, compress = true } = options
    
    try {
      this.log("🗄️  Starting database backup...", verbose)
      
      // Generate filename
      const filename = this.generateBackupFilename(compress)
      const backupPath = path.join(this.backupDir, filename)
      
      // Create pg_dump command
      let command = `pg_dump "${this.dbUrl}" --verbose --clean --no-acl --no-owner`
      
      if (compress) {
        command += ` | gzip > "${backupPath}"`
      } else {
        command += ` > "${backupPath}"`
      }

      this.log(`📦 Creating backup: ${filename}`, verbose)
      
      // Execute backup
      execSync(command, { 
        stdio: verbose ? 'inherit' : 'pipe',
        encoding: 'utf8'
      })
      
      // Verify backup file was created and has content
      const stats = fs.statSync(backupPath)
      if (stats.size === 0) {
        throw new Error("Backup file is empty")
      }
      
      this.log(`✅ Backup created successfully: ${(stats.size / 1024 / 1024).toFixed(2)} MB`, verbose)
      
      // Upload to S3 if requested
      if (uploadToS3) {
        await this.uploadToS3(backupPath, filename, verbose)
      }
      
      // Clean up old backups
      await this.cleanupOldBackups(verbose)
      
      this.log("🎉 Backup process completed successfully!", verbose)
      
      return backupPath
      
    } catch (error) {
      this.log(`❌ Backup failed: ${error}`, verbose)
      throw error
    }
  }

  private async uploadToS3(filePath: string, filename: string, verbose = true): Promise<void> {
    try {
      this.log("☁️  Uploading backup to S3...", verbose)
      
      const fileContent = fs.readFileSync(filePath)
      const s3Key = `backups/database/${filename}`
      
      const command = new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
        Body: fileContent,
        ContentType: filename.endsWith('.gz') ? 'application/gzip' : 'text/plain',
        Metadata: {
          'backup-type': 'database',
          'created-at': new Date().toISOString(),
          'application': 'gaelic-trips'
        }
      })
      
      await s3Client.send(command)
      this.log(`✅ Backup uploaded to S3: s3://${this.s3Bucket}/${s3Key}`, verbose)
      
    } catch (error) {
      this.log(`❌ S3 upload failed: ${error}`, verbose)
      throw error
    }
  }

  private async cleanupOldBackups(verbose = true): Promise<void> {
    try {
      this.log("🧹 Cleaning up old local backups...", verbose)
      
      // Get all backup files
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('gaelic-trips-backup-') && (file.endsWith('.sql') || file.endsWith('.sql.gz')))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          created: fs.statSync(path.join(this.backupDir, file)).mtime
        }))
        .sort((a, b) => b.created.getTime() - a.created.getTime())
      
      // Remove old local backups
      if (files.length > MAX_LOCAL_BACKUPS) {
        const filesToDelete = files.slice(MAX_LOCAL_BACKUPS)
        for (const file of filesToDelete) {
          fs.unlinkSync(file.path)
          this.log(`🗑️  Deleted old backup: ${file.name}`, verbose)
        }
      }
      
    } catch (error) {
      this.log(`⚠️  Cleanup warning: ${error}`, verbose)
    }
  }

  async listBackups(): Promise<Array<{ filename: string; size: string; created: Date }>> {
    const files = fs.readdirSync(this.backupDir)
      .filter(file => file.startsWith('gaelic-trips-backup-'))
      .map(file => {
        const filePath = path.join(this.backupDir, file)
        const stats = fs.statSync(filePath)
        return {
          filename: file,
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          created: stats.mtime
        }
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime())
    
    return files
  }

  async testConnection(): Promise<boolean> {
    try {
      // Check if PostgreSQL tools are available
      execSync('which pg_dump', { stdio: 'pipe' })
      execSync('which psql', { stdio: 'pipe' })
      
      // Test actual database connection with a simple query
      execSync(`psql "${this.dbUrl}" -c "SELECT 1;" -t`, { stdio: 'pipe' })
      return true
    } catch {
      return false
    }
  }
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2)
  const uploadToS3 = args.includes('--s3')
  const listOnly = args.includes('--list')
  const testOnly = args.includes('--test')
  const quiet = args.includes('--quiet')

  const backup = new DatabaseBackup()

  if (testOnly) {
    console.log("🔍 Testing database connection...")
    const isConnected = await backup.testConnection()
    if (isConnected) {
      console.log("✅ Database connection successful!")
      process.exit(0)
    } else {
      console.log("❌ Database connection failed!")
      process.exit(1)
    }
  }

  if (listOnly) {
    console.log("📋 Available backups:")
    const backups = await backup.listBackups()
    if (backups.length === 0) {
      console.log("No backups found.")
    } else {
      backups.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.filename} (${file.size}) - ${file.created.toLocaleString()}`)
      })
    }
    return
  }

  try {
    const backupPath = await backup.createBackup({
      uploadToS3,
      verbose: !quiet,
      compress: true
    })
    
    if (quiet) {
      console.log(backupPath)
    }
    
  } catch (error) {
    console.error("Backup failed:", error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { DatabaseBackup }