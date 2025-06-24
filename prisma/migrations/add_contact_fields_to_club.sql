-- Add contact fields to Club table
ALTER TABLE "Club" ADD COLUMN "contactFirstName" TEXT;
ALTER TABLE "Club" ADD COLUMN "contactLastName" TEXT;
ALTER TABLE "Club" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "Club" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "Club" ADD COLUMN "contactCountryCode" TEXT;
ALTER TABLE "Club" ADD COLUMN "isContactWilling" BOOLEAN DEFAULT false;