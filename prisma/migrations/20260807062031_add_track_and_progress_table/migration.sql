-- CreateEnum
CREATE TYPE "ShowTrackingStatus" AS ENUM ('PLAN_TO_WATCH', 'WATCHING', 'COMPLETED', 'DROPPED');

-- CreateTable
CREATE TABLE "ShowTracking" (
    "id" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "status" "ShowTrackingStatus" NOT NULL DEFAULT 'PLAN_TO_WATCH',
    "rating" INTEGER,
    "notes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EpisodeProgress" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "watchedAt" TIMESTAMP(3),
    "rating" INTEGER,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EpisodeProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShowTracking_showId_key" ON "ShowTracking"("showId");

-- CreateIndex
CREATE UNIQUE INDEX "EpisodeProgress_episodeId_key" ON "EpisodeProgress"("episodeId");

-- AddForeignKey
ALTER TABLE "ShowTracking" ADD CONSTRAINT "ShowTracking_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeProgress" ADD CONSTRAINT "EpisodeProgress_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
