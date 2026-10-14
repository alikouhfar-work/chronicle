-- AlterTable
ALTER TABLE "User" DROP COLUMN "tmdbTokenCiphertext",
DROP COLUMN "tmdbTokenIv",
DROP COLUMN "tmdbTokenUpdatedAt";
