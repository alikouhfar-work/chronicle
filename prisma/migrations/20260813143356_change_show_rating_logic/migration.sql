/*
  Warnings:

  - You are about to drop the column `notes` on the `ShowTracking` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `ShowTracking` table. All the data in the column will be lost.
  - You are about to drop the `EpisodeProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EpisodeProgress" DROP CONSTRAINT "EpisodeProgress_episodeId_fkey";

-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "tagline" TEXT;

-- AlterTable
ALTER TABLE "ShowTracking" DROP COLUMN "notes",
DROP COLUMN "rating";

-- DropTable
DROP TABLE "EpisodeProgress";

-- CreateTable
CREATE TABLE "EpisodeTracking" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "watchedAt" TIMESTAMP(3),
    "rating" INTEGER,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EpisodeTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EpisodeTracking_episodeId_key" ON "EpisodeTracking"("episodeId");

-- AddForeignKey
ALTER TABLE "EpisodeTracking" ADD CONSTRAINT "EpisodeTracking_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
