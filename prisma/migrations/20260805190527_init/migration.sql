-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "firstAirDate" TIMESTAMP(3),
    "lastAirDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "numberOfSeasons" INTEGER NOT NULL,
    "numberOfEpisodes" INTEGER NOT NULL,
    "voteAverage" DOUBLE PRECISION NOT NULL,
    "popularity" DOUBLE PRECISION NOT NULL,
    "inProduction" BOOLEAN NOT NULL,
    "homepage" TEXT,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "showId" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "posterPath" TEXT,
    "airDate" TIMESTAMP(3),
    "episodeCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "seasonId" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "runtime" INTEGER,
    "stillPath" TEXT,
    "airDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GenreToShow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GenreToShow_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Show_tmdbId_key" ON "Show"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_tmdbId_key" ON "Season"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_showId_seasonNumber_key" ON "Season"("showId", "seasonNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_tmdbId_key" ON "Episode"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_seasonId_episodeNumber_key" ON "Episode"("seasonId", "episodeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_tmdbId_key" ON "Genre"("tmdbId");

-- CreateIndex
CREATE INDEX "_GenreToShow_B_index" ON "_GenreToShow"("B");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToShow" ADD CONSTRAINT "_GenreToShow_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToShow" ADD CONSTRAINT "_GenreToShow_B_fkey" FOREIGN KEY ("B") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;
