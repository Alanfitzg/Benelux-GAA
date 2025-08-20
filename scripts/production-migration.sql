-- Production Database Migration Script
-- This script adds missing columns and tables to align production with staging
-- Run this script on the production database to fix schema mismatches

-- 1. Add EventStatus enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add BracketType enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "BracketType" AS ENUM ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'GROUP_STAGE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Add TournamentVisibility enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "TournamentVisibility" AS ENUM ('PUBLIC', 'PRIVATE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Add missing columns to Event table
-- Check and add status column
ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "status" "EventStatus" DEFAULT 'UPCOMING';

-- Check and add visibility column
ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "visibility" "TournamentVisibility" DEFAULT 'PUBLIC';

-- Check and add bracket-related columns
ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "bracketType" "BracketType";

ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "bracketData" JSONB;

-- Check and add divisions column
ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "divisions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Check and add maxTeamsPerClub column
ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "maxTeamsPerClub" INTEGER DEFAULT 1;

-- Check and add minTeams column
ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "minTeams" INTEGER;

-- Check and add maxTeams column
ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "maxTeams" INTEGER;

-- Check and add acceptedTeamTypes column
ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "acceptedTeamTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Check and add pitchLocationId column
ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "pitchLocationId" TEXT;

-- 5. Create EventPitchLocation table if it doesn't exist
CREATE TABLE IF NOT EXISTS "EventPitchLocation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "pitchLocationId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventPitchLocation_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint if it doesn't exist
DO $$ BEGIN
    ALTER TABLE "EventPitchLocation" 
    ADD CONSTRAINT "EventPitchLocation_eventId_pitchLocationId_key" 
    UNIQUE ("eventId", "pitchLocationId");
EXCEPTION
    WHEN duplicate_table THEN null;
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "EventPitchLocation_eventId_idx" ON "EventPitchLocation"("eventId");
CREATE INDEX IF NOT EXISTS "EventPitchLocation_pitchLocationId_idx" ON "EventPitchLocation"("pitchLocationId");

-- Add foreign key constraints if they don't exist
DO $$ BEGIN
    ALTER TABLE "EventPitchLocation" 
    ADD CONSTRAINT "EventPitchLocation_eventId_fkey" 
    FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "EventPitchLocation" 
    ADD CONSTRAINT "EventPitchLocation_pitchLocationId_fkey" 
    FOREIGN KEY ("pitchLocationId") REFERENCES "PitchLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add foreign key for Event.pitchLocationId if it doesn't exist
DO $$ BEGIN
    ALTER TABLE "Event" 
    ADD CONSTRAINT "Event_pitchLocationId_fkey" 
    FOREIGN KEY ("pitchLocationId") REFERENCES "PitchLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Create indexes on Event table if they don't exist
CREATE INDEX IF NOT EXISTS "Event_startDate_eventType_idx" ON "Event"("startDate", "eventType");

-- 7. Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'Event' 
    AND column_name IN ('status', 'visibility', 'bracketType', 'bracketData', 'divisions', 'maxTeamsPerClub', 'minTeams', 'maxTeams', 'acceptedTeamTypes', 'pitchLocationId')
ORDER BY 
    ordinal_position;