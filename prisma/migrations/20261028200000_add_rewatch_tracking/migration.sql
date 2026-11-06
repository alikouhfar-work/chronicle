-- CreateEnum
CREATE TYPE "RewatchMediaType" AS ENUM ('episode', 'season', 'show', 'movie');

-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "rewatch_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "rewatch_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "rewatch_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "rewatch_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "rewatch_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "media_type" "RewatchMediaType" NOT NULL,
    "media_id" TEXT NOT NULL,
    "rewatched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "show_id" TEXT,
    "season_id" TEXT,
    "episode_id" TEXT,
    "movie_id" TEXT,

    CONSTRAINT "rewatch_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rewatch_logs_user_id_media_type_media_id_rewatched_at_idx" ON "rewatch_logs"("user_id", "media_type", "media_id", "rewatched_at");

-- CreateIndex
CREATE INDEX "rewatch_logs_media_type_media_id_idx" ON "rewatch_logs"("media_type", "media_id");

-- CreateIndex
CREATE INDEX "rewatch_logs_user_id_rewatched_at_idx" ON "rewatch_logs"("user_id", "rewatched_at");

-- CreateIndex
CREATE INDEX "rewatch_logs_show_id_idx" ON "rewatch_logs"("show_id");

-- CreateIndex
CREATE INDEX "rewatch_logs_season_id_idx" ON "rewatch_logs"("season_id");

-- CreateIndex
CREATE INDEX "rewatch_logs_episode_id_idx" ON "rewatch_logs"("episode_id");

-- CreateIndex
CREATE INDEX "rewatch_logs_movie_id_idx" ON "rewatch_logs"("movie_id");

-- AddForeignKey
ALTER TABLE "rewatch_logs" ADD CONSTRAINT "rewatch_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewatch_logs" ADD CONSTRAINT "rewatch_logs_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewatch_logs" ADD CONSTRAINT "rewatch_logs_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewatch_logs" ADD CONSTRAINT "rewatch_logs_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewatch_logs" ADD CONSTRAINT "rewatch_logs_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

