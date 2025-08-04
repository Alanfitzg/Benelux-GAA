# Database Backup & Restore Guide

This guide explains how to backup and restore your PlayAway database data safely.

## 🎯 Overview

The backup system consists of two scripts:
- **`export-current-data.ts`** - Creates a complete backup of your current database
- **`restore-data.ts`** - Safely restores data from a backup (never overwrites existing data)

## 📦 Creating a Backup

### Full Database Export
Creates a timestamped backup of all your database data:

```bash
npx tsx scripts/export-current-data.ts
```

This will:
- Create a new folder in `backups/export-[timestamp]/`
- Export all tables to JSON files
- Create a summary with record counts
- Include all relationships and data

### What Gets Backed Up
- ✅ Users (with preferences, admin requests, OAuth accounts)
- ✅ Clubs (with events, availability slots, tournament interests)  
- ✅ Events (with club references)
- ✅ Feature Flags
- ✅ Surveys
- ✅ Availability Slots
- ✅ Tournament Interests
- ✅ Club Admin Requests
- ✅ Password Reset Tokens

## 🔄 Restoring from Backup

### Safe Restore (Recommended)
Restores missing data without overwriting existing records:

```bash
npx tsx scripts/restore-data.ts backups/export-2025-08-03T10-30-00-000Z
```

### Safety Features
- ⚠️ **NEVER OVERWRITES** existing data
- ✅ Only adds missing records
- ✅ Preserves all current data
- ✅ Handles data relationships correctly
- ✅ Converts date strings back to Date objects

### Restore Order
The script automatically restores data in the correct order:
1. Feature Flags (no dependencies)
2. Users (before clubs that might reference users)
3. Clubs (before events that reference clubs)
4. Events (references clubs)
5. Surveys
6. Additional tables (availability slots, etc.)

## 📁 Backup Structure

Each backup creates a folder with these files:

```
backups/export-2025-08-03T10-30-00-000Z/
├── export-summary.json          # Backup metadata and counts
├── users.json                   # All users with preferences
├── clubs.json                   # All clubs with relationships
├── events.json                  # All events
├── feature-flags.json           # Feature flags
├── surveys.json                 # Survey responses
├── availability-slots.json      # Club availability data
├── tournament-interests.json    # Tournament interest submissions
└── club-admin-requests.json     # Admin access requests
```

## 🛡️ Safety Guarantees

### Export Script
- ✅ Read-only operation
- ✅ No database modifications
- ✅ Includes all related data
- ✅ Creates timestamped backups

### Restore Script
- ✅ Never overwrites existing data
- ✅ Only adds missing records
- ✅ Preserves data integrity
- ✅ Handles duplicate detection safely
- ✅ Maintains foreign key relationships

## 🔧 Common Use Cases

### 1. Regular Backups
Create daily/weekly backups for safety:

```bash
# Create backup with current timestamp
npx tsx scripts/export-current-data.ts
```

### 2. Before Major Changes
Backup before database migrations or major updates:

```bash
npx tsx scripts/export-current-data.ts
# Make your changes
# If something goes wrong, restore with:
npx tsx scripts/restore-data.ts backups/export-[timestamp]
```

### 3. Environment Sync
Copy production data to staging safely:

```bash
# On production: create backup
npx tsx scripts/export-current-data.ts

# Copy backup folder to staging
# On staging: restore (adds missing data only)
npx tsx scripts/restore-data.ts backups/export-[timestamp]
```

### 4. Disaster Recovery
Restore from backup after data loss:

```bash
npx tsx scripts/restore-data.ts backups/export-[timestamp]
```

## 📊 Monitoring Restores

The restore script provides detailed output:

```
🚀 Starting data restore from: backups/export-2025-08-03T10-30-00-000Z
📊 Backup summary: {users: 150, clubs: 45, events: 23, ...}
👥 Restoring users...
✅ Restored 12 users (138 already existed)
🏟️ Restoring clubs...
✅ Restored 3 clubs (42 already existed)
🎯 Restoring events...
✅ Restored 0 events (23 already existed)
🎉 Data restore completed successfully!
📊 Total records restored: 15
✅ All existing data was preserved (no overwrites)
```

## ⚠️ Important Notes

1. **Timestamps Matter**: Backup folders include timestamps to avoid conflicts
2. **No Overwriting**: The restore script will NEVER modify existing data
3. **Relationships**: All foreign key relationships are preserved
4. **Date Handling**: Date strings are properly converted back to Date objects
5. **Missing Files**: Script handles missing backup files gracefully

## 🚨 Troubleshooting

### "Backup directory not found"
```bash
# Check if the path is correct
ls -la backups/
# Use the exact folder name from the backup
npx tsx scripts/restore-data.ts backups/export-2025-08-03T10-30-00-000Z
```

### "No [table] backup found"
This is normal - the script will skip missing files and continue with others.

### Duplicate Detection
The script uses these fields to detect duplicates:
- **Users**: email address
- **Clubs**: name + location combination
- **Events**: title + startDate + location combination
- **Others**: appropriate unique combinations per table

## 🔮 Future Enhancements

Potential improvements for the backup system:
- Automated scheduled backups
- Compression for large datasets
- Incremental backups (only changes)
- Cloud storage integration
- Backup verification/validation
- Selective table backup/restore

---

**Created**: August 2025  
**Last Updated**: August 2025  
**Scripts**: `export-current-data.ts`, `restore-data.ts`