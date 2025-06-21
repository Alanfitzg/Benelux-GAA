#!/usr/bin/env node

/**
 * Daily Automated Backup Script
 * 
 * This script should be run daily via cron job or similar scheduler.
 * It creates a compressed database backup and uploads it to S3.
 * 
 * Setup Instructions:
 * 1. Add to crontab: 0 2 * * * cd /path/to/gaelic-trips && npm run backup:daily
 * 2. Add to package.json scripts: "backup:daily": "tsx scripts/daily-backup.ts"
 * 
 * Environment Variables Required:
 * - DATABASE_URL
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_REGION
 * - S3_BUCKET_NAME
 */

import { DatabaseBackup } from './backup-database'

async function runDailyBackup() {
  console.log(`🕐 Starting daily backup at ${new Date().toISOString()}`)
  
  try {
    const backup = new DatabaseBackup()
    
    // Test database connection first
    const isConnected = await backup.testConnection()
    if (!isConnected) {
      throw new Error("Database connection failed")
    }
    
    // Create backup with S3 upload
    const backupPath = await backup.createBackup({
      uploadToS3: true,
      verbose: true,
      compress: true
    })
    
    console.log(`✅ Daily backup completed successfully: ${backupPath}`)
    
    // Send notification (you could extend this to send email/Slack notifications)
    if (process.env.NODE_ENV === 'production') {
      console.log("📧 In production, this would send a success notification")
    }
    
  } catch (error) {
    console.error(`❌ Daily backup failed: ${error}`)
    
    // Send failure notification (you could extend this to send alerts)
    if (process.env.NODE_ENV === 'production') {
      console.error("🚨 In production, this would send a failure alert")
    }
    
    process.exit(1)
  }
}

// Run the backup
runDailyBackup()