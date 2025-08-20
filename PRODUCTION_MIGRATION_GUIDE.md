# Production Database Migration Guide

## Issue
The production database is missing several columns that exist in the staging database, causing the application to crash with:
```
Error [PrismaClientKnownRequestError]: The column `Event.status` does not exist in the current database.
```

## Root Cause
The staging database has been updated with `prisma db push` but production hasn't received these schema changes.

## Missing Schema Elements

### Event Table Missing Columns:
1. `status` (EventStatus enum) - tracks event lifecycle
2. `visibility` (TournamentVisibility enum) - controls public/private tournaments
3. `bracketType` (BracketType enum) - tournament bracket structure
4. `bracketData` (JSON) - bracket configuration
5. `divisions` (String[]) - tournament divisions
6. `maxTeamsPerClub` (Int) - team limits per club
7. `minTeams` (Int) - minimum teams for tournament
8. `maxTeams` (Int) - maximum teams for tournament
9. `acceptedTeamTypes` (String[]) - allowed team categories
10. `pitchLocationId` (String) - venue association

### Missing Tables:
1. `EventPitchLocation` - Junction table for many-to-many event-pitch relationships

## Solution Options

### Option 1: Quick Fix (Immediate)
Run the quick fix SQL to add missing columns with defaults:
```bash
# Connect to production database and run:
psql $DATABASE_URL < scripts/quick-production-fix.sql
```

This adds the columns as TEXT fields with appropriate defaults to get the app working immediately.

### Option 2: Full Migration (Recommended)
Run the complete migration to align with Prisma schema:
```bash
# Connect to production database and run:
psql $DATABASE_URL < scripts/production-migration.sql
```

This creates proper enums and constraints matching the Prisma schema.

### Option 3: Prisma Push (After backup)
After backing up production data:
```bash
# Backup production first!
pg_dump $PRODUCTION_DATABASE_URL > backup-$(date +%Y%m%d).sql

# Then push schema changes
DATABASE_URL=$PRODUCTION_DATABASE_URL npx prisma db push
```

## Verification
After migration, verify the changes:
```sql
-- Check Event table columns
\d "Event"

-- Check for new enums
\dT

-- Verify specific columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Event'
AND column_name IN ('status', 'visibility', 'bracketType');
```

## Prevention
To prevent future mismatches:
1. Always run schema changes on staging first
2. Create migration scripts for production
3. Use `prisma migrate` instead of `prisma db push` for production
4. Maintain a migration log

## Rollback Plan
If issues occur after migration:
```sql
-- Remove added columns (data will be lost)
ALTER TABLE "Event" 
DROP COLUMN IF EXISTS "status",
DROP COLUMN IF EXISTS "visibility",
DROP COLUMN IF EXISTS "bracketType",
DROP COLUMN IF EXISTS "bracketData",
DROP COLUMN IF EXISTS "divisions",
DROP COLUMN IF EXISTS "maxTeamsPerClub",
DROP COLUMN IF EXISTS "minTeams",
DROP COLUMN IF EXISTS "maxTeams",
DROP COLUMN IF EXISTS "acceptedTeamTypes",
DROP COLUMN IF EXISTS "pitchLocationId";

-- Drop junction table
DROP TABLE IF EXISTS "EventPitchLocation";
```

## Related Files
- `/scripts/quick-production-fix.sql` - Minimal fix to get app working
- `/scripts/production-migration.sql` - Complete schema alignment
- `/prisma/schema.prisma` - Source of truth for database schema