-- DropIndex
DROP INDEX "Episode_tmdbId_key";

-- DropIndex
DROP INDEX "Season_tmdbId_key";

-- CreateIndex
CREATE INDEX "Episode_tmdbId_idx" ON "Episode"("tmdbId");

-- CreateIndex
CREATE INDEX "Season_tmdbId_idx" ON "Season"("tmdbId");
