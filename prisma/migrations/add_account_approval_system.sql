-- Create AccountStatus enum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- Add account status fields to User table
ALTER TABLE "User" ADD COLUMN "accountStatus" "AccountStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "User" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "approvedBy" TEXT;
ALTER TABLE "User" ADD COLUMN "rejectionReason" TEXT;

-- Set all existing users to APPROVED status (migration strategy)
UPDATE "User" SET "accountStatus" = 'APPROVED', "approvedAt" = NOW() WHERE "accountStatus" = 'PENDING';