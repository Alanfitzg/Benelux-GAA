-- Add club association to User table
ALTER TABLE "User" ADD COLUMN "clubId" TEXT;

-- Add foreign key constraint
ALTER TABLE "User" ADD CONSTRAINT "User_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;