-- CreateEnum
CREATE TYPE "MovieTrackingStatus" AS ENUM ('PLAN_TO_WATCH', 'WATCHING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "releaseDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "runtime" INTEGER NOT NULL,
    "tagline" TEXT,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieTracking" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "status" "MovieTrackingStatus" NOT NULL DEFAULT 'PLAN_TO_WATCH',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GenreToMovie" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GenreToMovie_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "MovieTracking_movieId_key" ON "MovieTracking"("movieId");

-- CreateIndex
CREATE INDEX "_GenreToMovie_B_index" ON "_GenreToMovie"("B");

-- AddForeignKey
ALTER TABLE "MovieTracking" ADD CONSTRAINT "MovieTracking_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToMovie" ADD CONSTRAINT "_GenreToMovie_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToMovie" ADD CONSTRAINT "_GenreToMovie_B_fkey" FOREIGN KEY ("B") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
