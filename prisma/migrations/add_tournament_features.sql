-- Add tournament-specific fields to Event table
ALTER TABLE "Event"
ADD COLUMN "minTeams" INTEGER,
ADD COLUMN "maxTeams" INTEGER,
ADD COLUMN "teamType" TEXT,
ADD COLUMN "format" TEXT;

-- Create TeamStatus enum
CREATE TYPE "TeamStatus" AS ENUM ('REGISTERED', 'CONFIRMED', 'WITHDRAWN');

-- Create MatchStatus enum  
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- Create TournamentTeam table
CREATE TABLE "TournamentTeam" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamType" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TeamStatus" NOT NULL DEFAULT 'REGISTERED',

    CONSTRAINT "TournamentTeam_pkey" PRIMARY KEY ("id")
);

-- Create Match table
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "matchDate" TIMESTAMP(3),
    "venue" TEXT,
    "round" TEXT,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on TournamentTeam
CREATE UNIQUE INDEX "TournamentTeam_eventId_clubId_teamName_key" ON "TournamentTeam"("eventId", "clubId", "teamName");

-- Create foreign key constraints
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Match" ADD CONSTRAINT "Match_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "TournamentTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "TournamentTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;