/*
  Warnings:

  - You are about to drop the column `runtime` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `stillPath` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `airDate` on the `Season` table. All the data in the column will be lost.
  - You are about to drop the column `overview` on the `Season` table. All the data in the column will be lost.
  - You are about to drop the column `posterPath` on the `Season` table. All the data in the column will be lost.
  - You are about to drop the column `homepage` on the `Show` table. All the data in the column will be lost.
  - You are about to drop the column `originalName` on the `Show` table. All the data in the column will be lost.
  - You are about to drop the column `popularity` on the `Show` table. All the data in the column will be lost.
  - You are about to drop the column `voteAverage` on the `Show` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Episode" DROP COLUMN "runtime",
DROP COLUMN "stillPath";

-- AlterTable
ALTER TABLE "Season" DROP COLUMN "airDate",
DROP COLUMN "overview",
DROP COLUMN "posterPath";

-- AlterTable
ALTER TABLE "Show" DROP COLUMN "homepage",
DROP COLUMN "originalName",
DROP COLUMN "popularity",
DROP COLUMN "voteAverage";
