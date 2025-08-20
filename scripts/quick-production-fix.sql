-- Quick Production Fix - Minimal changes to get the app working
-- This adds only the essential columns that are causing errors

-- 1. Add status column with default value
ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'UPCOMING';

-- 2. Add visibility column with default value
ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "visibility" TEXT DEFAULT 'PUBLIC';

-- 3. Add other tournament-related columns that might be queried
ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "bracketType" TEXT;

ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "bracketData" JSONB;

ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "divisions" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "maxTeamsPerClub" INTEGER DEFAULT 1;

ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "minTeams" INTEGER;

ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "maxTeams" INTEGER;

ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "acceptedTeamTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS "pitchLocationId" TEXT;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Event' 
AND column_name IN ('status', 'visibility');